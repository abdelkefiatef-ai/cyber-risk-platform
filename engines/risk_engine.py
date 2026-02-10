"""
Risk Calculation Engine
Calculates comprehensive risk scores based on assets, vulnerabilities, and threat intelligence
"""
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from models.risk_models import (
    Asset, Vulnerability, RiskScenario, RiskLevel, RiskCalculationResult,
    AssetCriticality, VulnerabilitySource
)


class RiskCalculationEngine:
    """
    Advanced risk calculation engine that computes risk scores based on:
    - Asset criticality
    - Vulnerability severity and exploitability
    - Threat intelligence
    - Environmental factors
    - Attack surface exposure
    """
    
    # Risk score weights
    WEIGHTS = {
        "vulnerability_severity": 0.35,
        "exploitability": 0.25,
        "asset_criticality": 0.20,
        "exposure": 0.10,
        "threat_intelligence": 0.10
    }
    
    # CVSS score multipliers
    CVSS_MULTIPLIERS = {
        RiskLevel.CRITICAL: 1.0,
        RiskLevel.HIGH: 0.8,
        RiskLevel.MEDIUM: 0.5,
        RiskLevel.LOW: 0.2,
        RiskLevel.INFORMATIONAL: 0.0
    }
    
    # Asset criticality multipliers
    CRITICALITY_MULTIPLIERS = {
        AssetCriticality.MISSION_CRITICAL: 2.0,
        AssetCriticality.HIGH: 1.5,
        AssetCriticality.MEDIUM: 1.0,
        AssetCriticality.LOW: 0.5
    }
    
    def __init__(self):
        self.assets: Dict[str, Asset] = {}
        self.vulnerabilities: Dict[str, Vulnerability] = {}
        self.risk_scenarios: List[RiskScenario] = []
        self.threat_intel: Dict[str, float] = {}  # CVE ID -> threat score
    
    def add_asset(self, asset: Asset):
        """Add or update an asset"""
        self.assets[asset.id] = asset
    
    def add_vulnerability(self, vulnerability: Vulnerability):
        """Add or update a vulnerability"""
        self.vulnerabilities[vulnerability.id] = vulnerability
    
    def add_threat_intelligence(self, cve_id: str, threat_score: float):
        """
        Add threat intelligence for a CVE
        threat_score: 0.0 to 1.0 where 1.0 is actively exploited in the wild
        """
        self.threat_intel[cve_id] = min(max(threat_score, 0.0), 1.0)
    
    def calculate_vulnerability_risk(self, vuln: Vulnerability) -> float:
        """
        Calculate risk score for a single vulnerability
        Returns: 0-100 score
        """
        # Base score from CVSS
        base_score = (vuln.cvss_score / 10.0) * 100
        
        # Severity multiplier
        severity_mult = self.CVSS_MULTIPLIERS.get(vuln.severity, 0.5)
        
        # Exploitability factor
        exploit_factor = 1.0
        if vuln.exploit_public:
            exploit_factor = 1.5
        elif vuln.exploit_available:
            exploit_factor = 1.3
        
        # Patch availability (reduces risk)
        patch_factor = 0.7 if vuln.patch_available else 1.0
        
        # Attack vector factor
        vector_multipliers = {
            "Network": 1.3,
            "Adjacent": 1.1,
            "Local": 0.9,
            "Physical": 0.6
        }
        vector_mult = vector_multipliers.get(vuln.attack_vector, 1.0)
        
        # Threat intelligence
        threat_mult = 1.0
        if vuln.cve_id and vuln.cve_id in self.threat_intel:
            threat_mult = 1.0 + (self.threat_intel[vuln.cve_id] * 0.5)
        
        # Calculate final score
        risk_score = (
            base_score * 
            severity_mult * 
            exploit_factor * 
            patch_factor * 
            vector_mult * 
            threat_mult
        )
        
        return min(risk_score, 100.0)
    
    def calculate_asset_risk(self, asset: Asset) -> RiskCalculationResult:
        """
        Calculate comprehensive risk score for an asset
        """
        # Get vulnerabilities for this asset
        asset_vulns = [
            self.vulnerabilities[vuln_id] 
            for vuln_id in asset.vulnerability_ids 
            if vuln_id in self.vulnerabilities
        ]
        
        if not asset_vulns:
            return RiskCalculationResult(
                asset_id=asset.id,
                total_risk_score=0.0,
                vulnerability_risk=0.0,
                exposure_risk=0.0,
                criticality_multiplier=1.0,
                threat_intelligence_factor=1.0,
                contributing_vulnerabilities=[],
                risk_factors={},
                recommendations=["No vulnerabilities detected. Continue regular scanning."]
            )
        
        # Calculate vulnerability risk component
        vuln_scores = [self.calculate_vulnerability_risk(v) for v in asset_vulns]
        
        # Use weighted average with emphasis on highest risks
        vuln_scores_sorted = sorted(vuln_scores, reverse=True)
        if len(vuln_scores_sorted) == 1:
            vulnerability_risk = vuln_scores_sorted[0]
        else:
            # Top vulnerability gets 60% weight, others split remaining 40%
            top_vuln_weight = 0.6
            vulnerability_risk = vuln_scores_sorted[0] * top_vuln_weight
            remaining_weight = 0.4 / (len(vuln_scores_sorted) - 1)
            vulnerability_risk += sum(score * remaining_weight for score in vuln_scores_sorted[1:])
        
        # Exposure risk
        exposure_risk = self._calculate_exposure_risk(asset)
        
        # Criticality multiplier
        criticality_mult = self.CRITICALITY_MULTIPLIERS.get(
            asset.criticality, 
            1.0
        )
        
        # Threat intelligence factor
        threat_factor = self._calculate_threat_factor(asset_vulns)
        
        # Calculate total risk score
        total_risk = (
            (vulnerability_risk * self.WEIGHTS["vulnerability_severity"]) +
            (exposure_risk * self.WEIGHTS["exposure"]) +
            (vulnerability_risk * criticality_mult * self.WEIGHTS["asset_criticality"]) +
            (vulnerability_risk * threat_factor * self.WEIGHTS["threat_intelligence"])
        ) / sum([
            self.WEIGHTS["vulnerability_severity"],
            self.WEIGHTS["exposure"],
            self.WEIGHTS["asset_criticality"],
            self.WEIGHTS["threat_intelligence"]
        ])
        
        # Normalize to 0-100
        total_risk = min(total_risk * criticality_mult, 100.0)
        
        # Update asset risk score
        asset.risk_score = total_risk
        
        # Generate recommendations
        recommendations = self._generate_recommendations(asset, asset_vulns)
        
        # Prepare risk factors breakdown
        risk_factors = {
            "vulnerability_base": round(vulnerability_risk, 2),
            "exposure": round(exposure_risk, 2),
            "criticality": round(criticality_mult, 2),
            "threat_intelligence": round(threat_factor, 2),
            "total_vulnerabilities": len(asset_vulns),
            "critical_vulnerabilities": len([v for v in asset_vulns if v.severity == RiskLevel.CRITICAL]),
            "high_vulnerabilities": len([v for v in asset_vulns if v.severity == RiskLevel.HIGH])
        }
        
        return RiskCalculationResult(
            asset_id=asset.id,
            total_risk_score=total_risk,
            vulnerability_risk=vulnerability_risk,
            exposure_risk=exposure_risk,
            criticality_multiplier=criticality_mult,
            threat_intelligence_factor=threat_factor,
            contributing_vulnerabilities=[v.id for v in asset_vulns],
            risk_factors=risk_factors,
            recommendations=recommendations
        )
    
    def _calculate_exposure_risk(self, asset: Asset) -> float:
        """Calculate risk from exposure factors"""
        exposure_score = 0.0
        
        # Internet exposure
        if asset.exposed_to_internet:
            exposure_score += 30.0
        
        # Sensitive data
        if asset.contains_sensitive_data:
            exposure_score += 25.0
        
        # Patch level
        patch_scores = {
            "Current": 0.0,
            "Outdated": 15.0,
            "Critical": 30.0,
            "Unknown": 20.0
        }
        exposure_score += patch_scores.get(asset.patch_level, 20.0)
        
        # Antivirus status
        av_scores = {
            "Active": 0.0,
            "Outdated": 10.0,
            "Inactive": 20.0,
            "Unknown": 15.0
        }
        exposure_score += av_scores.get(asset.antivirus_status, 15.0)
        
        # Firewall
        if not asset.firewall_enabled:
            exposure_score += 15.0
        
        return min(exposure_score, 100.0)
    
    def _calculate_threat_factor(self, vulns: List[Vulnerability]) -> float:
        """Calculate threat intelligence factor"""
        if not vulns:
            return 1.0
        
        threat_scores = []
        for vuln in vulns:
            if vuln.cve_id and vuln.cve_id in self.threat_intel:
                threat_scores.append(self.threat_intel[vuln.cve_id])
        
        if not threat_scores:
            return 1.0
        
        # Return highest threat score + 1
        return 1.0 + max(threat_scores)
    
    def _generate_recommendations(self, asset: Asset, vulns: List[Vulnerability]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Critical vulnerabilities
        critical_vulns = [v for v in vulns if v.severity == RiskLevel.CRITICAL]
        if critical_vulns:
            recommendations.append(
                f"URGENT: Patch {len(critical_vulns)} critical vulnerabilities immediately"
            )
        
        # High vulnerabilities
        high_vulns = [v for v in vulns if v.severity == RiskLevel.HIGH]
        if high_vulns:
            recommendations.append(
                f"Prioritize patching {len(high_vulns)} high-severity vulnerabilities"
            )
        
        # Public exploits
        exploit_vulns = [v for v in vulns if v.exploit_public]
        if exploit_vulns:
            recommendations.append(
                f"Address {len(exploit_vulns)} vulnerabilities with public exploits"
            )
        
        # Exposure
        if asset.exposed_to_internet:
            recommendations.append(
                "Consider reducing internet exposure or implementing additional network controls"
            )
        
        # Patch level
        if asset.patch_level in ["Outdated", "Critical"]:
            recommendations.append(
                "Update system patches to current level"
            )
        
        # Antivirus
        if asset.antivirus_status != "Active":
            recommendations.append(
                "Ensure antivirus is active and up-to-date"
            )
        
        # Firewall
        if not asset.firewall_enabled:
            recommendations.append(
                "Enable host-based firewall"
            )
        
        return recommendations[:5]  # Limit to top 5
    
    def calculate_all_assets(self) -> List[RiskCalculationResult]:
        """Calculate risk for all assets"""
        results = []
        for asset in self.assets.values():
            result = self.calculate_asset_risk(asset)
            results.append(result)
        
        return sorted(results, key=lambda x: x.total_risk_score, reverse=True)
    
    def generate_risk_scenarios(self) -> List[RiskScenario]:
        """
        Generate risk scenarios based on vulnerability chains and asset correlations
        """
        scenarios = []
        
        # Find vulnerability chains
        for asset in self.assets.values():
            asset_vulns = [
                self.vulnerabilities[vid] 
                for vid in asset.vulnerability_ids 
                if vid in self.vulnerabilities
            ]
            
            if not asset_vulns:
                continue
            
            # Check for critical multi-stage attack scenarios
            critical_vulns = [v for v in asset_vulns if v.severity == RiskLevel.CRITICAL]
            
            if len(critical_vulns) >= 2:
                # Multi-vulnerability exploitation scenario
                scenario = self._create_exploitation_scenario(asset, critical_vulns)
                scenarios.append(scenario)
            
            # Check for specific attack patterns
            if asset.exposed_to_internet and critical_vulns:
                scenario = self._create_internet_breach_scenario(asset, critical_vulns)
                scenarios.append(scenario)
        
        # Find lateral movement opportunities
        lateral_scenarios = self._identify_lateral_movement()
        scenarios.extend(lateral_scenarios)
        
        self.risk_scenarios = scenarios
        return scenarios
    
    def _create_exploitation_scenario(self, asset: Asset, vulns: List[Vulnerability]) -> RiskScenario:
        """Create a multi-stage exploitation scenario"""
        vuln_ids = [v.id for v in vulns]
        
        # Calculate business risk score
        risk_calc = self.calculate_asset_risk(asset)
        business_risk = min(risk_calc.total_risk_score * 1.2, 100)
        
        return RiskScenario(
            id=f"rs_exploit_{asset.id}",
            title=f"Multi-Stage Exploitation of {asset.name}",
            description=f"Multiple critical vulnerabilities on {asset.name} could be chained for privilege escalation and lateral movement",
            category="Multi-Stage Attack",
            severity=RiskLevel.CRITICAL,
            likelihood="Likely",
            impact="Catastrophic",
            affected_asset_ids=[asset.id],
            correlated_vulnerability_ids=vuln_ids,
            mitre_tactics=["Initial Access", "Privilege Escalation", "Lateral Movement"],
            mitre_techniques=["T1190", "T1068", "T1021"],
            business_risk_score=business_risk,
            detection_coverage=60.0,
            remediation_plan=f"1. Immediately patch vulnerabilities {', '.join([v.cve_id or v.id for v in vulns[:3]])}. 2. Implement network segmentation. 3. Enable EDR monitoring.",
        )
    
    def _create_internet_breach_scenario(self, asset: Asset, vulns: List[Vulnerability]) -> RiskScenario:
        """Create an internet-facing breach scenario"""
        return RiskScenario(
            id=f"rs_breach_{asset.id}",
            title=f"Internet-Facing Asset Compromise: {asset.name}",
            description=f"{asset.name} is exposed to the internet with critical vulnerabilities, creating immediate breach risk",
            category="Data Breach & Exfiltration",
            severity=RiskLevel.CRITICAL,
            likelihood="Certain",
            impact="Catastrophic",
            affected_asset_ids=[asset.id],
            correlated_vulnerability_ids=[v.id for v in vulns],
            mitre_tactics=["Initial Access", "Execution", "Exfiltration"],
            mitre_techniques=["T1190", "T1059", "T1041"],
            business_risk_score=95.0,
            detection_coverage=45.0,
            remediation_plan="1. Remove internet exposure or place behind WAF. 2. Emergency patch critical CVEs. 3. Implement IDS/IPS rules.",
        )
    
    def _identify_lateral_movement(self) -> List[RiskScenario]:
        """Identify lateral movement opportunities"""
        scenarios = []
        
        # Group assets by location/network
        location_groups = {}
        for asset in self.assets.values():
            location = asset.location or "Unknown"
            if location not in location_groups:
                location_groups[location] = []
            location_groups[location].append(asset)
        
        # Find groups with high-risk assets
        for location, assets in location_groups.items():
            if len(assets) < 2:
                continue
            
            high_risk_assets = [a for a in assets if a.risk_score > 70]
            if len(high_risk_assets) >= 2:
                scenario = RiskScenario(
                    id=f"rs_lateral_{location}",
                    title=f"Lateral Movement Risk in {location}",
                    description=f"Multiple high-risk assets in {location} create lateral movement opportunities",
                    category="Unauthorized Lateral Movement",
                    severity=RiskLevel.HIGH,
                    likelihood="Possible",
                    impact="Significant",
                    affected_asset_ids=[a.id for a in high_risk_assets],
                    correlated_vulnerability_ids=[],
                    mitre_tactics=["Lateral Movement", "Discovery"],
                    mitre_techniques=["T1021", "T1018"],
                    business_risk_score=75.0,
                    detection_coverage=55.0,
                    remediation_plan="1. Implement network segmentation. 2. Enable lateral movement detection. 3. Reduce attack surface.",
                )
                scenarios.append(scenario)
        
        return scenarios
    
    def get_risk_summary(self) -> Dict:
        """Get overall risk summary"""
        if not self.assets:
            return {
                "total_assets": 0,
                "total_vulnerabilities": 0,
                "average_risk_score": 0,
                "critical_assets": 0,
                "high_risk_assets": 0
            }
        
        risk_scores = [a.risk_score for a in self.assets.values()]
        
        return {
            "total_assets": len(self.assets),
            "total_vulnerabilities": len(self.vulnerabilities),
            "average_risk_score": sum(risk_scores) / len(risk_scores),
            "critical_assets": len([a for a in self.assets.values() if a.risk_score >= 90]),
            "high_risk_assets": len([a for a in self.assets.values() if a.risk_score >= 70]),
            "medium_risk_assets": len([a for a in self.assets.values() if 40 <= a.risk_score < 70]),
            "low_risk_assets": len([a for a in self.assets.values() if a.risk_score < 40]),
            "risk_scenarios": len(self.risk_scenarios)
        }
