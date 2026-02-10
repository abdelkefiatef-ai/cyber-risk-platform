"""
Risk Calculation Models
Defines all data structures for the risk calculation engine
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set
from datetime import datetime
from enum import Enum


class RiskLevel(Enum):
    """Risk severity levels"""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFORMATIONAL = "Informational"


class AssetCategory(Enum):
    """Asset category types"""
    WORKSTATION = "Workstation"
    SERVER = "Server"
    CLOUD_INSTANCE = "Cloud Instance"
    NETWORK_DEVICE = "Network Device"
    DATABASE = "Database"
    IOT_DEVICE = "IoT Device"
    CONTAINER = "Container"
    SAAS_APPLICATION = "SaaS Application"


class AssetCriticality(Enum):
    """Asset business criticality"""
    MISSION_CRITICAL = "Mission Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class VulnerabilitySource(Enum):
    """Source of vulnerability detection"""
    SYSLOG = "Syslog"
    WINDOWS_EVENT = "Windows Event"
    WINDOWS_SECURITY = "Windows Security"
    M365_DEFENDER = "M365 Defender"
    DEFENDER_SECURITY = "Defender Security"
    VULNERABILITY_SCANNER = "Vulnerability Scanner"
    MANUAL = "Manual"


@dataclass
class Vulnerability:
    """Represents a security vulnerability"""
    id: str
    cve_id: Optional[str]
    title: str
    description: str
    severity: RiskLevel
    cvss_score: float
    cvss_vector: Optional[str] = None
    published_date: datetime = field(default_factory=datetime.now)
    discovered_date: datetime = field(default_factory=datetime.now)
    source: VulnerabilitySource = VulnerabilitySource.MANUAL
    affected_assets: List[str] = field(default_factory=list)
    exploit_available: bool = False
    exploit_public: bool = False
    patch_available: bool = False
    remediation_status: str = "Pending"
    
    # CVSS metrics
    attack_vector: Optional[str] = None  # Network, Adjacent, Local, Physical
    attack_complexity: Optional[str] = None  # Low, High
    privileges_required: Optional[str] = None  # None, Low, High
    user_interaction: Optional[str] = None  # None, Required
    
    # Additional metadata
    tags: List[str] = field(default_factory=list)
    references: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "cveId": self.cve_id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity.value,
            "cvssScore": self.cvss_score,
            "cvssVector": self.cvss_vector,
            "publishedDate": self.published_date.isoformat(),
            "discoveredDate": self.discovered_date.isoformat(),
            "source": self.source.value,
            "affectedAssetsCount": len(self.affected_assets),
            "exploitAvailable": self.exploit_available,
            "exploitPublic": self.exploit_public,
            "patchAvailable": self.patch_available,
            "remediationStatus": self.remediation_status,
            "attackVector": self.attack_vector,
            "attackComplexity": self.attack_complexity,
            "privilegesRequired": self.privileges_required,
            "userInteraction": self.user_interaction,
            "tags": self.tags,
            "references": self.references
        }


@dataclass
class Asset:
    """Represents an IT asset"""
    id: str
    name: str
    category: AssetCategory
    ip_address: str
    os: str
    os_version: Optional[str] = None
    criticality: AssetCriticality = AssetCriticality.MEDIUM
    vulnerability_ids: List[str] = field(default_factory=list)
    last_scan_date: datetime = field(default_factory=datetime.now)
    status: str = "Active"  # Active, Inactive, Maintenance
    tags: List[str] = field(default_factory=list)
    owner: Optional[str] = None
    location: Optional[str] = None
    
    # Dynamic risk factors
    exposed_to_internet: bool = False
    contains_sensitive_data: bool = False
    patch_level: str = "Unknown"  # Current, Outdated, Critical
    antivirus_status: str = "Unknown"  # Active, Inactive, Outdated
    firewall_enabled: bool = True
    
    # Calculated fields
    _risk_score: Optional[float] = None
    
    @property
    def risk_score(self) -> float:
        """Get or calculate risk score"""
        if self._risk_score is not None:
            return self._risk_score
        return 0.0
    
    @risk_score.setter
    def risk_score(self, value: float):
        """Set risk score"""
        self._risk_score = value
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category.value,
            "ipAddress": self.ip_address,
            "os": self.os,
            "osVersion": self.os_version,
            "criticality": self.criticality.value,
            "riskScore": int(self.risk_score),
            "vulnerabilityIds": self.vulnerability_ids,
            "lastScanDate": self.last_scan_date.isoformat(),
            "status": self.status,
            "tags": self.tags,
            "owner": self.owner,
            "location": self.location,
            "exposedToInternet": self.exposed_to_internet,
            "containsSensitiveData": self.contains_sensitive_data,
            "patchLevel": self.patch_level,
            "antivirusStatus": self.antivirus_status,
            "firewallEnabled": self.firewall_enabled
        }


@dataclass
class RiskScenario:
    """Represents a security risk scenario"""
    id: str
    title: str
    description: str
    category: str
    severity: RiskLevel
    likelihood: str  # Rare, Possible, Likely, Certain
    impact: str  # Minimal, Significant, Catastrophic
    affected_asset_ids: List[str] = field(default_factory=list)
    correlated_vulnerability_ids: List[str] = field(default_factory=list)
    mitre_tactics: List[str] = field(default_factory=list)
    mitre_techniques: List[str] = field(default_factory=list)
    business_risk_score: float = 0.0
    detection_coverage: float = 0.0
    remediation_plan: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    # Evidence from logs
    log_evidence: List[Dict] = field(default_factory=list)
    indicators_of_compromise: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "severity": self.severity.value,
            "likelihood": self.likelihood,
            "impact": self.impact,
            "affectedAssetIds": self.affected_asset_ids,
            "correlatedVulnerabilityIds": self.correlated_vulnerability_ids,
            "mitreTactics": self.mitre_tactics,
            "mitreTechniques": self.mitre_techniques,
            "businessRiskScore": self.business_risk_score,
            "detectionCoverage": self.detection_coverage,
            "remediationPlan": self.remediation_plan,
            "updatedAt": self.updated_at.isoformat(),
            "logEvidence": self.log_evidence,
            "indicatorsOfCompromise": self.indicators_of_compromise
        }


@dataclass
class LogEvent:
    """Base class for log events"""
    event_id: str
    timestamp: datetime
    source: str
    severity: str
    hostname: str
    ip_address: Optional[str] = None
    user: Optional[str] = None
    raw_log: str = ""
    parsed_data: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "eventId": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
            "severity": self.severity,
            "hostname": self.hostname,
            "ipAddress": self.ip_address,
            "user": self.user,
            "rawLog": self.raw_log,
            "parsedData": self.parsed_data
        }


@dataclass
class RiskCalculationResult:
    """Result of risk calculation"""
    asset_id: str
    total_risk_score: float
    vulnerability_risk: float
    exposure_risk: float
    criticality_multiplier: float
    threat_intelligence_factor: float
    contributing_vulnerabilities: List[str]
    risk_factors: Dict[str, float]
    recommendations: List[str]
    calculated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "assetId": self.asset_id,
            "totalRiskScore": round(self.total_risk_score, 2),
            "vulnerabilityRisk": round(self.vulnerability_risk, 2),
            "exposureRisk": round(self.exposure_risk, 2),
            "criticalityMultiplier": round(self.criticality_multiplier, 2),
            "threatIntelligenceFactor": round(self.threat_intelligence_factor, 2),
            "contributingVulnerabilities": self.contributing_vulnerabilities,
            "riskFactors": {k: round(v, 2) for k, v in self.risk_factors.items()},
            "recommendations": self.recommendations,
            "calculatedAt": self.calculated_at.isoformat()
        }
