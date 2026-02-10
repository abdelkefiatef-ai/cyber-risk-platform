import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS, getRiskSeverityColor } from '@/lib/index';
import { useRiskData, useCorrelationAnalysis } from '@/hooks/useRiskData';
import { RiskScenarioCard, VulnerabilityCard } from '@/components/RiskCards';
import {
  RiskHeatMap,
  MitreCoverageChart,
  VulnerabilityTrendChart
} from '@/components/Charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const springPresets = {
  gentle: { type: 'spring', stiffness: 300, damping: 35 },
  snappy: { type: 'spring', stiffness: 400, damping: 30 }
};

export default function Dashboard() {
  const { stats, vulnerabilities } = useRiskData();
  const { getHighLevelRiskInsights } = useCorrelationAnalysis();

  const topRisks = getHighLevelRiskInsights.slice(0, 3);
  const recentVulns = vulnerabilities
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src={IMAGES.DASHBOARD_BG_1}
            alt="Dashboard background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Calendar className="h-4 w-4" />
              <span>Tuesday, February 10, 2026</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Cyber Risk Operations
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Unified correlation of configuration logs, agent telemetry, and vulnerabilities. 
              Moving beyond alerts to prioritized asset-centric risk scenarios.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to={ROUTE_PATHS.REPORTS}>View Reports</Link>
            </Button>
            <Button asChild>
              <Link to={ROUTE_PATHS.RISK_SCENARIOS} className="flex items-center gap-2">
                Analysis Center <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          {
            label: 'Total Assets',
            value: stats.assetCount,
            icon: Layers,
            color: 'var(--primary)',
            trend: '+2 since last scan'
          },
          {
            label: 'Critical Risks',
            value: stats.criticalRisks,
            icon: ShieldAlert,
            color: 'var(--destructive)',
            trend: 'Requires Immediate Action'
          },
          {
            label: 'Avg Risk Score',
            value: stats.avgAssetRisk,
            icon: Activity,
            color: 'var(--chart-3)',
            trend: 'Down 4% this month'
          },
          {
            label: 'Open Vulnerabilities',
            value: stats.totalVulnerabilities,
            icon: Target,
            color: 'var(--chart-4)',
            trend: '12 patched this week'
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
                  </div>
                  <div 
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color }}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* High Priority Risks - Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                High-Priority Correlated Scenarios
              </h2>
              <p className="text-sm text-muted-foreground">
                Top risk paths involving multiple vulnerabilities and critical assets
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTE_PATHS.RISK_SCENARIOS}>View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {topRisks.map((risk) => (
              <RiskScenarioCard key={risk.id} riskScenario={risk} />
            ))}
          </div>

          {/* Heatmap & Trend Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Risk Heatmap</CardTitle>
                <CardDescription>Correlation of criticality vs active risk score</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RiskHeatMap />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Trends</CardTitle>
                <CardDescription>Detected vulnerabilities over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <VulnerabilityTrendChart />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Analytics & Recents */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-48 relative">
              <img 
                src={IMAGES.SECURITY_MONITORING_8} 
                className="w-full h-full object-cover opacity-50 grayscale"
                alt="Security monitoring"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge className="mb-2" variant="secondary">MITRE Coverage</Badge>
                <h3 className="font-bold text-lg">ATT&CK Mapping</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <MitreCoverageChart className="h-[240px]" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Initial Access</div>
                  <div className="font-bold">84% Covered</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Lateral Movement</div>
                  <div className="font-bold">62% Covered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-chart-2" />
                Recent Vulnerabilities
              </h3>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to={ROUTE_PATHS.VULNERABILITIES}>View More</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {recentVulns.map((vuln) => (
                <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
              ))}
            </div>
          </div>

          {/* Global Status Banner */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm opacity-80 font-medium">Global Security Pulse</div>
                  <div className="font-bold text-lg">System Status: Optimal</div>
                  <p className="text-xs opacity-70 mt-1">
                    Last analysis run 4 minutes ago. No new high-level correlation paths detected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
