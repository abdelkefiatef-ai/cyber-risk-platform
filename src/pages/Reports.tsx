import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Settings,
  CheckCircle2,
  Calendar,
  Filter,
  Layers,
  BarChart3,
  ChevronRight,
  Share2,
  History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IMAGES } from '@/assets/images';
import { useRiskData } from '@/hooks/useRiskData';
import { VulnerabilityTrendChart, MitreCoverageChart } from '@/components/Charts';
import { RiskScenarioTable } from '@/components/DataTables';

export default function Reports() {
  const { stats, riskScenarios, isLoading } = useRiskData();
  const [reportType, setReportType] = useState('executive');
  const [isGenerating, setIsGenerating] = useState(false);

  const complianceData = [
    { name: 'NIST CSF v2.0', score: 84, status: 'Improving' },
    { name: 'CIS Critical Controls', score: 72, status: 'Stable' },
    { name: 'SOC2 Type II', score: 91, status: 'Optimal' },
    { name: 'ISO 27001', score: 68, status: 'Needs Attention' },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Intelligence Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate executive-ready risk assessments and compliance posture audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            Archives
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating} className="gap-2 bg-primary text-primary-foreground">
            {isGenerating ? <Activity className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isGenerating ? 'Generating...' : 'Export PDF Report'}
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Sidebar Configuration */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Report Scope</Label>
                <Select defaultValue="all-assets">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-assets">Entire Infrastructure</SelectItem>
                    <SelectItem value="critical-only">Critical Assets Only</SelectItem>
                    <SelectItem value="cloud-infra">Cloud Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select defaultValue="last-30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7">Last 7 Days</SelectItem>
                    <SelectItem value="last-30">Last 30 Days</SelectItem>
                    <SelectItem value="last-90">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-xs uppercase text-muted-foreground">Included Sections</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sec-summary" defaultChecked />
                  <Label htmlFor="sec-summary" className="text-sm">Executive Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sec-risks" defaultChecked />
                  <Label htmlFor="sec-risks" className="text-sm">Correlated Risk Scenarios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sec-compliance" defaultChecked />
                  <Label htmlFor="sec-compliance" className="text-sm">Compliance Gaps</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sec-mitre" defaultChecked />
                  <Label htmlFor="sec-mitre" className="text-sm">MITRE ATT&CK Mapping</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full gap-2">
                <Share2 className="h-4 w-4" />
                Share Secure Link
              </Button>
            </CardFooter>
          </Card>

          <div className="relative rounded-xl overflow-hidden group">
             <img src={IMAGES.DATA_VIZ_5} alt="Analytics Decor" className="w-full h-40 object-cover opacity-40 transition-transform duration-500 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
             <div className="absolute bottom-4 left-4">
               <p className="text-xs font-mono text-primary">AI INSIGHT</p>
               <p className="text-sm font-medium">Ransomware risk has increased 12% in Cloud nodes since last report.</p>
             </div>
          </div>
        </div>

        {/* Main Dashboard Preview Area */}
        <div className="xl:col-span-3 space-y-8">
          <Tabs defaultValue="executive" className="w-full" onValueChange={setReportType}>
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 p-1 border border-border">
              <TabsTrigger value="executive" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Executive
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="detailed" className="gap-2">
                <Layers className="h-4 w-4" />
                Detailed
              </TabsTrigger>
            </TabsList>

            {/* Executive Overview */}
            <TabsContent value="executive" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase">Global Risk Score</CardDescription>
                    <CardTitle className="text-4xl font-bold">{stats.avgAssetRisk}<span className="text-sm font-normal text-muted-foreground ml-1">/100</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      +4.2% from last week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase">Critical Scenarios</CardDescription>
                    <CardTitle className="text-4xl font-bold">{stats.criticalRisks}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Across {stats.assetCount} assets
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase">Active Exploits</CardDescription>
                    <CardTitle className="text-4xl font-bold">12</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      8 patched in last 48h
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Vulnerability Exposure Trend</CardTitle>
                    <CardDescription>Correlation of identified CVEs over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <VulnerabilityTrendChart className="w-full h-full" />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">MITRE ATT&CK Tactics Coverage</CardTitle>
                    <CardDescription>Defensive control mapping against known threats</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <MitreCoverageChart className="w-full h-full" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Top Correlated Risk Scenarios</CardTitle>
                    <CardDescription>High-level scenarios impacting business continuity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <RiskScenarioTable data={riskScenarios.slice(0, 5)} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Report */}
            <TabsContent value="compliance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceData.map((framework) => (
                  <Card key={framework.name} className="border-border hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{framework.name}</CardTitle>
                          <CardDescription>Audit cycle: Feb 2026</CardDescription>
                        </div>
                        <Badge variant={framework.score > 80 ? 'default' : 'secondary'}>
                          {framework.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Overall Readiness</span>
                          <span className="font-medium">{framework.status}</span>
                        </div>
                        <Progress value={framework.score} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/30 p-2 rounded-md">
                          <p className="text-[10px] uppercase text-muted-foreground">Passed Controls</p>
                          <p className="text-sm font-semibold">142 / 168</p>
                        </div>
                        <div className="bg-muted/30 p-2 rounded-md">
                          <p className="text-[10px] uppercase text-muted-foreground">Pending Audit</p>
                          <p className="text-sm font-semibold">26</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Control Gap Analysis</CardTitle>
                  <CardDescription>Key areas requiring immediate remediation for compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[ 
                      { issue: 'Inconsistent Multi-Factor Authentication', impact: 'High', framework: 'SOC2, NIST' },
                      { issue: 'Encryption at Rest (Legacy Databases)', impact: 'Critical', framework: 'ISO 27001' },
                      { issue: 'Unstructured Logging in AWS S3', impact: 'Medium', framework: 'CIS' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${item.impact === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'}`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.issue}</p>
                            <p className="text-xs text-muted-foreground">Affects: {item.framework}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{item.impact} Impact</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detailed Analytics Preview */}
            <TabsContent value="detailed" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="relative overflow-hidden border-dashed">
                <img src={IMAGES.DATA_VIZ_6} alt="Data Flow" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                <CardContent className="pt-12 pb-12 text-center relative z-10">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <Layers className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Correlation Mapping</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    This section provides a deep-dive into cross-asset vulnerability pathways. 
                    Generate the full report to see the interactive topology map.
                  </p>
                  <Button onClick={handleGenerateReport} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Full Technical Report
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Report History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Weekly Executive Brief - Feb 03', 'Monthly Risk Assessment - Jan', 'Compliance Audit - Q4 2025'].map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {h}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">Monthly Compliance Audit</p>
                          <p className="text-[10px] text-muted-foreground">Next run: March 1st, 2026</p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground text-[10px]">Active</Badge>
                    </div>
                    <Button variant="outline" className="w-full text-xs h-9 gap-2">
                      <Filter className="h-3 w-3" />
                      Configure New Schedule
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
