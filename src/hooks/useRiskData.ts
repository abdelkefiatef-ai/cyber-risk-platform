import { useState, useMemo, useEffect } from 'react';
import {
  Asset,
  Vulnerability,
  RiskScenario,
  AssetCategory,
  RiskLevel,
  SEVERITY_ORDER
} from '@/lib/index';
import {
  mockAssets,
  mockVulnerabilities,
  mockRiskScenarios,
  mockCorrelationData
} from '@/data/index';

export function useRiskData() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(mockVulnerabilities);
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>(mockRiskScenarios);
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => {
    const criticalRisks = riskScenarios.filter((r) => r.severity === 'Critical').length;
    const totalVulnerabilities = vulnerabilities.length;
    const avgAssetRisk = Math.round(
      assets.reduce((acc, a) => acc + a.riskScore, 0) / (assets.length || 1)
    );

    return {
      criticalRisks,
      totalVulnerabilities,
      avgAssetRisk,
      assetCount: assets.length
    };
  }, [assets, vulnerabilities, riskScenarios]);

  return {
    assets,
    vulnerabilities,
    riskScenarios,
    stats,
    isLoading,
    correlationMetadata: mockCorrelationData
  };
}

export function useAssetFilter(assets: Asset[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'All'>('All');
  const [minRiskScore, setMinRiskScore] = useState(0);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.ipAddress.includes(searchQuery) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
      const matchesRisk = asset.riskScore >= minRiskScore;

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [assets, searchQuery, categoryFilter, minRiskScore]);

  return {
    filteredAssets,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    minRiskScore,
    setMinRiskScore
  };
}

export function useCorrelationAnalysis() {
  const { assets, vulnerabilities, riskScenarios } = useRiskData();

  const getVulnerabilitiesForAsset = (asset: Asset): Vulnerability[] => {
    return vulnerabilities.filter((v) => asset.vulnerabilityIds.includes(v.id));
  };

  const getAssetsForRiskScenario = (scenario: RiskScenario): Asset[] => {
    return assets.filter((a) => scenario.affectedAssetIds.includes(a.id));
  };

  const getCorrelatedVulnerabilitiesForScenario = (scenario: RiskScenario): Vulnerability[] => {
    return vulnerabilities.filter((v) => scenario.correlatedVulnerabilityIds.includes(v.id));
  };

  const getHighLevelRiskInsights = useMemo(() => {
    return riskScenarios.map((scenario) => {
      const affectedAssets = getAssetsForRiskScenario(scenario);
      const linkedVulns = getCorrelatedVulnerabilitiesForScenario(scenario);
      
      const highestAssetCriticality = affectedAssets.reduce((max, asset) => {
        const levels: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3, 'Mission Critical': 4 };
        return levels[asset.criticality] > levels[max] ? asset.criticality : max;
      }, 'Low' as Asset['criticality']);

      return {
        ...scenario,
        affectedAssets,
        linkedVulns,
        highestAssetCriticality,
        impactScore: (scenario.businessRiskScore * 0.7) + (linkedVulns.length * 5)
      };
    }).sort((a, b) => b.impactScore - a.impactScore);
  }, [assets, vulnerabilities, riskScenarios]);

  const getRiskPathways = useMemo(() => {
    return riskScenarios.map(scenario => ({
      id: scenario.id,
      title: scenario.title,
      path: [
        { type: 'Initial Access', details: scenario.mitreTactics[0] },
        { type: 'Vulnerabilities', details: `${scenario.correlatedVulnerabilityIds.length} CVEs` },
        { type: 'Affected Assets', details: `${scenario.affectedAssetIds.length} Nodes` }
      ]
    }));
  }, [riskScenarios]);

  return {
    getVulnerabilitiesForAsset,
    getAssetsForRiskScenario,
    getCorrelatedVulnerabilitiesForScenario,
    getHighLevelRiskInsights,
    getRiskPathways
  };
}
