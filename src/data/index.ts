import { 
  Asset, 
  Vulnerability, 
  RiskScenario, 
  AssetCategory, 
  RiskLevel 
} from "@/lib/index";

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: "v-101",
    cveId: "CVE-2026-0115",
    title: "Critical Remote Code Execution in NGINX Core",
    description: "A heap-based buffer overflow in the core NGINX module allows unauthenticated remote attackers to execute arbitrary code via specially crafted HTTP/3 packets.",
    severity: "Critical",
    cvssScore: 9.8,
    publishedDate: "2026-01-15",
    remediationStatus: "Pending",
    affectedAssetsCount: 12
  },
  {
    id: "v-102",
    cveId: "CVE-2025-4492",
    title: "Broken Access Control in PostgreSQL Data Layer",
    description: "Flaw in row-level security implementation allows authenticated users to bypass read restrictions on sensitive financial tables.",
    severity: "High",
    cvssScore: 8.2,
    publishedDate: "2025-11-20",
    remediationStatus: "In Progress",
    affectedAssetsCount: 5
  },
  {
    id: "v-103",
    cveId: "CVE-2026-1122",
    title: "Log4j-NG Unauthenticated RCE",
    description: "The next-generation logging framework fails to properly sanitize JNDI lookup strings when processing user-agent headers in legacy compatibility mode.",
    severity: "Critical",
    cvssScore: 10.0,
    publishedDate: "2026-02-01",
    remediationStatus: "Pending",
    affectedAssetsCount: 45
  },
  {
    id: "v-104",
    cveId: "CVE-2024-8831",
    title: "Privilege Escalation in Windows Kernel API",
    description: "A local attacker can exploit a race condition in the win32k.sys driver to gain SYSTEM level privileges from a standard user account.",
    severity: "High",
    cvssScore: 7.8,
    publishedDate: "2024-09-12",
    remediationStatus: "Resolved",
    affectedAssetsCount: 150
  },
  {
    id: "v-105",
    cveId: "CVE-2026-0909",
    title: "IoT Gateway Insecure Default Credentials",
    description: "Firmware version 4.2.0 ships with a hidden debugging account 'tech_admin' with a static password that cannot be disabled via UI.",
    severity: "Medium",
    cvssScore: 6.5,
    publishedDate: "2026-01-05",
    remediationStatus: "In Progress",
    affectedAssetsCount: 22
  }
];

export const mockAssets: Asset[] = [
  {
    id: "a-001",
    name: "WEB-PROD-01",
    category: "Server",
    ipAddress: "10.0.1.45",
    os: "Ubuntu 24.04 LTS",
    criticality: "Mission Critical",
    riskScore: 88,
    vulnerabilityIds: ["v-101", "v-103"],
    lastScanDate: "2026-02-09",
    status: "Active",
    tags: ["DMZ", "Production", "Customer-Facing"],
    owner: "DevOps Team",
    location: "US-East-1"
  },
  {
    id: "a-002",
    name: "DB-FINANCE-ALPHA",
    category: "Database",
    ipAddress: "10.0.5.12",
    os: "Windows Server 2025",
    criticality: "Mission Critical",
    riskScore: 72,
    vulnerabilityIds: ["v-102", "v-104"],
    lastScanDate: "2026-02-08",
    status: "Active",
    tags: ["Internal", "Financial", "PCI-DSS"],
    owner: "DBA Team",
    location: "On-Premise DC-1"
  },
  {
    id: "a-003",
    name: "CLOUD-NODE-EDGE",
    category: "Cloud Instance",
    ipAddress: "54.212.4.99",
    os: "Amazon Linux 2025",
    criticality: "High",
    riskScore: 45,
    vulnerabilityIds: ["v-101"],
    lastScanDate: "2026-02-10",
    status: "Active",
    tags: ["Cloud", "Edge", "Caching"],
    owner: "Cloud Ops",
    location: "AWS us-west-2"
  },
  {
    id: "a-004",
    name: "OFFICE-VPN-GW",
    category: "Network Device",
    ipAddress: "192.168.50.1",
    os: "Cisco IOS-XE",
    criticality: "High",
    riskScore: 65,
    vulnerabilityIds: ["v-105"],
    lastScanDate: "2026-02-05",
    status: "Maintenance",
    tags: ["Network", "Infrastructure"],
    owner: "NetSec Team",
    location: "HQ Office"
  },
  {
    id: "a-005",
    name: "CEO-LAPTOP-M4",
    category: "Workstation",
    ipAddress: "172.16.10.55",
    os: "macOS 16.2",
    criticality: "High",
    riskScore: 30,
    vulnerabilityIds: ["v-104"],
    lastScanDate: "2026-02-10",
    status: "Active",
    tags: ["Endpoint", "VIP"],
    owner: "Executive Office",
    location: "Remote"
  }
];

