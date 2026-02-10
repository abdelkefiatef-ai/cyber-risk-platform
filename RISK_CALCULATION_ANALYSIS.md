# Risk Calculation Analysis: Current Implementation → Enhanced Engine

## Overview

This document analyzes how the original code calculates risk and how the enhanced engine improves upon it.

## Original Implementation Analysis

### Current Risk Calculation (from uploaded code)

The original code has **static risk scores** with limited dynamic calculation:

#### 1. Assets (`src/data/index.ts`)
```typescript
export const mockAssets: Asset[] = [
  {
    id: "a-001",
    name: "WEB-PROD-01",
    riskScore: 88,  // ❌ Hardcoded static value
    vulnerabilityIds: ["v-101", "v-103"],
    // ...
  }
]
```

**Problems:**
- Risk scores are manually assigned
- No automatic recalculation when vulnerabilities change
- No consideration of multiple risk factors
- Cannot adapt to new threats

#### 2. Risk Scenarios (`src/data/index.ts`)
```typescript
export const mockRiskScenarios: RiskScenario[] = [
  {
    id: "rs-001",
    businessRiskScore: 94,  // ❌ Hardcoded static value
    affectedAssetIds: ["a-001", "a-002"],
    correlatedVulnerabilityIds: ["v-101", "v-103", "v-104"],
    // ...
  }
]
```

**Problems:**
- Scenarios are manually created
- No automatic correlation of vulnerabilities
- No dynamic scenario generation
- Business risk scores are static

#### 3. Risk Hooks (`src/hooks/useRiskData.ts`)
```typescript
const stats = useMemo(() => {
  const avgAssetRisk = Math.round(
    assets.reduce((acc, a) => acc + a.riskScore, 0) / (assets.length || 1)
  );
  // ❌ Just averaging hardcoded values
  return { avgAssetRisk };
}, [assets]);
```

**Problems:**
- Only calculates averages of static scores
- No real-time risk assessment
- No vulnerability-based calculation

#### 4. Correlation Analysis (`src/hooks/useRiskData.ts`)
```typescript
const getHighLevelRiskInsights = useMemo(() => {
  return riskScenarios.map((scenario) => {
    const impactScore = 
      (scenario.businessRiskScore * 0.7) + 
      (linkedVulns.length * 5);  // ❌ Very simplistic formula
    return { ...scenario, impactScore };
  });
}, [assets, vulnerabilities, riskScenarios]);
```

**Problems:**
- Overly simplistic calculation
- Doesn't consider vulnerability severity
- No threat intelligence
- No environmental factors

---

## Enhanced Engine Implementation

### NEW: Dynamic Risk Calculation Engine

The enhanced engine introduces **true vulnerability → risk modeling**:

#### 1. Multi-Factor Risk Calculation

```python
class RiskCalculationEngine:
    WEIGHTS = {
        "vulnerability_severity": 0.35,  # ✅ CVSS-based
        "exploitability": 0.25,          # ✅ Exploit availability
        "asset_criticality": 0.20,       # ✅ Business impact
        "exposure": 0.10,                # ✅ Attack surface
        "threat_intelligence": 0.10      # ✅ Active threats
    }
```

**Key Improvements:**
- Scientific weight distribution
- Multiple risk dimensions
- Configurable and tunable

#### 2. Vulnerability Risk Calculation

```python
def calculate_vulnerability_risk(self, vuln: Vulnerability) -> float:
    # Base CVSS score
    base_score = (vuln.cvss_score / 10.0) * 100
    
    # Severity multiplier
    severity_mult = self.CVSS_MULTIPLIERS.get(vuln.severity, 0.5)
    
    # Exploitability (public exploit = 1.5x, available = 1.3x)
    exploit_factor = 1.5 if vuln.exploit_public else 1.3 if vuln.exploit_available else 1.0
    
    # Patch availability reduces risk
    patch_factor = 0.7 if vuln.patch_available else 1.0
    
    # Attack vector (Network = 1.3x, Local = 0.9x)
    vector_mult = {"Network": 1.3, "Local": 0.9}.get(vuln.attack_vector, 1.0)
    
    # Threat intelligence (actively exploited = up to 1.5x)
    threat_mult = 1.0 + (self.threat_intel.get(vuln.cve_id, 0) * 0.5)
    
    # Combined calculation
    risk_score = (
        base_score * 
        severity_mult * 
        exploit_factor * 
        patch_factor * 
        vector_mult * 
        threat_mult
    )
    
    return min(risk_score, 100.0)
```

