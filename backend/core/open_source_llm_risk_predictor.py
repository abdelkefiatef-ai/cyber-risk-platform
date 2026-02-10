"""
Open-source LLM assisted risk prediction for raw security logs.

Design goals:
1) Prefer open-source Mistral-family engines.
2) Keep prediction path always available.
3) Learn continuously from multiple log sources.

Engine order:
- Ollama Mistral (local, self-hosted OSS model)
- Transformers Mistral (HF model runtime)
- Deterministic local LLM-style classifier (always available fallback)
"""
from __future__ import annotations

import json
import math
import os
import re
from collections import Counter, defaultdict
from typing import Dict, Iterable, List, Optional, Tuple
from urllib import request, error

from models.risk_models import LogEvent, RiskLevel


class BaseRiskLLMEngine:
    name = "base"

    def predict(self, raw_log: str) -> Optional[Dict]:
        raise NotImplementedError


class OllamaMistralEngine(BaseRiskLLMEngine):
    """Uses a local Ollama-hosted Mistral model."""

    name = "ollama_mistral"

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = os.getenv("OLLAMA_MISTRAL_MODEL", "mistral")

    def predict(self, raw_log: str) -> Optional[Dict]:
        prompt = (
            "Classify this cybersecurity log risk level as one of: "
            "Low, Medium, High, Critical. Return strict JSON with keys "
            "risk_level and confidence (0-1).\n"
            f"Log: {raw_log[:1600]}"
        )

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0},
            "format": "json",
        }

        try:
            req = request.Request(
                f"{self.base_url}/api/generate",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            model_text = data.get("response", "")
            parsed = _extract_json(model_text)
            if not parsed:
                return None

            return {
                "risk_level": _map_level(parsed.get("risk_level", "medium")).value,
                "confidence": _normalize_confidence(parsed.get("confidence", 0.65)),
                "strategy": self.name,
            }
        except (error.URLError, TimeoutError, json.JSONDecodeError, ValueError):
            return None
        except Exception:
            return None


class TransformersMistralEngine(BaseRiskLLMEngine):
    """Uses Hugging Face Mistral instruct model (open-source weights)."""

    name = "transformers_mistral"

    def __init__(self):
        self.model_name = os.getenv("HF_MISTRAL_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
        self._pipe = None
        self._load_failed = False

    def _load(self):
        if self._pipe is not None or self._load_failed:
            return
        try:
            from transformers import pipeline

            self._pipe = pipeline(
                task="text-generation",
                model=self.model_name,
                tokenizer=self.model_name,
                max_new_tokens=96,
            )
        except Exception:
            self._load_failed = True
            self._pipe = None

    def predict(self, raw_log: str) -> Optional[Dict]:
        self._load()
        if self._pipe is None:
            return None

        prompt = (
            "You are a SOC analyst. Return ONLY JSON with risk_level and confidence (0-1). "
            "Valid risk_level values: Low, Medium, High, Critical.\n"
            f"Log: {raw_log[:1500]}"
        )

        try:
            output = self._pipe(prompt, do_sample=False, temperature=0)[0]["generated_text"]
            parsed = _extract_json(output)
            if not parsed:
                return None

            return {
                "risk_level": _map_level(parsed.get("risk_level", "medium")).value,
                "confidence": _normalize_confidence(parsed.get("confidence", 0.6)),
                "strategy": self.name,
            }
        except Exception:
            return None


class DeterministicOpenSourceFallbackEngine(BaseRiskLLMEngine):
    """
    Always-available local fallback.

    This is deterministic and local; it keeps the prediction feature available even
    when external runtimes/models are not present.
    """

    name = "deterministic_local_fallback"
    _TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9_\-]{3,}")

    def __init__(self, global_profiles, source_profiles):
        self._global_profiles = global_profiles
        self._source_profiles = source_profiles

    def predict(self, raw_log: str, source: str = "unknown") -> Optional[Dict]:
        tokens = [t.lower() for t in self._TOKEN_PATTERN.findall(raw_log or "")]
        if not tokens:
            return {
                "risk_level": RiskLevel.LOW.value,
                "confidence": 0.5,
                "strategy": self.name,
                "score_breakdown": {},
            }

        scores = {}
        for level in [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]:
            g = _overlap_score(tokens, self._global_profiles[level])
            s = _overlap_score(tokens, self._source_profiles[source][level])
            h = _heuristic_score(level, raw_log)
            scores[level] = (g * 0.4) + (s * 0.4) + (h * 0.2)

        best_level, _ = max(scores.items(), key=lambda x: x[1])
        ordered = sorted(scores.values(), reverse=True)
        margin = (ordered[0] - ordered[1]) if len(ordered) > 1 else ordered[0]
        conf = 1 / (1 + math.exp(-margin))

        return {
            "risk_level": best_level.value,
            "confidence": round(max(0.5, min(conf, 0.98)), 2),
            "strategy": self.name,
            "score_breakdown": {k.value: round(v, 4) for k, v in scores.items()},
        }


class OpenSourceLLMRiskPredictor:
    """Predict risk level from logs and learn from multiple log sources."""

    _TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9_\-]{3,}")

    def __init__(self):
        self._source_profiles: Dict[str, Dict[RiskLevel, Counter]] = defaultdict(lambda: defaultdict(Counter))
        self._global_profiles: Dict[RiskLevel, Counter] = defaultdict(Counter)
        self._seen_examples: Dict[str, int] = defaultdict(int)

        self._engines: List[BaseRiskLLMEngine] = [
            OllamaMistralEngine(),
            TransformersMistralEngine(),
        ]
        self._fallback_engine = DeterministicOpenSourceFallbackEngine(
            global_profiles=self._global_profiles,
            source_profiles=self._source_profiles,
        )

    def learn_from_events(self, events: Iterable[LogEvent]):
        """Learn source-specific patterns from parsed log events."""
        for event in events:
            label = self._derive_label(event)
            source = (event.source or "unknown").lower()
            text = self._event_to_text(event)
            tokens = self._tokenize(text)

            self._source_profiles[source][label].update(tokens)
            self._global_profiles[label].update(tokens)
            self._seen_examples[source] += 1

    def predict_risk_level(self, raw_log: str, source: Optional[str] = None) -> Dict:
        source_key = (source or "unknown").lower()

        # Prefer open-source Mistral engines.
        for engine in self._engines:
            prediction = engine.predict(raw_log)
            if prediction:
                prediction["source_context"] = source_key
                prediction["engine_priority"] = "mistral_preferred"
                return prediction

        # Always-available local fallback.
        fallback = self._fallback_engine.predict(raw_log, source_key)
        fallback["source_context"] = source_key
        fallback["engine_priority"] = "always_available_fallback"
        return fallback

    def get_model_summary(self) -> Dict:
        per_source = {
            source: {
                "examples_seen": self._seen_examples[source],
                "labels": {level.value: sum(counter.values()) for level, counter in profiles.items()},
            }
            for source, profiles in self._source_profiles.items()
        }

        return {
            "preferred_engines": [e.name for e in self._engines],
            "fallback_engine": self._fallback_engine.name,
            "sources": per_source,
            "total_examples_seen": sum(self._seen_examples.values()),
        }

    def _derive_label(self, event: LogEvent) -> RiskLevel:
        severity = (event.severity or "").lower()
        text = self._event_to_text(event).lower()

        if severity in {"critical", "severe"}:
            return RiskLevel.CRITICAL
        if severity in {"high", "error"}:
            return RiskLevel.HIGH
        if severity in {"medium", "warning"}:
            return RiskLevel.MEDIUM

        if any(k in text for k in ["ransomware", "privilege escalation", "credential theft"]):
            return RiskLevel.CRITICAL
        if any(k in text for k in ["brute force", "malware", "failed password", "powershell -enc"]):
            return RiskLevel.HIGH
        if any(k in text for k in ["policy change", "suspicious", "unknown process"]):
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    def _event_to_text(self, event: LogEvent) -> str:
        payload = ""
        if event.parsed_data:
            try:
                payload = json.dumps(event.parsed_data, sort_keys=True)
            except Exception:
                payload = str(event.parsed_data)

        return " ".join([
            str(event.source or ""),
            str(event.severity or ""),
            str(event.hostname or ""),
            str(event.user or ""),
            str(event.raw_log or ""),
            payload,
        ])

    def _tokenize(self, text: str) -> List[str]:
        return [tok.lower() for tok in self._TOKEN_PATTERN.findall(text or "")]