export const mockRiskScenarios: RiskScenario[] = [
  {
    id: "rs-001",
    title: "Full Perimeter Breach via Multi-Stage Exploitation",
    description: "Attackers leverage unpatched RCE in public-facing web servers (WEB-PROD-01) to gain initial access, then exploit kernel vulnerabilities to escalate privileges and pivot to the internal finance database cluster.",
    category: "Data Breach & Exfiltration",
    severity: "Critical",
    likelihood: "Possible",
    impact: "Catastrophic",
    affectedAssetIds: ["a-001", "a-002"],
    correlatedVulnerabilityIds: ["v-101", "v-103", "v-104"],
    mitreTactics: ["Initial Access", "Privilege Escalation", "Lateral Movement", "Exfiltration"],
    mitreTechniques: ["T1190", "T1068", "T1021", "T1041"],
    businessRiskScore: 94,
    remediationPlan: "1. Immediate patch of NGINX and Log4j-NG. 2. Implementation of micro-segmentation between DMZ and DB zones. 3. Update EDR signatures for win32k exploit patterns.",
    updatedAt: "2026-02-10T11:45:00Z",
    detectionCoverage: 65
  },
  {
    id: "rs-002",
    title: "Ransomware Propagation through Insecure IoT Entry Point",
    description: "A compromised IoT Gateway (OFFICE-VPN-GW) via default credentials allows lateral movement into the corporate network, facilitating the deployment of crypto-locker variants across executive workstations.",
    category: "Ransomware Propagation",
    severity: "High",
    likelihood: "Likely",
    impact: "Significant",
    affectedAssetIds: ["a-004", "a-005"],
    correlatedVulnerabilityIds: ["v-105", "v-104"],
    mitreTactics: ["Initial Access", "Lateral Movement", "Impact"],
    mitreTechniques: ["T1078", "T1570", "T1486"],
    businessRiskScore: 78,
    remediationPlan: "1. Force password change for all IoT devices. 2. Disable unnecessary debug services on network equipment. 3. Implement strict outbound traffic filtering for the IoT VLAN.",
    updatedAt: "2026-02-10T09:30:00Z",
    detectionCoverage: 42
  },
  {
    id: "rs-003",
    title: "Cloud-Native Credential Theft & Data Siphoning",
    description: "Exploitation of RCE on edge cloud nodes allows attackers to capture IAM metadata tokens, leading to unauthorized access to S3 buckets containing customer financial records.",
    category: "Cloud Misconfiguration Exploitation",
    severity: "Critical",
    likelihood: "Rare",
    impact: "Catastrophic",
    affectedAssetIds: ["a-003"],
    correlatedVulnerabilityIds: ["v-101"],
    mitreTactics: ["Initial Access", "Credential Access", "Collection"],
    mitreTechniques: ["T1190", "T1552", "T1530"],
    businessRiskScore: 89,
    remediationPlan: "1. Rotate all IAM credentials. 2. Enable IMDSv2 enforcement on all EC2 instances. 3. Implement CloudWatch alerts for anomalous S3 access patterns.",
    updatedAt: "2026-02-09T18:20:00Z",
    detectionCoverage: 80
  }
];

export const mockCorrelationData = {
  assetVulnerabilityMap: [
    { assetId: "a-001", vulnIds: ["v-101", "v-103"] },
    { assetId: "a-002", vulnIds: ["v-102", "v-104"] },
    { assetId: "a-003", vulnIds: ["v-101"] },
    { assetId: "a-004", vulnIds: ["v-105"] },
    { assetId: "a-005", vulnIds: ["v-104"] }
  ],
  riskHeatMap: [
    { category: "Infrastructure", riskCount: 12, criticalCount: 4 },
    { category: "Cloud Services", riskCount: 8, criticalCount: 2 },
    { category: "Endpoints", riskCount: 25, criticalCount: 1 },
    { category: "Databases", riskCount: 5, criticalCount: 3 }
  ],
  mitreTacticCoverage: [
    { tactic: "Initial Access", coverage: 75 },
    { tactic: "Execution", coverage: 60 },
    { tactic: "Persistence", coverage: 45 },
    { tactic: "Privilege Escalation", coverage: 80 },
    { tactic: "Defense Evasion", coverage: 55 },
    { tactic: "Credential Access", coverage: 30 },
    { tactic: "Discovery", coverage: 90 },
    { tactic: "Lateral Movement", coverage: 40 },
    { tactic: "Exfiltration", coverage: 20 }
  ]
};