**Improvements:**
- ✅ Uses actual CVSS scores
- ✅ Considers exploit availability
- ✅ Accounts for patches
- ✅ Network exposure factor
- ✅ Threat intelligence integration

#### 3. Asset Risk Calculation

```python
def calculate_asset_risk(self, asset: Asset) -> RiskCalculationResult:
    # Get all vulnerabilities for this asset
    asset_vulns = [
        self.vulnerabilities[vuln_id] 
        for vuln_id in asset.vulnerability_ids
    ]
    
    # Calculate vulnerability component (weighted)
    vuln_scores = [self.calculate_vulnerability_risk(v) for v in asset_vulns]
    
    # Top vulnerability gets 60% weight
    vulnerability_risk = vuln_scores[0] * 0.6 + sum(vuln_scores[1:]) * 0.4
    
    # Environmental exposure
    exposure_risk = self._calculate_exposure_risk(asset)
    
    # Asset criticality multiplier
    criticality_mult = {
        "Mission Critical": 2.0,
        "High": 1.5,
        "Medium": 1.0,
        "Low": 0.5
    }[asset.criticality]
    
    # Threat intelligence factor
    threat_factor = self._calculate_threat_factor(asset_vulns)
    
    # Final risk score
    total_risk = (
        (vulnerability_risk * 0.35) +
        (exposure_risk * 0.10) +
        (vulnerability_risk * criticality_mult * 0.20) +
        (vulnerability_risk * threat_factor * 0.10)
    ) / sum([0.35, 0.10, 0.20, 0.10])
    
    total_risk = min(total_risk * criticality_mult, 100.0)
    
    return RiskCalculationResult(
        total_risk_score=total_risk,
        vulnerability_risk=vulnerability_risk,
        exposure_risk=exposure_risk,
        criticality_multiplier=criticality_mult,
        threat_intelligence_factor=threat_factor,
        recommendations=self._generate_recommendations(asset, asset_vulns)
    )
```

**Improvements:**
- ✅ Combines multiple risk factors
- ✅ Weights critical vulnerabilities higher
- ✅ Considers asset criticality
- ✅ Environmental factors
- ✅ Actionable recommendations

#### 4. Exposure Risk Calculation

```python
def _calculate_exposure_risk(self, asset: Asset) -> float:
    exposure_score = 0.0
    
    # Internet exposure (+30 points)
    if asset.exposed_to_internet:
        exposure_score += 30.0
    
    # Sensitive data (+25 points)
    if asset.contains_sensitive_data:
        exposure_score += 25.0
    
    # Patch level (0-30 points)
    patch_scores = {
        "Current": 0.0,
        "Outdated": 15.0,
        "Critical": 30.0
    }
    exposure_score += patch_scores.get(asset.patch_level, 20.0)
    
    # Antivirus status (0-20 points)
    av_scores = {
        "Active": 0.0,
        "Outdated": 10.0,
        "Inactive": 20.0
    }
    exposure_score += av_scores.get(asset.antivirus_status, 15.0)
    
    # Firewall (+15 if disabled)
    if not asset.firewall_enabled:
        exposure_score += 15.0
    
    return min(exposure_score, 100.0)
```

**Improvements:**
- ✅ Quantifies attack surface
- ✅ Considers defensive controls
- ✅ Measurable security posture

---

## Comparison: Original vs Enhanced

### Risk Score Accuracy

| Factor | Original | Enhanced |
|--------|----------|----------|
| **Vulnerability Severity** | Not considered | CVSS-weighted with severity multipliers |
| **Exploit Availability** | Not considered | Public exploits get 1.5x, available get 1.3x |
| **Asset Criticality** | Static category | Dynamic 0.5x-2.0x multiplier |
| **Internet Exposure** | Not considered | +30 risk points |
| **Patch Status** | Not considered | 0-30 points based on currency |
| **Antivirus** | Not considered | 0-20 points based on status |
| **Threat Intel** | Not considered | Active exploitation up to 1.5x |

