import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  Network,
  Target,
  LayoutDashboard,
  ChevronRight,
  AlertTriangle,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { 
  RiskScenario, 
  getRiskSeverityColor 
} from '@/lib/index';
import { 
  useRiskData, 
  useCorrelationAnalysis 
} from '@/hooks/useRiskData';
import { 
  RiskScenarioCard 
} from '@/components/RiskCards';
import { 
  RiskHeatMap, 
  MitreCoverageChart, 
  AssetTopologyChart 
} from '@/components/Charts';
import { 
  RiskScenarioTable 
} from '@/components/DataTables';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function RiskScenarios() {
  const { riskScenarios, isLoading } = useRiskData();
  const { getHighLevelRiskInsights, getRiskPathways } = useCorrelationAnalysis();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredScenarios = useMemo(() => {
    return getHighLevelRiskInsights.filter(scenario => {
      const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || scenario.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [getHighLevelRiskInsights, searchQuery, selectedCategory]);

  const categories = ['All', ...Array.from(new Set(riskScenarios.map(s => s.category)))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Correlating risk data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">Risk Correlation Engine</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Risk Scenarios</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Correlated cyber risks identifying multi-asset attack paths and technical vulnerability clusters.
            Instead of isolated alerts, these scenarios represent high-level business impact trajectories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Zap className="w-4 h-4" />
            Simulate Scenario
          </Button>
          <Button className="gap-2">
            <Target className="w-4 h-4" />
            Prioritize Remediation
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[ 
          { label: 'Active Scenarios', value: riskScenarios.length, icon: ShieldAlert, color: 'text-primary' },
          { label: 'High Impact Clusters', value: riskScenarios.filter(s => s.severity === 'Critical' || s.severity === 'High').length, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Asset Nodes Involved', value: Array.from(new Set(riskScenarios.flatMap(s => s.affectedAssetIds))).length, icon: Network, color: 'text-chart-2' },
          { label: 'Correlated CVEs', value: Array.from(new Set(riskScenarios.flatMap(s => s.correlatedVulnerabilityIds))).length, icon: LayoutDashboard, color: 'text-chart-4' }
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={stat.color}>
                <stat.icon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="font-mono">v2.4</Badge>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="scenarios" className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-border">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Risk Scenarios</TabsTrigger>
            <TabsTrigger value="visuals" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Visual Analysis</TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Raw Data View</TabsTrigger>
          </TabsList>

          <div className="hidden lg:flex items-center gap-2 pb-2">
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search scenarios..." 
                  className="pl-9 h-9 bg-muted/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex gap-1">
                {categories.slice(0, 4).map(cat => (
                  <Button 
                    key={cat} 
                    variant={selectedCategory === cat ? "secondary" : "ghost"} 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
             </div>
          </div>
        </div>

        <TabsContent value="scenarios" className="mt-0">
          <motion.div 
            variants={staggerContainer} 
            initial="initial" 
            animate="animate" 
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {filteredScenarios.map((scenario) => (
              <motion.div key={scenario.id} variants={fadeInUp}>
                <RiskScenarioCard riskScenario={scenario} />
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Correlated Assets</span>
                    <span className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                      View Topology <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.affectedAssets.map(asset => (
                      <div key={asset.id} className="flex items-center gap-2 px-2 py-1 rounded bg-card border border-border/40 text-[10px] font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {asset.name} ({asset.ipAddress})
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-muted-foreground uppercase">Attack Path Progress</span>
                       <span className="text-xs font-mono">{Math.round(scenario.impactScore)} Impact Index</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                       <div 
                         className="h-full bg-primary transition-all"
                         style={{ 
                           width: `${Math.min(scenario.impactScore, 100)}%`, 
                           backgroundColor: getRiskSeverityColor(scenario.severity) 
                         }}
                       />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="visuals" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Scenario Risk Distribution
                </CardTitle>
                <CardDescription>Correlation of scenario likelihood vs impact across entire asset surface</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <RiskHeatMap data={riskScenarios} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  MITRE Coverage
                </CardTitle>
                <CardDescription>Technique visibility across scenarios</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MitreCoverageChart data={riskScenarios} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Multi-Asset Attack Path Propagation
              </CardTitle>
              <CardDescription>Visualizing how technical vulnerabilities bridge across different asset categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <AssetTopologyChart className="w-full h-full" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <RiskScenarioTable data={filteredScenarios} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Context Section */}
      <footer className="border-t border-border pt-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
        <div>
          <h4 className="font-bold text-foreground mb-3">Correlation Logic</h4>
          <p>Our engine uses multi-dimensional analysis to bridge log data from endpoint agents, network sniffers, and cloud metadata to create these scenarios.</p>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-3">Compliance Context</h4>
          <p>Scenarios are mapped directly to NIST 800-53 and ISO 27001 controls to help prioritize remediation based on regulatory importance.</p>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-3">Real-time Intelligence</h4>
          <p>Scenario definitions are updated every 6 hours with the latest threat intelligence feeds and zero-day vulnerability disclosures.</p>
        </div>
      </footer>

      <div className="flex justify-center text-[10px] text-muted-foreground/50 tracking-widest uppercase py-4">
        © 2026 Cyber Risk Analytics Platform • Confidential
      </div>
    </div>
  );
}
