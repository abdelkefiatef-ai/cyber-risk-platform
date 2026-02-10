import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";

// Page Imports
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import RiskScenarios from "@/pages/RiskScenarios";
import Vulnerabilities from "@/pages/Vulnerabilities";
import Correlation from "@/pages/Correlation";
import Reports from "@/pages/Reports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Root application component for the Cyber Risk Management Platform.
 * Configures global providers, layout, and routing structure.
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <HashRouter>
          <Layout>
            <Routes>
              <Route 
                path={ROUTE_PATHS.DASHBOARD} 
                element={<Dashboard />} 
              />
              <Route 
                path={ROUTE_PATHS.ASSETS} 
                element={<Assets />} 
              />
              <Route 
                path={ROUTE_PATHS.RISK_SCENARIOS} 
                element={<RiskScenarios />} 
              />
              <Route 
                path={ROUTE_PATHS.VULNERABILITIES} 
                element={<Vulnerabilities />} 
              />
              <Route 
                path={ROUTE_PATHS.CORRELATION} 
                element={<Correlation />} 
              />
              <Route 
                path={ROUTE_PATHS.REPORTS} 
                element={<Reports />} 
              />
              {/* Fallback to Dashboard for undefined routes */}
              <Route 
                path="*" 
                element={<Dashboard />} 
              />
            </Routes>
          </Layout>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
