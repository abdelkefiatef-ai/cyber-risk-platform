import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Server, 
  Zap, 
  BarChart3, 
  Network, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  Settings,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: "Dashboard", path: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard },
  { name: "Risk Scenarios", path: ROUTE_PATHS.RISK_SCENARIOS, icon: ShieldAlert },
  { name: "Asset Inventory", path: ROUTE_PATHS.ASSETS, icon: Server },
  { name: "Vulnerabilities", path: ROUTE_PATHS.VULNERABILITIES, icon: Zap },
  { name: "Correlation Analysis", path: ROUTE_PATHS.CORRELATION, icon: Network },
  { name: "Executive Reports", path: ROUTE_PATHS.REPORTS, icon: BarChart3 },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = ({ className, onItemClick }: { className?: string, onItemClick?: () => void }) => (
    <nav className={cn("space-y-1", className)}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )
          }
        >
          <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-sm">{item.name}</span>
          {location.pathname === item.path && (
            <motion.div
              layoutId="active-nav"
              className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar shrink-0 relative overflow-hidden">
        {/* Rim lighting effect for Dark Mode boundaries */}
        <div className="absolute inset-0 pointer-events-none border-r border-white/5 dark:block hidden" />
        
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none">CyberRisk</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Intelligence 2026</span>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div className="mb-4 px-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
            <NavLinks />
          </div>
        </div>

        <div className="p-4 border-t border-border mt-auto bg-sidebar-accent/30">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Admin Operator</span>
              <span className="text-xs text-muted-foreground truncate font-mono">L3 Security Analyst</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                <div className="p-6 flex items-center gap-3 border-b border-border">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg">CyberRisk</span>
                </div>
                <div className="p-4">
                  <NavLinks onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 flex items-center max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                type="search" 
                placeholder="Search assets, CVEs, or risks..."
                className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="secondary" className="hidden md:flex font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
              v2.4.0-STABLE
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
             <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="p-8 text-center text-xs text-muted-foreground border-t border-border/50">
            <p>© 2026 CyberRisk Platform. All rights reserved. Precision Analytics for High-Stakes Environments.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
