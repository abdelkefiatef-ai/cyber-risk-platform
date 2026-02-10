import axios from "axios";

// Configuration de l'API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Types de données pour les actifs
export interface Asset {
  id: string;
  name: string;
  category: string;
  ip_address?: string;
  os?: string;
  criticality: "Low" | "Medium" | "High" | "Mission Critical";
  exposed_to_internet: boolean;
  contains_sensitive_data: boolean;
  patch_level?: string;
  risk_score?: number;
}

// Types de données pour les vulnérabilités
export interface Vulnerability {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  cvss_score?: number;
  affected_assets: string[];
  description?: string;
  remediation?: string;
  detected_date?: string;
}

// Types de données pour les scénarios de risque
export interface RiskScenario {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  business_risk_score: number;
  affected_assets: string[];
  attack_chain: string[];
  mitre_techniques?: string[];
  description?: string;
}

// Types de données pour le résumé des risques
export interface RiskSummary {
  total_assets: number;
  total_vulnerabilities: number;
  average_risk_score: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  last_scan_date?: string;
}

// Interface pour la réponse de l'API
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

// Vérifier la santé du serveur
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get<{ status: string }>(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.data.status === "ok";
  } catch (error) {
    return false;
  }
};

// Récupérer tous les actifs
export const getAssets = async (): Promise<Asset[]> => {
  try {
    const response = await axios.get<{ assets: Asset[] }>(`${API_BASE_URL}/assets`);
    return response.data.assets || [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
};

// Récupérer toutes les vulnérabilités
export const getVulnerabilities = async (): Promise<Vulnerability[]> => {
  try {
    const response = await axios.get<{ vulnerabilities: Vulnerability[] }>(
      `${API_BASE_URL}/vulnerabilities`
    );
    return response.data.vulnerabilities || [];
  } catch (error) {
    console.error("Error fetching vulnerabilities:", error);
    return [];
  }
};

// Récupérer les scénarios de risque
export const getRiskScenarios = async (): Promise<RiskScenario[]> => {
  try {
    const response = await axios.get<{ scenarios: RiskScenario[] }>(
      `${API_BASE_URL}/risk-scenarios`
    );
    return response.data.scenarios || [];
  } catch (error) {
    console.error("Error fetching risk scenarios:", error);
    return [];
  }
};

// Récupérer le résumé des risques
export const getRiskSummary = async (): Promise<RiskSummary> => {
  try {
    const response = await axios.get<RiskSummary>(`${API_BASE_URL}/risk-summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching risk summary:", error);
    return {
      total_assets: 0,
      total_vulnerabilities: 0,
      average_risk_score: 0,
      critical_risks: 0,
      high_risks: 0,
      medium_risks: 0,
      low_risks: 0,
    };
  }
};

// Lancer une analyse de risque
export const runRiskAnalysis = async (logs: {
  type: string;
  content: string;
}[]): Promise<ApiResponse<RiskSummary>> => {
  try {
    const response = await axios.post<ApiResponse<RiskSummary>>(
      `${API_BASE_URL}/analyze`,
      { logs }
    );
    return response.data;
  } catch (error) {
    console.error("Error running risk analysis:", error);
    return {
      status: "error",
      error: "Failed to run risk analysis",
    };
  }
};

// Récupérer les détails d'un actif
export const getAssetDetails = async (assetId: string): Promise<Asset | null> => {
  try {
    const assets = await getAssets();
    return assets.find((asset) => asset.id === assetId) || null;
  } catch (error) {
    console.error("Error fetching asset details:", error);
    return null;
  }
};

// Récupérer les vulnérabilités d'un actif
export const getAssetVulnerabilities = async (assetId: string): Promise<Vulnerability[]> => {
  try {
    const vulnerabilities = await getVulnerabilities();
    return vulnerabilities.filter((vuln) => vuln.affected_assets.includes(assetId));
  } catch (error) {
    console.error("Error fetching asset vulnerabilities:", error);
    return [];
  }
};

// Récupérer les scénarios de risque pour un actif
export const getAssetRiskScenarios = async (assetId: string): Promise<RiskScenario[]> => {
  try {
    const scenarios = await getRiskScenarios();
    return scenarios.filter((scenario) => scenario.affected_assets.includes(assetId));
  } catch (error) {
    console.error("Error fetching asset risk scenarios:", error);
    return [];
  }
};
