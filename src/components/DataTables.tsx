import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Asset,
  Vulnerability,
  RiskScenario,
  getRiskSeverityColor,
  SEVERITY_ORDER,
} from "@/lib/index";
import { 
  ArrowUpDown, 
  ChevronRight, 
  ShieldAlert, 
  Server, 
  Monitor, 
  Cloud, 
  Database, 
  Cpu, 
  Globe 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TableProps<T> {
  data?: T[];
  onRowClick?: (item: T) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Workstation': return <Monitor className="w-4 h-4" />;
    case 'Server': return <Server className="w-4 h-4" />;
    case 'Cloud Instance': return <Cloud className="w-4 h-4" />;
    case 'Network Device': return <Globe className="w-4 h-4" />;
    case 'Database': return <Database className="w-4 h-4" />;
    default: return <Cpu className="w-4 h-4" />;
  }
};

export function AssetTable({ data = [], onRowClick, className }: TableProps<Asset>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: keyof Asset) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">
              <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="-ml-3 hover:bg-accent">
                Asset Name <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" onClick={() => handleSort('riskScore')} className="-ml-3">
                Risk Score <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Criticality</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((asset) => (
            <TableRow 
              key={asset.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onRowClick?.(asset)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{asset.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{asset.os}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getCategoryIcon(asset.category)}
                  <span className="text-xs">{asset.category}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{asset.ipAddress}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 w-[100px]">
                  <Progress value={asset.riskScore} className="h-1.5" />
                  <span className="text-xs font-semibold">{asset.riskScore}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {asset.criticality}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    asset.status === 'Active' ? "bg-green-500" : asset.status === 'Maintenance' ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  <span className="text-xs">{asset.status}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function VulnerabilityTable({ data = [], onRowClick, className }: TableProps<Vulnerability>) {
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);
  }, [data]);

  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[150px]">CVE ID</TableHead>
            <TableHead>Vulnerability Title</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>CVSS</TableHead>
            <TableHead>Remediation</TableHead>
            <TableHead>Affected</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((vuln) => (
            <TableRow 
              key={vuln.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onRowClick?.(vuln)}
            >
              <TableCell className="font-mono font-bold text-primary">
                {vuln.cveId}
              </TableCell>
              <TableCell className="max-w-[300px] truncate font-medium">
                {vuln.title}
              </TableCell>
              <TableCell>
                <Badge 
                  style={{ backgroundColor: getRiskSeverityColor(vuln.severity), color: 'white' }}
                  className="border-none"
                >
                  {vuln.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "font-mono font-bold",
                  vuln.cvssScore >= 9 ? "text-destructive" : vuln.cvssScore >= 7 ? "text-orange-500" : "text-foreground"
                )}>
                  {vuln.cvssScore.toFixed(1)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {vuln.remediationStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {vuln.affectedAssetsCount} Assets
              </TableCell>
              <TableCell className="text-right">
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RiskScenarioTable({ data = [], onRowClick, className }: TableProps<RiskScenario>) {
  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Risk Scenario</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Business Score</TableHead>
            <TableHead>MITRE Tactics</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((scenario) => (
            <TableRow 
              key={scenario.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onRowClick?.(scenario)}
            >
              <TableCell>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldAlert 
                      className="w-5 h-5" 
                      style={{ color: getRiskSeverityColor(scenario.severity) }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm leading-tight">{scenario.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{scenario.description}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className="font-semibold"
                  style={{ 
                    borderColor: getRiskSeverityColor(scenario.severity), 
                    color: getRiskSeverityColor(scenario.severity) 
                  }}
                >
                  {scenario.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  scenario.impact === 'Catastrophic' ? "bg-destructive/10 text-destructive" : 
                  scenario.impact === 'Significant' ? "bg-orange-500/10 text-orange-600" : "bg-muted text-muted-foreground"
                )}>
                  {scenario.impact}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-mono">{scenario.businessRiskScore}/100</span>
                  <Progress value={scenario.businessRiskScore} className="h-1 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {scenario.mitreTactics.slice(0, 2).map((tactic) => (
                    <Badge key={tactic} variant="secondary" className="text-[10px] py-0 px-1.5 h-auto">
                      {tactic}
                    </Badge>
                  ))}
                  {scenario.mitreTactics.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">+{scenario.mitreTactics.length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
