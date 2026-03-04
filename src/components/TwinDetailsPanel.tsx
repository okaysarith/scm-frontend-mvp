import React from "react";
import { cn } from "@/lib/utils";
import { SupplyChainTwin, getTypeLabel, getStatusColor } from "@/services/mapService";

interface TwinDetailsPanelProps {
  twin: SupplyChainTwin | null;
}

export default function TwinDetailsPanel({ twin }: TwinDetailsPanelProps) {
  if (!twin) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <div className="text-4xl mb-4 opacity-30">🎯</div>
        <p className="text-sm text-center">
          Select a node on the map to view details
        </p>
      </div>
    );
  }

  const statusColors = {
    healthy: "bg-status-healthy",
    warning: "bg-status-warning",
    critical: "bg-status-critical",
    offline: "bg-status-offline",
  };

  const statusLabels = {
    healthy: "Operational",
    warning: "Warning",
    critical: "Critical",
    offline: "Offline",
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{twin.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {twin.name}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              {twin.id}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full animate-pulse",
            statusColors[twin.status]
          )} />
          <span className="text-sm font-medium text-foreground">
            {statusLabels[twin.status]}
          </span>
        </div>
      </div>

      {/* Location Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Location
        </h3>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <DetailRow label="City" value={twin.city} />
          <DetailRow label="Type" value={getTypeLabel(twin.type)} />
          <DetailRow label="Product Scope" value={twin.product} />
          <DetailRow 
            label="Coordinates" 
            value={`${twin.lat.toFixed(4)}, ${twin.lon.toFixed(4)}`} 
            mono 
          />
        </div>
      </section>

      {/* Telemetry Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Telemetry
        </h3>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          {twin.telemetry.temperature !== undefined && (
            <TelemetryRow 
              label="Temperature" 
              value={twin.telemetry.temperature} 
              unit="°C"
              warning={twin.telemetry.temperature > 45}
              critical={twin.telemetry.temperature > 55}
            />
          )}
          {twin.telemetry.defectRate !== undefined && (
            <TelemetryRow 
              label="Defect Rate" 
              value={(twin.telemetry.defectRate * 100).toFixed(2)} 
              unit="%"
              warning={twin.telemetry.defectRate > 0.02}
              critical={twin.telemetry.defectRate > 0.05}
            />
          )}
          {twin.telemetry.assemblyRate !== undefined && (
            <TelemetryRow 
              label="Assembly Rate" 
              value={twin.telemetry.assemblyRate} 
              unit="UPH"
            />
          )}
          {twin.telemetry.inventoryLevel !== undefined && (
            <TelemetryRow 
              label="Inventory Level" 
              value={twin.telemetry.inventoryLevel} 
              unit="%"
              warning={twin.telemetry.inventoryLevel < 30}
              critical={twin.telemetry.inventoryLevel < 15}
            />
          )}
          {twin.telemetry.stockLevel !== undefined && (
            <TelemetryRow 
              label="Stock Level" 
              value={twin.telemetry.stockLevel} 
              unit="units"
              warning={twin.telemetry.stockLevel < 200}
              critical={twin.telemetry.stockLevel < 100}
            />
          )}
          {twin.telemetry.salesRate !== undefined && (
            <TelemetryRow 
              label="Sales Rate" 
              value={twin.telemetry.salesRate} 
              unit="/day"
            />
          )}
          {twin.telemetry.activeRepairs !== undefined && twin.telemetry.repairCapacity !== undefined && (
            <TelemetryRow 
              label="Active Repairs" 
              value={`${twin.telemetry.activeRepairs}/${twin.telemetry.repairCapacity}`} 
              unit=""
              warning={twin.telemetry.activeRepairs / twin.telemetry.repairCapacity > 0.7}
              critical={twin.telemetry.activeRepairs / twin.telemetry.repairCapacity > 0.9}
            />
          )}
        </div>
      </section>

      {/* Layer State */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layer State
        </h3>
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <DetailRow label="Current Layer" value="3 – Visualization" />
          <DetailRow label="Data Binding" value="Active" />
          <DetailRow label="DTDL Model" value={twin.model.split(';')[0].split(':').pop() || 'Unknown'} mono />
        </div>
      </section>

      {/* Relationships */}
      {twin.relationships.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Connections ({twin.relationships.length})
          </h3>
          <div className="space-y-1.5">
            {twin.relationships.map((rel, idx) => (
              <div 
                key={idx}
                className="bg-secondary/50 rounded-lg p-2.5 flex items-center gap-2 text-sm"
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  rel.type === 'supplies' && "bg-route-supply",
                  rel.type === 'receives' && "bg-route-assembly",
                  rel.type === 'returns' && "bg-route-returns"
                )} />
                <span className="text-muted-foreground capitalize text-xs">
                  {rel.type}
                </span>
                <span className="text-foreground font-mono text-xs truncate flex-1">
                  {rel.target}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons (Disabled for Layer 3) */}
      <div className="space-y-2 pt-2">
        <button 
          disabled
          className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed opacity-50"
        >
          Supply Impact Analysis
        </button>
        <button 
          disabled
          className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed opacity-50"
        >
          Adjust Production
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Available in Layer 4+
        </p>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "text-foreground font-medium",
        mono && "font-mono text-xs"
      )}>
        {value}
      </span>
    </div>
  );
}

interface TelemetryRowProps {
  label: string;
  value: string | number;
  unit: string;
  warning?: boolean;
  critical?: boolean;
}

function TelemetryRow({ label, value, unit, warning, critical }: TelemetryRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-mono font-medium",
        critical ? "text-status-critical" :
        warning ? "text-status-warning" :
        "text-foreground"
      )}>
        {value}
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </span>
    </div>
  );
}
