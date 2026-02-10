import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  RiskLevel, 
  MITRE_TACTICS, 
  RISK_CATEGORIES, 
  getRiskSeverityColor 
} from '@/lib/index';
import { useRiskData } from '@/hooks/useRiskData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function RiskHeatMap({ className }: { data?: any; className?: string }) {
  const { riskScenarios } = useRiskData();
  
  const impactLevels = ['Minimal', 'Significant', 'Catastrophic'];
  const likelihoodLevels = ['Rare', 'Possible', 'Likely', 'Certain'];

  const getGridData = () => {
    const grid: Record<string, number> = {};
    riskScenarios.forEach(risk => {
      const key = `${risk.impact}-${risk.likelihood}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    return grid;
  };

  const gridData = getGridData();

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl", className)}>
      <h3 className="text-lg font-semibold mb-6">Risk Heat Map (Impact vs Likelihood)</h3>
      <div className="grid grid-cols-4 gap-2">
        {likelihoodLevels.map(likelihood => (
          <React.Fragment key={likelihood}>
            {impactLevels.map(impact => {
              const count = gridData[`${impact}-${likelihood}`] || 0;
              const intensity = Math.min(count * 20, 100);
              return (
                <motion.div
                  key={`${impact}-${likelihood}`}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-md border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group"
                  style={{
                    backgroundColor: count > 0 
                      ? `color-mix(in oklch, var(--destructive) ${intensity}%, var(--card))` 
                      : 'transparent'
                  }}
                >
                  <span className="text-xl font-bold z-10">{count > 0 ? count : ''}</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 text-[10px] text-center">
                    {likelihood} / {impact}
                  </div>
                </motion.div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground font-mono">
        <span>LOW IMPACT</span>
        <span>CRITICAL IMPACT</span>
      </div>
    </div>
  );
}

export function CorrelationMatrix({ className }: { data?: any; className?: string }) {
  const { riskScenarios, assets } = useRiskData();
  
  const topAssets = useMemo(() => assets.slice(0, 8), [assets]);
  const topRisks = useMemo(() => riskScenarios.slice(0, 6), [riskScenarios]);

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl overflow-x-auto", className)}>
      <h3 className="text-lg font-semibold mb-6">Asset-Risk Correlation Matrix</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-border text-left text-xs font-mono text-muted-foreground bg-muted/30">Asset / Risk</th>
            {topRisks.map(risk => (
              <th key={risk.id} className="p-2 border border-border text-xs font-mono text-muted-foreground whitespace-nowrap max-w-[100px] truncate">
                {risk.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topAssets.map(asset => (
            <tr key={asset.id}>
              <td className="p-2 border border-border text-xs font-medium bg-muted/10">{asset.name}</td>
              {topRisks.map(risk => {
                const isLinked = risk.affectedAssetIds.includes(asset.id);
                return (
                  <td 
                    key={`${asset.id}-${risk.id}`} 
                    className={cn(
                      "p-2 border border-border text-center transition-colors",
                      isLinked ? "bg-primary/20" : "hover:bg-muted/5"
                    )}
                  >
                    {isLinked && (
                      <div 
                        className="w-3 h-3 rounded-full mx-auto"
                        style={{ backgroundColor: getRiskSeverityColor(risk.severity) }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AssetTopologyChart({ className }: { data?: any; className?: string }) {
  const { assets, riskScenarios } = useRiskData();

  const criticalAssets = useMemo(() => 
    assets.filter(a => a.criticality === 'Mission Critical' || a.criticality === 'High').slice(0, 5)
  , [assets]);

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl relative min-h-[400px]", className)}>
      <h3 className="text-lg font-semibold mb-6">High-Value Asset Risk Topology</h3>
      <div className="flex items-center justify-center h-[300px] relative">
        {/* Central Hub */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-20 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        >
          <span className="text-xs font-bold text-center">GLOBAL<br/>RISK HUB</span>
        </motion.div>

        {/* Assets orbiting */}
        {criticalAssets.map((asset, idx) => {
          const angle = (idx / criticalAssets.length) * 2 * Math.PI;
          const x = Math.cos(angle) * 120;
          const y = Math.sin(angle) * 120;

          return (
            <React.Fragment key={asset.id}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line 
                  x1="50%" y1="50%" 
                  x2={`${50 + (x/3)}%`} y2={`${50 + (y/3)}%`} 
                  stroke="var(--border)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
              </svg>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x, y }}
                className="absolute p-3 rounded-lg bg-muted border border-border z-20 flex flex-col items-center gap-1"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <span className="text-[10px] font-mono text-muted-foreground">{asset.category}</span>
                <span className="text-xs font-bold whitespace-nowrap">{asset.name}</span>
                <div 
                  className="w-full h-1 rounded-full bg-border overflow-hidden"
                >
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${asset.riskScore}%` }}
                  />
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function VulnerabilityTrendChart({ className }: { data?: any; className?: string }) {
  const trendData = [
    { date: '2026-01-01', critical: 12, high: 45, medium: 88 },
    { date: '2026-01-10', critical: 15, high: 42, medium: 92 },
    { date: '2026-01-20', critical: 10, high: 38, medium: 95 },
    { date: '2026-01-30', critical: 18, high: 50, medium: 102 },
    { date: '2026-02-10', critical: 22, high: 55, medium: 110 },
  ];

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl h-[400px]", className)}>
      <h3 className="text-lg font-semibold mb-6">Vulnerability Trend (Last 45 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(str) => str.split('-').slice(1).join('/')}
          />
          <YAxis 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="critical" 
            stroke="var(--destructive)" 
            fillOpacity={1} 
            fill="url(#colorCrit)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="high" 
            stroke="oklch(0.65 0.18 35)" 
            fill="transparent" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="medium" 
            stroke="var(--chart-3)" 
            fill="transparent" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MitreCoverageChart({ className }: { data?: any; className?: string }) {
  const { riskScenarios } = useRiskData();

  const coverageData = useMemo(() => {
    const counts: Record<string, number> = {};
    MITRE_TACTICS.forEach(tactic => counts[tactic] = 0);
    
    riskScenarios.forEach(risk => {
      risk.mitreTactics.forEach(tactic => {
        if (counts[tactic] !== undefined) counts[tactic]++;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [riskScenarios]);

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl h-[400px]", className)}>
      <h3 className="text-lg font-semibold mb-6">MITRE ATT&CK Tactic Coverage</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={coverageData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            name="Tactic Frequency"
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