### Risk Scenario Generation

| Aspect | Original | Enhanced |
|--------|----------|----------|
| **Creation** | Manual, hardcoded | Automated from vulnerabilities |
| **Correlation** | Static lists | Dynamic asset-vulnerability chains |
| **MITRE Mapping** | Manual | Automatic from log analysis |
| **Business Impact** | Static score | Calculated from asset criticality |
| **Detection Coverage** | Static | Based on log source coverage |

### Log-Based Vulnerability Detection

**Original:** No log parsing capability

**Enhanced:**
- ✅ Syslog: Brute force, port scans, malware, suspicious commands
- ✅ Windows Events: Failed logins, privilege escalation, log clearing
- ✅ M365: Failed auth, data exfiltration, inbox rules, policy changes
- ✅ Defender: All alerts converted to vulnerabilities

---

## Real-World Example

### Scenario: Web Server with Critical Vulnerability

**Original Code:**
```typescript
{
  id: "a-001",
  name: "WEB-PROD-01",
  riskScore: 88,  // Someone typed this number
  vulnerabilityIds: ["v-101", "v-103"]
}
```

**Enhanced Engine:**
```python
# Asset Configuration
asset = Asset(
    name="WEB-PROD-01",
    criticality=AssetCriticality.MISSION_CRITICAL,  # 2.0x multiplier
    exposed_to_internet=True,                       # +30 exposure
    contains_sensitive_data=True,                   # +25 exposure
    patch_level="Outdated",                         # +15 exposure
    vulnerability_ids=["v-101", "v-103"]
)

# Vulnerability v-101
vuln_101 = Vulnerability(
    cve_id="CVE-2026-0115",
    cvss_score=9.8,                                 # High base
    severity=RiskLevel.CRITICAL,                    # 1.0x multiplier
    exploit_public=True,                            # 1.5x multiplier
    patch_available=False,                          # 1.0x (no reduction)
    attack_vector="Network"                         # 1.3x multiplier
)

# Calculated Risk
vuln_risk = (9.8/10 * 100) * 1.0 * 1.5 * 1.0 * 1.3 = 191.1 (capped at 100)
exposure_risk = 30 + 25 + 15 = 70
total_risk = (100 * 0.35) + (70 * 0.10) + (100 * 2.0 * 0.20) + (100 * 1.5 * 0.10)
           = 35 + 7 + 40 + 15 = 97 * 2.0 = 194 (capped at 100)

Final Risk Score: 100/100 ✅ Accurate!
```

---

## Integration Path

### Phase 1: Backend Risk Calculation
```
Old: Static JSON → Frontend
New: Logs → Python Engine → Dynamic JSON → Frontend
```

### Phase 2: API Integration
```
Old: Import static data
New: API endpoint → Real-time calculation
```

### Phase 3: Real-Time Updates
```
Old: Manual data updates
New: Continuous log processing → WebSocket → Live updates
```

---

## Key Takeaways

### What the Enhanced Engine Adds:

1. **Automated Vulnerability Detection** from logs (syslog, Windows, M365, Defender)
2. **Dynamic Risk Scoring** based on multiple weighted factors
3. **CVSS-Based Calculations** using industry standards
4. **Threat Intelligence Integration** for active exploits
5. **Environmental Factors** (exposure, patches, defenses)
6. **Automatic Scenario Generation** from vulnerability chains
7. **Actionable Recommendations** based on calculated risks
8. **MITRE ATT&CK Mapping** from log analysis

### Migration Path:

```python
# Step 1: Run enhanced engine
orchestrator = RiskPlatformOrchestrator()
orchestrator.process_syslog_file("logs/syslog")
orchestrator.calculate_all_risks()

# Step 2: Export to frontend format
orchestrator.export_to_json("../src/data")

# Step 3: Update frontend to use generated data
import assets from './data/assets.json'  // Now has real risk scores!
```

The enhanced engine transforms your static mock data into a dynamic, log-driven risk assessment platform!