def _extract_json(output: str) -> Optional[Dict]:
    try:
        return json.loads(output)
    except Exception:
        pass

    match = re.search(r"\{.*\}", output, re.DOTALL)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except Exception:
        return None


def _map_level(level_text: str) -> RiskLevel:
    normalized = str(level_text).lower().strip()
    mapping = {
        "critical": RiskLevel.CRITICAL,
        "high": RiskLevel.HIGH,
        "medium": RiskLevel.MEDIUM,
        "low": RiskLevel.LOW,
        "informational": RiskLevel.LOW,
        "info": RiskLevel.LOW,
    }
    return mapping.get(normalized, RiskLevel.MEDIUM)


def _normalize_confidence(value) -> float:
    try:
        c = float(value)
    except Exception:
        c = 0.6
    return max(0.0, min(c, 1.0))


def _overlap_score(tokens: List[str], profile: Counter) -> float:
    if not profile:
        return 0.0
    return sum(profile.get(tok, 0) for tok in tokens) / (len(tokens) + 1)


def _heuristic_score(level: RiskLevel, text: str) -> float:
    lower = text.lower()
    features = {
        RiskLevel.CRITICAL: ["ransomware", "domain admin", "exfiltration", "privilege escalation"],
        RiskLevel.HIGH: ["failed password", "brute force", "malware", "suspicious", "powershell -enc"],
        RiskLevel.MEDIUM: ["warning", "policy change", "anomaly", "outdated"],
        RiskLevel.LOW: ["info", "heartbeat", "normal operation", "success"],
    }
    hits = sum(1 for keyword in features[level] if keyword in lower)
    return hits / max(1, len(features[level]))
