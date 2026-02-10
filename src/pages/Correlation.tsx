import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  ShieldAlert,
  TrendingUp,
  Zap,
  Target,
  Activity,
  ChevronRight,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getRiskSeverityColor,
  Asset,
  Vulnerability,
  RiskScenario
} from '@/lib/index';
import { useRiskData, useCorrelationAnalysis } from '@/hooks/useRiskData';
import {
  CorrelationMatrix,
  AssetTopologyChart,
  MitreCoverageChart
} from '@/components/Charts';
import { CorrelationCard, RiskScenarioCard } from '@/components/RiskCards';
import { IMAGES } from '@/assets/images';

export default function Correlation() {
  const { stats, correlationMetadata } = useRiskData();
  const { getHighLevelRiskInsights, getRiskPathways } = useCorrelationAnalysis();

  const topRiskScenarios = useMemo(() => {
    return getHighLevelRiskInsights.slice(0, 5);
  }, [getHighLevelRiskInsights]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-background/50">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Correlation Analysis</h1>
          <p className="text-muted-foreground">
            Multi-dimensional risk mapping and predictive attack path modeling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20 text-primary">
            <Activity className="mr-1 h-3 w-3" />
            Live Correlation Active
          </Badge>
          <span className="text-xs text-muted-foreground">Last sync: Feb 10, 2026 12:23:52</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correlated Risks</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getHighLevelRiskInsights.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.assetCount} assets
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Impact Paths</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalRisks}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictive Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Based on historical telemetry
            </p>
          </CardContent>
        </Card>
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defense Coverage</CardTitle>
            <ShieldCheck className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              MITRE ATT&CK mitigation map
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Asset Topology & Attack Paths</CardTitle>
                <CardDescription>Visualizing lateral movement risks across infrastructure nodes</CardDescription>
              </div>
              <Network className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[450px] relative">
            <AssetTopologyChart className="w-full h-full" />
            <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-lg border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive" /> Critical Risk
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" /> Mission Critical Asset
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-dashed border-muted-foreground" /> Probable Path
                </div>
              </div>
              <Badge variant="secondary">Dynamic View</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>MITRE ATT&CK Coverage</CardTitle>
            <CardDescription>Defensive posture against correlated tactics</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <MitreCoverageChart className="w-full h-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>High-Level Risk Scenarios</CardTitle>
              <CardDescription>Correlated scenarios targeting multiple assets and vulnerabilities</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Scenarios</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {topRiskScenarios.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RiskScenarioCard riskScenario={scenario} />
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 overflow-hidden">
            <img 
              src={IMAGES.DATA_VIZ_8} 
              alt="Correlation Insight" 
              className="w-full h-40 object-cover opacity-80"
            />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Probable Target</span>
                  <Badge variant="destructive" className="text-[10px]">High Confidence</Badge>
                </div>
                <p className="text-sm font-medium">ERP-Production-Database-01</p>
                <p className="text-xs text-muted-foreground mt-1">Likely vector: Lateral movement via compromised AD credentials (T1078.002)</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trend Alert</span>
                  <Badge variant="outline" className="text-[10px] text-accent border-accent/30">Anomalous Activity</Badge>
                </div>
                <p className="text-sm font-medium">External Beaconing Detected</p>
                <p className="text-xs text-muted-foreground mt-1">Increasing frequency of outbound connections from IoT-Sensor-Cluster-C.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Risk Distribution Matrix</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <CorrelationMatrix data={correlationMetadata} className="w-full h-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Correlation Engine Recommendation</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Based on the current attack path analysis, prioritizing the remediation of <strong>CVE-2026-1123</strong> on your workstation fleet will reduce the overall business risk score by <strong>42%</strong> by breaking the common lateral movement pathway to mission-critical servers.
            </p>
            <div className="mt-4 flex gap-3">
              <Button size="sm">Generate Remediation Plan</Button>
              <Button size="sm" variant="ghost">View Path Analysis</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'secondary', size?: 'sm' | 'md' }) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2',
  };
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant || 'default']} ${sizes[size || 'md']} ${className}`}
      {...props}
    />
  );
}
