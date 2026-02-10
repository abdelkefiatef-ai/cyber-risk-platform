import React, { useMemo } from 'react';
import { 
  Shield, 
  Database, 
  Server, 
  Laptop, 
  Cloud, 
  Wifi, 
  Search, 
  Plus, 
  Download,
  Activity,
  AlertTriangle,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  Asset, 
  AssetCategory, 
  getRiskSeverityColor 
} from '@/lib/index';
import { 
  useRiskData, 
  useAssetFilter 
} from '@/hooks/useRiskData';
import { AssetTable } from '@/components/DataTables';
import { AssetTopologyChart, MitreCoverageChart } from '@/components/Charts';
import { AssetCategoryFilter, RiskLevelFilter } from '@/components/Filters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IMAGES } from '@/assets/images';

export default function Assets() {
  const { assets, isLoading } = useRiskData();
  const {
    filteredAssets,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter
  } = useAssetFilter(assets);

  const stats = useMemo(() => {
    const missionCritical = assets.filter(a => a.criticality === 'Mission Critical').length;
    const active = assets.filter(a => a.status === 'Active').length;
    const avgRisk = assets.length > 0 
      ? Math.round(assets.reduce((acc, curr) => acc + curr.riskScore, 0) / assets.length) 
      : 0;

    return { missionCritical, active, avgRisk, total: assets.length };
  }, [assets]);

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'Server': return <Server className="h-4 w-4" />;
      case 'Workstation': return <Laptop className="h-4 w-4" />;
      case 'Cloud Instance': return <Cloud className="h-4 w-4" />;
      case 'Database': return <Database className="h-4 w-4" />;
      case 'IoT Device': return <Wifi className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor technical assets across your infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mission Critical</p>
                <h3 className="text-2xl font-bold text-destructive">{stats.missionCritical}</h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Risk Score</p>
                <h3 className="text-2xl font-bold">{stats.avgRisk}</h3>
              </div>
              <div className="p-2 bg-chart-3/10 rounded-full">
                <Activity className="h-5 w-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitors</p>
                <h3 className="text-2xl font-bold">{stats.active}</h3>
              </div>
              <div className="p-2 bg-chart-2/10 rounded-full">
                <Activity className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List and Filters */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold">Inventory</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      className="pl-9 bg-background/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Tabs defaultValue="list">
                    <TabsList>
                      <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
                      <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <AssetCategoryFilter 
                  onFilterChange={(f: any) => setCategoryFilter(f.category || 'All')} 
                  className="w-fit"
                />
                <RiskLevelFilter className="w-fit" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AssetTable 
                data={filteredAssets} 
                onRowClick={(asset) => console.log('Clicked asset:', asset.id)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization & Details */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-card/30 overflow-hidden relative">
            <img 
              src={IMAGES.SERVER_ROOM_1} 
              alt="Infrastructure Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg">Asset Topology</CardTitle>
              <CardDescription>Network relationships and critical pathways</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] relative z-10">
              <AssetTopologyChart data={filteredAssets} className="h-full w-full" />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">MITRE ATT&CK Coverage</CardTitle>
              <CardDescription>Defense capabilities across the fleet</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <MitreCoverageChart className="h-full w-full" />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Server', 'Cloud Instance', 'Workstation', 'Database', 'IoT Device'].map((cat) => {
                const count = assets.filter(a => a.category === cat).length;
                const percentage = (count / assets.length) * 100;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat as AssetCategory)}
                        <span>{cat}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
