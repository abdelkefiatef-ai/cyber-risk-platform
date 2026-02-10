import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Filter, 
  Search,
  Download,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { 
  Vulnerability, 
  Asset, 
  RiskLevel, 
  getRiskSeverityColor 
} from '@/lib/index';
import { 
  useRiskData, 
  useCorrelationAnalysis 
} from '@/hooks/useRiskData';
import { VulnerabilityTable } from '@/components/DataTables';
import { VulnerabilityTrendChart, RiskHeatMap } from '@/components/Charts';
import { 
  VulnerabilityTypeFilter, 
  RiskLevelFilter, 
  TimeRangeFilter 
} from '@/components/Filters';
import { VulnerabilityCard } from '@/components/RiskCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Vulnerabilities() {
  const { vulnerabilities, assets, isLoading } = useRiskData();
  const { getHighLevelRiskInsights } = useCorrelationAnalysis();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const stats = useMemo(() => {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
    const avgCvss = vulnerabilities.reduce((acc, v) => acc + v.cvssScore, 0) / (vulnerabilities.length || 1);
    const inProgress = vulnerabilities.filter(v => v.remediationStatus === 'In Progress').length;

    return {
      total: vulnerabilities.length,
      critical: criticalCount,
      high: highCount,
      avgCvss: avgCvss.toFixed(1),
      remediationRate: Math.round((inProgress / (vulnerabilities.length || 1)) * 100)
    };
  }, [vulnerabilities]);

  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter(v => 
      v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vulnerabilities, searchQuery]);

  const topCriticalVulns = useMemo(() => {
    return [...vulnerabilities]
      .sort((a, b) => b.cvssScore - a.cvssScore)
      .slice(0, 3);
  }, [vulnerabilities]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-background">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vulnerability Management</h1>
          <p className="text-muted-foreground">Analyze, prioritize, and remediate technical vulnerabilities across your asset categories.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Run Scan
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical CVEs</p>
                <h3 className="text-2xl font-bold">{stats.critical}</h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average CVSS</p>
                <h3 className="text-2xl font-bold">{stats.avgCvss}</h3>
              </div>
              <div className="p-2 bg-chart-3/10 rounded-full">
                <BarChart3 className="h-5 w-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remediation In-Progress</p>
                <h3 className="text-2xl font-bold">{stats.remediationRate}%</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assets Secured</p>
                <h3 className="text-2xl font-bold">{assets.filter(a => a.status === 'Active').length}</h3>
              </div>
              <div className="p-2 bg-chart-2/10 rounded-full">
                <ShieldCheck className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Vulnerability Trends (2026)</CardTitle>
              <CardDescription>Exploitation activity vs. remediation velocity over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <VulnerabilityTrendChart className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Priority Remediation</CardTitle>
              <CardDescription>Vulnerabilities correlated with highest business impact.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {topCriticalVulns.map((vuln) => (
                <div key={vuln.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-mono">{vuln.cveId}</Badge>
                    <span className="text-sm font-bold" style={{ color: getRiskSeverityColor(vuln.severity) }}>
                      CVSS {vuln.cvssScore}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{vuln.title}</p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 mr-1 text-destructive" />
                    <span>Affects {vuln.affectedAssetsCount} mission-critical assets</span>
                  </div>
                </div>
              ))}
              <Button variant="link" className="text-primary text-sm self-start p-0">
                View correlation analysis →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="inventory">Vulnerability Inventory</TabsTrigger>
            <TabsTrigger value="prioritization">Prioritization Matrix</TabsTrigger>
            <TabsTrigger value="patching">Patch Management</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search CVE or title..." 
                className="pl-9 w-[200px] lg:w-[300px] h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="inventory" className="mt-0">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <RiskLevelFilter className="w-40" />
                  <VulnerabilityTypeFilter className="w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <VulnerabilityTable data={filteredVulnerabilities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prioritization" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Category Risk Map</CardTitle>
                <CardDescription>Correlation between asset criticality and vulnerability severity.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <RiskHeatMap className="h-full w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Remediation Urgency</CardTitle>
                <CardDescription>Calculated based on exploit maturity and business impact.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getHighLevelRiskInsights.slice(0, 5).map((insight) => (
                    <div key={insight.id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{insight.title}</span>
                        <div className="flex gap-2 mt-1">
                          {insight.mitreTactics.slice(0, 2).map(t => (
                            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Risk Impact</div>
                        <Badge className="bg-destructive/20 text-destructive border-destructive/20 font-bold">
                          {insight.impactScore.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patching" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Patching Workflow Status</CardTitle>
              <CardDescription>Tracking remediation progress across organizational units.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    Pending Analysis
                  </h4>
                  {vulnerabilities.filter(v => v.remediationStatus === 'Pending').slice(0, 3).map(v => (
                    <VulnerabilityCard key={v.id} vulnerability={v} />
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Active Remediation
                  </h4>
                  {vulnerabilities.filter(v => v.remediationStatus === 'In Progress').slice(0, 3).map(v => (
                    <VulnerabilityCard key={v.id} vulnerability={v} />
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-2" />
                    Verified Patched
                  </h4>
                  {vulnerabilities.filter(v => v.remediationStatus === 'Resolved').slice(0, 3).map(v => (
                    <VulnerabilityCard key={v.id} vulnerability={v} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
