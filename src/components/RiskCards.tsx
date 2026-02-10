import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Cpu,
  Globe,
  Database,
  Network,
  ChevronRight,
  Zap,
  Target,
  Layers,
  Cloud,
  Monitor,
  Activity
} from 'lucide-react';
import {
  Asset,
  Vulnerability,
  RiskScenario,
  AssetCategory,
  getRiskSeverityColor,
  ROUTE_PATHS
} from '@/lib/index';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const springConfig = { type: 'spring', stiffness: 300, damping: 25 };

const CategoryIcon = ({ category, className }: { category: AssetCategory; className?: string }) => {
  switch (category) {
    case 'Workstation':
      return <Monitor className={className} />;
    case 'Server':
      return <ServerIcon className={className} />;
    case 'Cloud Instance':
      return <Cloud className={className} />;
    case 'Network Device':
      return <Network className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'IoT Device':
      return <Cpu className={className} />;
    default:
      return <Activity className={className} />;
  }
};

const ServerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

export function RiskScenarioCard({ riskScenario }: { riskScenario?: RiskScenario }) {
  if (!riskScenario) return null;

  const severityColor = getRiskSeverityColor(riskScenario.severity);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={springConfig}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group">
        <div 
          className="h-1.5 w-full" 
          style={{ backgroundColor: severityColor }}
        />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2 font-mono uppercase tracking-wider">
              {riskScenario.category}
            </Badge>
            <Badge 
              className="font-bold"
              style={{ backgroundColor: severityColor, color: 'white' }}
            >
              {riskScenario.severity}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
            {riskScenario.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1">
            {riskScenario.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium uppercase text-muted-foreground">
              <span>Business Risk Score</span>
              <span>{riskScenario.businessRiskScore}/100</span>
            </div>
            <Progress value={riskScenario.businessRiskScore} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-2 rounded-md border border-border/50">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Impact</p>
              <p className="text-sm font-semibold">{riskScenario.impact}</p>
            </div>
            <div className="bg-muted/30 p-2 rounded-md border border-border/50">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Likelihood</p>
              <p className="text-sm font-semibold">{riskScenario.likelihood}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {riskScenario.mitreTactics.slice(0, 3).map((tactic) => (
              <Badge key={tactic} variant="secondary" className="text-[10px] font-mono">
                {tactic}
              </Badge>
            ))}
            {riskScenario.mitreTactics.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{riskScenario.mitreTactics.length - 3} more</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary">
            <Link to={`${ROUTE_PATHS.RISK_SCENARIOS}/${riskScenario.id}`}>
              Analyze Risk Path
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function AssetRiskCard({ asset }: { asset?: Asset }) {
  if (!asset) return null;

  const riskLevel: any = asset.riskScore > 80 ? 'Critical' : asset.riskScore > 60 ? 'High' : asset.riskScore > 30 ? 'Medium' : 'Low';
  const statusColor = asset.status === 'Active' ? 'bg-emerald-500' : asset.status === 'Maintenance' ? 'bg-amber-500' : 'bg-slate-500';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="border-border bg-card hover:border-primary/50 transition-colors">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <CategoryIcon category={asset.category} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold truncate text-base">{asset.name}</h4>
              <div className={cn("h-2 w-2 rounded-full", statusColor)} />
            </div>
            <p className="text-xs font-mono text-muted-foreground truncate">{asset.ipAddress} • {asset.os}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Risk Score</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: getRiskSeverityColor(riskLevel) }}>
              {asset.riskScore}
            </p>
          </div>
        </CardContent>
        <div className="px-4 pb-4 flex gap-2">
          {asset.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5 h-5">
              {tag}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-[10px] ml-auto py-0 px-1.5 h-5">
            {asset.vulnerabilityIds.length} Vulnerabilities
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}

export function VulnerabilityCard({ vulnerability }: { vulnerability?: Vulnerability }) {
  if (!vulnerability) return null;

  const severityColor = getRiskSeverityColor(vulnerability.severity);

  return (
    <Card className="border-border hover:shadow-sm transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">
            {vulnerability.cveId}
          </Badge>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tabular-nums" style={{ color: severityColor }}>{vulnerability.cvssScore}</span>
            <div className="h-2 w-12 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all"
                style={{ width: `${vulnerability.cvssScore * 10}%`, backgroundColor: severityColor }}
              />
            </div>
          </div>
        </div>
        <CardTitle className="text-sm font-bold mt-2 leading-tight">{vulnerability.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {vulnerability.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] rounded-sm">
            {vulnerability.remediationStatus}
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {vulnerability.affectedAssetsCount} Affected Assets
        </span>
      </CardFooter>
    </Card>
  );
}

export function CorrelationCard({ correlationData }: { correlationData?: any }) {
  if (!correlationData) return null;

  return (
    <Card className="border-border bg-gradient-to-br from-card to-muted/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <Layers className="h-24 w-24" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Zap className="h-4 w-4 fill-primary" />
          <span className="text-[10px] uppercase font-black tracking-widest">High-Level Correlation</span>
        </div>
        <CardTitle className="text-lg">{correlationData.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
          
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold uppercase">Entry</span>
          </div>

          <div className="z-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase">Exploit</span>
          </div>

          <div className="z-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <span className="text-[10px] font-bold uppercase">Impact</span>
          </div>
        </div>

        <div className="space-y-2 bg-background/50 p-3 rounded-lg border border-border/50">
          {correlationData.path?.map((step: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                {idx + 1}
              </div>
              <span className="font-medium shrink-0">{step.type}:</span>
              <span className="text-muted-foreground truncate">{step.details}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full font-bold">
          View Full Attack Path
        </Button>
      </CardFooter>
    </Card>
  );
}
