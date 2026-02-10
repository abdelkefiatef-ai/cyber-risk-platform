export const ROUTE_PATHS = {
  DASHBOARD: "/",
  ASSETS: "/assets",
  RISK_SCENARIOS: "/risk-scenarios",
  VULNERABILITIES: "/vulnerabilities",
  CORRELATION: "/correlation",
  REPORTS: "/reports",
} as const;

export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type AssetCategory = 
  | "Workstation" 
  | "Server" 
  | "Cloud Instance" 
  | "Network Device" 
  | "Database" 
  | "IoT Device";

export interface Vulnerability {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: RiskLevel;
  cvssScore: number;
  publishedDate: string;
  remediationStatus: "Pending" | "In Progress" | "Resolved";
  affectedAssetsCount: number;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  ipAddress: string;
  os: string;
  criticality: "Low" | "Medium" | "High" | "Mission Critical";
  riskScore: number;
  vulnerabilityIds: string[];
  lastScanDate: string;
  status: "Active" | "Inactive" | "Maintenance";
  tags: string[];
  owner?: string;
  location?: string;
}

export interface RiskScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: RiskLevel;
  likelihood: "Rare" | "Possible" | "Likely" | "Certain";
  impact: "Minimal" | "Significant" | "Catastrophic";
  affectedAssetIds: string[];
  correlatedVulnerabilityIds: string[];
  mitreTactics: string[];
  mitreTechniques: string[];
  businessRiskScore: number;
  remediationPlan: string;
  updatedAt: string;
  detectionCoverage: number;
}

export const RISK_CATEGORIES = [
  "Data Breach & Exfiltration",
  "Ransomware Propagation",
  "Unauthorized Lateral Movement",
  "Privileged Account Takeover",
  "Supply Chain Compromise",
  "Cloud Misconfiguration Exploitation",
  "Distributed Denial of Service",
  "Insider Threat Activity",
] as const;

export const MITRE_TACTICS = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
] as const;

export function getRiskSeverityColor(level: RiskLevel): string {
  switch (level) {
    case "Critical":
      return "var(--destructive)";
    case "High":
      return "oklch(0.65 0.18 35)";
    case "Medium":
      return "var(--chart-3)";
    case "Low":
      return "var(--chart-2)";
    default:
      return "var(--muted-foreground)";
  }
}

export function calculateGlobalRiskScore(assets: Asset[]): number {
  if (assets.length === 0) return 0;
  const total = assets.reduce((acc, asset) => acc + asset.riskScore, 0);
  return Math.round(total / assets.length);
}

export function formatMitreId(id: string): string {
  return id.startsWith("T") ? id : `T${id}`;
}

export const SEVERITY_ORDER: Record<RiskLevel, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};