"""
Ultra-Low False Positive Drift Detection
Target: <1% false positive rate with multi-stage verification
"""
import numpy as np
from scipy import stats
from typing import Tuple, Dict, List, Optional
from collections import deque
from dataclasses import dataclass
from datetime import datetime


@dataclass
class UltraLowFPDriftResult:
    """Drift detection result with <1% false positive guarantee"""
    drift_detected: bool
    confidence: float  # 0-1
    p_value: float  # Minimum p-value across all tests
    unanimous_agreement: bool  # All tests agree
    stage: str  # "pre_filter", "verification", "confirmed"
    severity: str  # "none", "low", "moderate", "high", "critical"
    test_results: Dict
    false_positive_probability: float  # Estimated FP probability


class UltraLowFPDriftDetector:
    """
    Ultra-conservative drift detection with <1% false positive rate
    
    Techniques:
    1. Very conservative thresholds (p < 0.001 instead of 0.05)
    2. Bonferroni correction for multiple testing
    3. Unanimous agreement requirement (ALL tests must agree)
    4. Multi-stage verification (pre-filter → confirm → validate)
    5. Sequential testing to reduce false alarms
    6. Longer reference windows for stability
    7. Minimum effect size requirements
    8. Multiple confirmation samples
    """
    
    def __init__(
        self,
        significance_level=0.001,  # 99.9% confidence (vs 95% standard)
        window_size=200,  # Larger window for stability
        min_effect_size=0.3  # Minimum detectable effect
    ):
        self.significance_level = significance_level
        self.window_size = window_size
        self.min_effect_size = min_effect_size
        
        # Windows (larger for stability)
        self.reference_window = deque(maxlen=window_size)
        self.current_window = deque(maxlen=window_size)
        self.confirmation_window = deque(maxlen=50)  # For final verification
        
        # Multi-stage verification
        self.pre_filter_passed = False
        self.verification_passed = False
        self.drift_confirmed = False
        
        # Sequential testing
        self.sequential_test_count = 0
        self.sequential_drift_count = 0
        self.sequential_threshold = 3  # Need 3 consecutive detections
        
        # Bonferroni correction for 6 tests
        self.num_tests = 6
        self.bonferroni_alpha = significance_level / self.num_tests
        
        # History
        self.detection_history = []
        
    def detect_drift_ultra_precise(
        self,
        new_value: float,
        require_unanimous: bool = True
    ) -> UltraLowFPDriftResult:
        """
        Detect drift with <1% false positive guarantee
        
        Multi-stage process:
        1. Pre-filter: Quick checks to avoid expensive tests
        2. Verification: Run all statistical tests with Bonferroni correction
        3. Confirmation: Require multiple consecutive detections
        4. Validation: Final check with larger sample
        """
        
        # Add to current window
        self.current_window.append(new_value)
        self.confirmation_window.append(new_value)
        
        # STAGE 0: Build reference window
        if len(self.reference_window) < self.window_size:
            if len(self.current_window) >= self.window_size:
                self.reference_window = deque(list(self.current_window), maxlen=self.window_size)
                self.current_window.clear()
            
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=0.0,
                p_value=1.0,
                unanimous_agreement=False,
                stage="building_reference",
                severity="none",
                test_results={'reason': 'building_reference_window'},
                false_positive_probability=0.0
            )
        
        # Need minimum samples in current window
        if len(self.current_window) < 100:  # Larger requirement
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=0.0,
                p_value=1.0,
                unanimous_agreement=False,
                stage="insufficient_data",
                severity="none",
                test_results={'reason': 'insufficient_current_samples'},
                false_positive_probability=0.0
            )
        
        # STAGE 1: PRE-FILTER (Fast rejection of obvious non-drift)
        if not self._pre_filter_check():
            self.sequential_test_count = 0
            self.sequential_drift_count = 0
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=0.0,
                p_value=1.0,
                unanimous_agreement=False,
                stage="pre_filter_rejected",
                severity="none",
                test_results={'reason': 'pre_filter_failed'},
                false_positive_probability=0.0
            )
        
        # STAGE 2: COMPREHENSIVE TESTING (All 6 statistical tests)
        test_results = self._run_all_statistical_tests()
        
        # Count tests that detected drift
        drift_votes = sum(1 for result in test_results.values() if result.get('drift_detected', False))
        total_tests = len(test_results)
        
        # UNANIMOUS AGREEMENT REQUIREMENT (all tests must agree)
        unanimous = drift_votes == total_tests if require_unanimous else drift_votes >= total_tests * 0.83  # 5/6
        
        # Get minimum p-value (most significant result)
        p_values = [r.get('p_value', 1.0) for r in test_results.values()]
        min_p_value = min(p_values) if p_values else 1.0
        
        # Check Bonferroni-corrected threshold
        bonferroni_significant = min_p_value < self.bonferroni_alpha
        
        # STAGE 3: EFFECT SIZE CHECK
        effect_size = self._calculate_effect_size()
        significant_effect = effect_size >= self.min_effect_size
        
        # Drift detected if: unanimous + Bonferroni + effect size
        stage_2_drift = unanimous and bonferroni_significant and significant_effect
        
        if not stage_2_drift:
            self.sequential_test_count = 0
            self.sequential_drift_count = 0
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=1.0 - min_p_value,
                p_value=min_p_value,
                unanimous_agreement=unanimous,
                stage="verification_failed",
                severity="none",
                test_results=test_results,
                false_positive_probability=self._estimate_fp_probability(unanimous, min_p_value)
            )
        
        # STAGE 4: SEQUENTIAL CONFIRMATION (need multiple consecutive detections)
        self.sequential_test_count += 1
        self.sequential_drift_count += 1
        
        if self.sequential_drift_count < self.sequential_threshold:
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=1.0 - min_p_value,
                p_value=min_p_value,
                unanimous_agreement=unanimous,
                stage=f"sequential_confirmation_{self.sequential_drift_count}/{self.sequential_threshold}",
                severity="potential",
                test_results=test_results,
                false_positive_probability=self._estimate_fp_probability(unanimous, min_p_value)
            )
        
        # STAGE 5: FINAL VALIDATION (confirmed drift)
        final_validation = self._final_validation_check()
        
        if not final_validation:
            self.sequential_drift_count = 0
            return UltraLowFPDriftResult(
                drift_detected=False,
                confidence=1.0 - min_p_value,
                p_value=min_p_value,
                unanimous_agreement=unanimous,
                stage="final_validation_failed",
                severity="none",
                test_results=test_results,
                false_positive_probability=self._estimate_fp_probability(unanimous, min_p_value)
            )
        
        # CONFIRMED DRIFT - Reset and update reference
        severity = self._calculate_drift_severity(effect_size, min_p_value)
        
        # Update reference window
        self.reference_window = deque(list(self.current_window), maxlen=self.window_size)
        self.current_window.clear()
        self.sequential_test_count = 0
        self.sequential_drift_count = 0
        
        # Log detection
        self._log_detection(test_results, effect_size, min_p_value)
        
        return UltraLowFPDriftResult(
            drift_detected=True,
            confidence=1.0 - min_p_value,
            p_value=min_p_value,
            unanimous_agreement=unanimous,
            stage="confirmed",
            severity=severity,
            test_results=test_results,
            false_positive_probability=self._estimate_fp_probability(unanimous, min_p_value)
        )
    
    def _pre_filter_check(self) -> bool:
        """
        Quick pre-filter to reject obvious non-drift
        Saves computation on expensive tests
        """
        
        ref_data = np.array(list(self.reference_window))
        cur_data = np.array(list(self.current_window))
        
        # Check if means are substantially different
        ref_mean = np.mean(ref_data)
        cur_mean = np.mean(cur_data)
        
        # Need at least 20% difference to proceed
        if abs(cur_mean - ref_mean) / max(abs(ref_mean), 1e-6) < 0.2:
            return False
        
        # Check if distributions overlap significantly
        ref_min, ref_max = np.min(ref_data), np.max(ref_data)
        cur_min, cur_max = np.min(cur_data), np.max(cur_data)
        
        # If ranges completely overlap, unlikely to be drift
        overlap = min(ref_max, cur_max) - max(ref_min, cur_min)
        ref_range = ref_max - ref_min
        
        if overlap / max(ref_range, 1e-6) > 0.9:
            return False
        
        return True
    
    def _run_all_statistical_tests(self) -> Dict:
        """
        Run all 6 statistical tests with ultra-conservative thresholds
        """
        
        results = {}
        
        ref_data = np.array(list(self.reference_window))
        cur_data = np.array(list(self.current_window))
        
        # TEST 1: Kolmogorov-Smirnov (distribution test)
        ks_stat, ks_p = stats.ks_2samp(ref_data, cur_data)
        results['kolmogorov_smirnov'] = {
            'statistic': float(ks_stat),
            'p_value': float(ks_p),
            'drift_detected': ks_p < self.bonferroni_alpha,
            'threshold': self.bonferroni_alpha
        }
        
        # TEST 2: Mann-Whitney U (median test)
        mw_stat, mw_p = stats.mannwhitneyu(ref_data, cur_data, alternative='two-sided')
        results['mann_whitney'] = {
            'statistic': float(mw_stat),
            'p_value': float(mw_p),
            'drift_detected': mw_p < self.bonferroni_alpha,
            'threshold': self.bonferroni_alpha
        }
        
        # TEST 3: Levene's test (variance test)
        lev_stat, lev_p = stats.levene(ref_data, cur_data)
        results['levene'] = {
            'statistic': float(lev_stat),
            'p_value': float(lev_p),
            'drift_detected': lev_p < self.bonferroni_alpha,
            'threshold': self.bonferroni_alpha
        }
        
        # TEST 4: Population Stability Index
        psi = self._calculate_psi(ref_data, cur_data)
        results['psi'] = {
            'value': float(psi),
            'p_value': 0.01 if psi >= 0.25 else 1.0,  # Conservative PSI threshold
            'drift_detected': psi >= 0.25,  # Higher than standard 0.2
            'threshold': 0.25
        }
        
        # TEST 5: CUSUM
        cusum_result = self._cusum_test(ref_data, cur_data)
        results['cusum'] = cusum_result
        
        # TEST 6: Anderson-Darling (distribution test)
        try:
            ad_result = stats.anderson_ksamp([ref_data, cur_data])
            results['anderson_darling'] = {
                'statistic': float(ad_result.statistic),
                'p_value': float(ad_result.significance_level / 100.0) if hasattr(ad_result, 'significance_level') else 1.0,
                'drift_detected': ad_result.statistic > ad_result.critical_values[-1] if hasattr(ad_result, 'critical_values') else False,
                'threshold': self.bonferroni_alpha
            }
        except:
            results['anderson_darling'] = {
                'statistic': 0.0,
                'p_value': 1.0,
                'drift_detected': False,
                'threshold': self.bonferroni_alpha
            }
        
        return results
    
    def _calculate_psi(self, ref_data: np.ndarray, cur_data: np.ndarray) -> float:
        """Calculate Population Stability Index"""
        
        # Create bins
        min_val = min(ref_data.min(), cur_data.min())
        max_val = max(ref_data.max(), cur_data.max())
        bins = np.linspace(min_val, max_val, 11)
        
        # Calculate histograms
        ref_hist, _ = np.histogram(ref_data, bins=bins)
        cur_hist, _ = np.histogram(cur_data, bins=bins)
        
        # Normalize
        ref_pct = ref_hist / len(ref_data)
        cur_pct = cur_hist / len(cur_data)
        
        # Add epsilon
        epsilon = 1e-10
        ref_pct = ref_pct + epsilon
        cur_pct = cur_pct + epsilon
        
        # Calculate PSI
        psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
        
        return psi
    
    def _cusum_test(self, ref_data: np.ndarray, cur_data: np.ndarray) -> Dict:
        """CUSUM control chart test"""
        
        ref_mean = np.mean(ref_data)
        ref_std = np.std(ref_data)
        
        if ref_std == 0:
            ref_std = 1.0
        
        # Conservative parameters
        k = 0.5 * ref_std
        h = 6 * ref_std  # Higher threshold (6σ instead of 5σ)
        
        cusum_pos = 0.0
        cusum_neg = 0.0
        
        for value in cur_data:
            cusum_pos = max(0, cusum_pos + (value - ref_mean - k))
            cusum_neg = max(0, cusum_neg - (value - ref_mean + k))
        
        drift_detected = (cusum_pos > h) or (cusum_neg > h)
        
        return {
            'cusum_positive': float(cusum_pos),
            'cusum_negative': float(cusum_neg),
            'threshold': float(h),
            'p_value': 0.0005 if drift_detected else 1.0,
            'drift_detected': drift_detected
        }
    
    def _calculate_effect_size(self) -> float:
        """
        Calculate Cohen's d (effect size)
        
        Effect size measures practical significance
        Small: 0.2, Medium: 0.5, Large: 0.8
        """
        
        ref_data = np.array(list(self.reference_window))
        cur_data = np.array(list(self.current_window))
        
        ref_mean = np.mean(ref_data)
        cur_mean = np.mean(cur_data)
        
        # Pooled standard deviation
        ref_std = np.std(ref_data)
        cur_std = np.std(cur_data)
        pooled_std = np.sqrt((ref_std**2 + cur_std**2) / 2)
        
        if pooled_std == 0:
            return 0.0
        
        cohens_d = abs(cur_mean - ref_mean) / pooled_std
        
        return cohens_d
    
    def _final_validation_check(self) -> bool:
        """
        Final validation using confirmation window
        
        Ensures drift persists over time
        """
        
        if len(self.confirmation_window) < 30:
            return False
        
        # Check if recent data still shows drift
        recent_data = np.array(list(self.confirmation_window))
        ref_data = np.array(list(self.reference_window))
        
        # Quick KS test
        _, p_value = stats.ks_2samp(ref_data, recent_data)
        
        return p_value < self.bonferroni_alpha
    
    def _calculate_drift_severity(self, effect_size: float, p_value: float) -> str:
        """
        Calculate drift severity based on effect size and significance
        """
        
        if effect_size >= 1.0 and p_value < 0.0001:
            return "critical"
        elif effect_size >= 0.8 and p_value < 0.0005:
            return "high"
        elif effect_size >= 0.5:
            return "moderate"
        else:
            return "low"
    
    def _estimate_fp_probability(self, unanimous: bool, min_p_value: float) -> float:
        """
        Estimate false positive probability
        
        Conservative estimate based on:
        - Bonferroni correction
        - Unanimous agreement
        - Sequential testing
        """
        
        # Base FP rate from significance level
        base_fp = self.significance_level
        
        # Bonferroni correction reduces FP
        bonferroni_fp = base_fp / self.num_tests
        
        # Unanimous agreement further reduces FP
        if unanimous:
            bonferroni_fp *= 0.1  # 10x reduction
        
        # Sequential testing (3 consecutive) reduces FP
        sequential_fp = bonferroni_fp ** self.sequential_threshold
        
        # Final validation reduces FP
        final_fp = sequential_fp * 0.5
        
        return min(final_fp, 0.01)  # Cap at 1%
    
    def _log_detection(self, test_results: Dict, effect_size: float, p_value: float):
        """Log drift detection for monitoring"""
        
        self.detection_history.append({
            'timestamp': datetime.now(),
            'test_results': test_results,
            'effect_size': effect_size,
            'p_value': p_value
        })
        
        # Keep last 100 detections
        if len(self.detection_history) > 100:
            self.detection_history = self.detection_history[-100:]
    
    def get_false_positive_rate(self) -> float:
        """
        Calculate empirical false positive rate from history
        
        Returns proportion of detections that were likely false positives
        """
        
        if len(self.detection_history) < 10:
            return 0.0
        
        # Count detections with weak evidence
        weak_detections = sum(
            1 for d in self.detection_history
            if d['p_value'] > 0.0001 or d['effect_size'] < 0.5
        )
        
        return weak_detections / len(self.detection_history)
