import * as React from "react";
import { 
  Search, 
  Filter, 
  Check, 
  ChevronDown, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Crosshair 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AssetCategory,
  RiskLevel,
  MITRE_TACTICS,
  getRiskSeverityColor,
} from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterProps {
  onFilterChange?: (filters: any) => void;
  className?: string;
}

export function AssetCategoryFilter({ onFilterChange, className }: FilterProps) {
  const categories: AssetCategory[] = [
    "Workstation",
    "Server",
    "Cloud Instance",
    "Network Device",
    "Database",
    "IoT Device",
  ];
  const [selected, setSelected] = React.useState<AssetCategory[]>([]);

  const toggleCategory = (category: AssetCategory) => {
    const next = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category];
    setSelected(next);
    onFilterChange?.(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Categories</Label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selected.includes(category) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:bg-primary/20"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function RiskLevelFilter({ onFilterChange, className }: FilterProps) {
  const levels: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
  const [selected, setSelected] = React.useState<RiskLevel[]>([]);

  const toggleLevel = (level: RiskLevel) => {
    const next = selected.includes(level)
      ? selected.filter((l) => l !== level)
      : [...selected, level];
    setSelected(next);
    onFilterChange?.(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Levels</Label>
      <div className="flex gap-2">
        {levels.map((level) => {
          const color = getRiskSeverityColor(level);
          const isActive = selected.includes(level);
          return (
            <Button
              key={level}
              variant="outline"
              size="sm"
              onClick={() => toggleLevel(level)}
              className={cn(
                "h-8 text-xs font-semibold border-l-4 transition-all",
                isActive ? "bg-accent" : "bg-transparent hover:bg-accent/50"
              )}
              style={{ borderLeftColor: color }}
            >
              {level}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function VulnerabilityTypeFilter({ onFilterChange, className }: FilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vulnerability Status</Label>
      <Select onValueChange={(val) => onFilterChange?.(val)}>
        <SelectTrigger className="h-9 bg-background/50 border-border/50">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vulnerabilities</SelectItem>
          <SelectItem value="Pending">Pending Remediation</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Resolved">Resolved / Patched</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function MitreTacticFilter({ onFilterChange, className }: FilterProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggleTactic = (tactic: string) => {
    const next = selected.includes(tactic)
      ? selected.filter((t) => t !== tactic)
      : [...selected, tactic];
    setSelected(next);
    onFilterChange?.(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MITRE ATT&CK Tactics</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 bg-background/50 border-border/50 text-sm font-normal"
          >
            {selected.length === 0
              ? "Select tactics..."
              : `${selected.length} selected`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tactics..." />
            <CommandList>
              <CommandEmpty>No tactic found.</CommandEmpty>
              <CommandGroup>
                {MITRE_TACTICS.map((tactic) => (
                  <CommandItem
                    key={tactic}
                    value={tactic}
                    onSelect={() => toggleTactic(tactic)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox 
                      checked={selected.includes(tactic)} 
                      className="pointer-events-none"
                    />
                    <span>{tactic}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TimeRangeFilter({ onFilterChange, className }: FilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Horizon</Label>
      <Select onValueChange={(val) => onFilterChange?.(val)} defaultValue="30d">
        <SelectTrigger className="h-9 bg-background/50 border-border/50 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">Last 24 Hours</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last Quarter</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Main Filter Bar for global search and filtering
 */
export function FilterBar({ onFilterChange, className }: FilterProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6 bg-card border border-border/50 rounded-xl", className)}>
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search Intelligence</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Asset name, IP, CVE..." 
            className="pl-10 h-9 bg-background/50 border-border/50 focus-visible:ring-primary"
            onChange={(e) => onFilterChange?.({ search: e.target.value })}
          />
        </div>
      </div>
      
      <AssetCategoryFilter className="lg:col-span-1" onFilterChange={(val) => onFilterChange?.({ categories: val })} />
      <RiskLevelFilter onFilterChange={(val) => onFilterChange?.({ riskLevels: val })} />
      <MitreTacticFilter onFilterChange={(val) => onFilterChange?.({ tactics: val })} />
      <TimeRangeFilter onFilterChange={(val) => onFilterChange?.({ timeRange: val })} />
    </div>
  );
}
