// Live Dashboard Page - Real-time IoT device monitoring
// Shows live telemetry updates from SignalR

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeviceTelemetry } from "@/hooks/useDeviceTelemetry";
import signalRService from "@/services/signalRService";
import { 
  Activity, 
  WifiOff, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Cpu,
  Package,
  Truck,
  Settings,
  RefreshCw
} from "lucide-react";
import { formatAssetType, formatTelemetryValue } from "@/utils/telemetryParsing";

// Asset type icon mapping
const assetTypeIcons: Record<string, React.ReactNode> = {
  'raw_material_storage': <Database className="h-5 w-5" />,
  'cnc_machine': <Cpu className="h-5 w-5" />,
  'logistics_transportation': <Truck className="h-5 w-5" />,
  'assembly_plant': <Settings className="h-5 w-5" />,
  'conveyor': <Package className="h-5 w-5" />,
  'consumer_device': <CheckCircle className="h-5 w-5" />
};

// Status icon mapping
const statusIcons = {
  running: <Activity className="h-4 w-4 text-green-500" />,
  stale: <Clock className="h-4 w-4 text-yellow-500" />,
  offline: <WifiOff className="h-4 w-4 text-red-500" />
};

export default function LiveDashboard() {
  const navigate = useNavigate();
  const { devicesById, devicesSorted, deviceCounts, addTelemetry } = useDeviceTelemetry();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Initialize SignalR connection
  useEffect(() => {
    const connectSignalR = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Register telemetry callback
        signalRService.onTelemetry((message) => {
          addTelemetry(message);
          setLastUpdate(new Date());
        });

        // Start connection
        await signalRService.startConnection();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('SignalR connection error:', error);
        setConnectionStatus('error');
      }
    };

    connectSignalR();

    // Cleanup on unmount
    return () => {
      signalRService.stopConnection();
    };
  }, [addTelemetry]);

  // Connection status badge
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500">Live</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500">Connecting...</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Live IoT Dashboard</h1>
            <p className="text-muted-foreground">Real-time device telemetry monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {getConnectionBadge()}
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Devices</p>
                <p className="text-2xl font-bold">{deviceCounts.total}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Running</p>
                <p className="text-2xl font-bold text-green-600">{deviceCounts.running}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Stale</p>
                <p className="text-2xl font-bold text-yellow-600">{deviceCounts.stale}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Offline</p>
                <p className="text-2xl font-bold text-red-600">{deviceCounts.offline}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Device Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Live Device Feed</CardTitle>
          <CardDescription>
            Real-time telemetry updates from all IoT devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devicesSorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Devices Detected</h3>
              <p>Waiting for telemetry data from your sensor manager...</p>
              <p className="text-sm mt-2">
                Make sure your sensor manager is running and sending data to IoT Hub.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devicesSorted.map((device) => (
                  <Card 
                    key={device.device_id}
                    className={`border-l-4 ${
                      device.status === 'running' ? 'border-l-green-500' :
                      device.status === 'stale' ? 'border-l-yellow-500' : 'border-l-red-500'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {assetTypeIcons[device.asset_type] || <Database className="h-4 w-4" />}
                          <Badge variant="outline" className="text-xs">
                            {formatAssetType(device.asset_type)}
                          </Badge>
                        </div>
                        {statusIcons[device.status]}
                      </div>
                      <CardTitle className="text-sm">{device.device_id}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize">{device.status}</span>
                      </div>
                      
                      {/* Last Seen */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last Seen</span>
                        <span>{formatLastSeen(device.lastSeenTs)}</span>
                      </div>

                      {/* Telemetry Metrics */}
                      {Object.keys(device.telemetry).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Telemetry</p>
                          <div className="space-y-1">
                            {Object.entries(device.telemetry).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono">
                                  {formatTelemetryValue(value)}
                                </span>
                              </div>
                            ))}
                            {Object.keys(device.telemetry).length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{Object.keys(device.telemetry).length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Alert Indicator */}
                      {device.asset_type && device.telemetry && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            <span className="text-yellow-600">Active monitoring</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}