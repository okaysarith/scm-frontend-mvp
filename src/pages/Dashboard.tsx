import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import KPICard from "@/components/KPICard";
import TwinDetailsPanel from "@/components/TwinDetailsPanel";
import SupplyChainMap from "@/components/Map/SupplyChainMap";
import SidebarDevices from "@/components/sidebar/SidebarDevices";
import NavigationSidebar from "@/components/NavigationSidebar";
import { useDeviceTelemetry } from "@/hooks/useDeviceTelemetry";
import { 
  getAllMapTwins, 
  getTwinById, 
  getTwinsByProduct,
  SupplyChainTwin 
} from "@/services/mapService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Upload, MapPin, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("ALL");
  const { selectedDevice } = useDeviceTelemetry();

  // Get filtered twins based on selected model
  const filteredTwins = useMemo(() => {
    return getTwinsByProduct(selectedModel);
  }, [selectedModel]);

  // Get selected twin details
  const selectedTwin = selectedTwinId ? getTwinById(selectedTwinId) : null;

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const allTwins = getAllMapTwins();
    return {
      healthy: allTwins.filter(t => t.status === 'healthy').length,
      warning: allTwins.filter(t => t.status === 'warning').length,
      critical: allTwins.filter(t => t.status === 'critical').length,
    };
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const twins = filteredTwins;
    
    // Device Yield Rate (inverse of avg defect rate)
    const manufacturingTwins = twins.filter(t => t.type === 'manufacturing' || t.type === 'assembly');
    const avgDefectRate = manufacturingTwins.reduce((sum, t) => 
      sum + (t.telemetry.defectRate || 0), 0) / (manufacturingTwins.length || 1);
    const yieldRate = ((1 - avgDefectRate) * 100).toFixed(1);

    // Component Defect Rate
    const defectRate = (avgDefectRate * 100).toFixed(2);

    // Average Cycle Time (based on assembly rate)
    const assemblyTwins = twins.filter(t => t.type === 'assembly');
    const avgAssemblyRate = assemblyTwins.reduce((sum, t) => 
      sum + (t.telemetry.assemblyRate || 0), 0) / (assemblyTwins.length || 1);
    const cycleTime = avgAssemblyRate > 0 ? (60 / avgAssemblyRate * 100).toFixed(0) : '0';

    // Supply Readiness (based on inventory levels)
    const storageTwins = twins.filter(t => t.type === 'storage');
    const avgInventory = storageTwins.reduce((sum, t) => 
      sum + (t.telemetry.inventoryLevel || 0), 0) / (storageTwins.length || 1);
    const supplyReadiness = avgInventory.toFixed(0);

    return {
      yieldRate,
      defectRate,
      cycleTime,
      supplyReadiness,
    };
  }, [filteredTwins]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <TopBar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        statusCounts={statusCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column: Navigation Sidebar */}
        <NavigationSidebar />
        
        {/* Second Column: IoT Devices Sidebar */}
        <SidebarDevices />
        
        {/* Third Column: KPI Sidebar */}
        <aside className="w-56 shrink-0 bg-sidebar border-r border-border p-4 space-y-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            <h2 className="text-sm font-semibold text-foreground">
              Supply Chain KPIs
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time metrics
            </p>
          </div>

          <KPICard
            label="Device Yield"
            value={kpis.yieldRate}
            unit="%"
            status={parseFloat(kpis.yieldRate) >= 98 ? 'healthy' : parseFloat(kpis.yieldRate) >= 95 ? 'warning' : 'critical'}
            trend="stable"
            icon="📊"
          />

          <KPICard
            label="Defect Rate"
            value={kpis.defectRate}
            unit="%"
            status={parseFloat(kpis.defectRate) <= 2 ? 'healthy' : parseFloat(kpis.defectRate) <= 5 ? 'warning' : 'critical'}
            trend="down"
            icon="⚠️"
          />

          <KPICard
            label="Cycle Time"
            value={kpis.cycleTime}
            unit="min"
            status="healthy"
            trend="stable"
            icon="⏱️"
          />

          <KPICard
            label="Supply Ready"
            value={kpis.supplyReadiness}
            unit="%"
            status={parseFloat(kpis.supplyReadiness) >= 80 ? 'healthy' : parseFloat(kpis.supplyReadiness) >= 50 ? 'warning' : 'critical'}
            trend="up"
            icon="📦"
          />

          {/* Layer Indicator */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Current Layer
              </div>
              <div className="text-lg font-bold text-primary font-mono">
                Layer 3
              </div>
              <div className="text-xs text-muted-foreground">
                Visualization
              </div>
            </div>
          </div>

          {/* Quick Access - Network Analysis */}
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/network')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Network className="h-4 w-4 mr-2" />
              Go to Network Analysis
            </Button>
          </div>
        </aside>

        {/* Center Column: Map */}
        <main className="flex-1 min-w-0 p-4">
          <SupplyChainMap
            selectedTwinId={selectedTwinId}
            onSelectTwin={setSelectedTwinId}
          />
        </main>

        {/* Right Column: Twin Details Panel */}
        <aside className="w-72 shrink-0 bg-card border-l border-border overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Twin Details
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedTwin ? selectedTwin.id : 'No selection'}
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <TwinDetailsPanel twin={selectedTwin || null} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
