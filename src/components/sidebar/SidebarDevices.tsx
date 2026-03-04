// SidebarDevices - Lists IoT devices with status indicators
// Shows device list with alerts and selection highlighting

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry';
import { formatAssetType } from '@/utils/telemetryParsing';
import { 
  Activity, 
  AlertTriangle, 
  WifiOff, 
  Clock,
  Cpu,
  Database,
  Package,
  CheckCircle
} from 'lucide-react';

// Status icon mapping
const statusIcons = {
  running: <Activity className="h-3 w-3 text-green-500" />,
  stale: <Clock className="h-3 w-3 text-yellow-500" />,
  offline: <WifiOff className="h-3 w-3 text-red-500" />
};

// Asset type icon mapping
const assetTypeIcons: Record<string, React.ReactNode> = {
  'raw_material_storage': <Database className="h-4 w-4" />,
  'manufacturing_line': <Cpu className="h-4 w-4" />,
  'finished_goods_storage': <Package className="h-4 w-4" />,
  'quality_control': <CheckCircle className="h-4 w-4" />
};

// Status color mapping
const statusColors = {
  running: 'border-green-500/30 bg-green-500/5',
  stale: 'border-yellow-500/30 bg-yellow-500/5',
  offline: 'border-red-500/30 bg-red-500/5'
};

export default function SidebarDevices() {
  const {
    devicesSorted,
    selectedDeviceId,
    deviceCounts,
    selectDevice,
    selectedDeviceAlertSeverity
  } = useDeviceTelemetry();

  const handleDeviceClick = (deviceId: string) => {
    selectDevice(deviceId === selectedDeviceId ? null : deviceId);
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">IoT Devices</h2>
          <Badge variant="secondary" className="text-xs">
            {deviceCounts.total}
          </Badge>
        </div>
        
        {/* Status Summary */}
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{deviceCounts.running}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">{deviceCounts.stale}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">{deviceCounts.offline}</span>
          </div>
        </div>
      </div>

      {/* Device List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {devicesSorted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No devices detected</p>
              <p className="text-xs mt-1">Waiting for telemetry data...</p>
            </div>
          ) : (
            devicesSorted.map((device) => {
              const isSelected = device.device_id === selectedDeviceId;
              const hasAlerts = device.asset_type && device.telemetry;
              
              return (
                <Card
                  key={device.device_id}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                    statusColors[device.status],
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-sidebar"
                  )}
                  onClick={() => handleDeviceClick(device.device_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Asset Type Icon */}
                      <div className="shrink-0">
                        {assetTypeIcons[device.asset_type] || <Cpu className="h-4 w-4" />}
                      </div>
                      
                      {/* Device Info */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {device.device_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatAssetType(device.asset_type)}
                        </div>
                      </div>
                    </div>

                    {/* Status and Alerts */}
                    <div className="flex items-center gap-1 shrink-0">
                      {statusIcons[device.status]}
                      {hasAlerts && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div className="text-xs text-muted-foreground">
                    {formatLastSeen(device.lastSeenTs)}
                  </div>

                  {/* Quick Metrics Preview */}
                  {Object.keys(device.telemetry).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(device.telemetry)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                          </span>
                        ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {selectedDeviceId && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Selected: {selectedDeviceId}
            {selectedDeviceAlertSeverity !== 'none' && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span className="text-yellow-500">
                  {selectedDeviceAlertSeverity === 'critical' ? 'Critical' : 'Warning'} alerts
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
