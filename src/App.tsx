import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TelemetryPage from "./pages/TelemetryPage";
import WhatIfPage from "./pages/WhatIfPage";
import MLPage from "./pages/MLPage";
import NetworkAnalysisPage from "./pages/NetworkAnalysisPage";
import DeviceDetails from "./pages/DeviceDetails";
import LiveDashboard from "./pages/LiveDashboard";
import TelemetryAnalyticsPage from "./pages/TelemetryAnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route path="/analytics" element={<TelemetryAnalyticsPage />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/ml" element={<MLPage />} />
          <Route path="/network" element={<NetworkAnalysisPage />} />
          <Route path="/live" element={<LiveDashboard />} />
          <Route path="/devices/:deviceId" element={<DeviceDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
