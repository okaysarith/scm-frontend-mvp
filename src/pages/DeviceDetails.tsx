// DeviceDetails page - Shows detailed view of selected IoT device
// Displays live telemetry, metadata, and alerts

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry';
import { 
  formatAssetType, 
  parseLocation, 
  formatTelemetryValue,
  checkDeviceAlerts 
} from '@/utils/telemetryParsing';
import { 
  ArrowLeft, 
  Activity, 
  WifiOff, 
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Database,
  Cpu,
  Package
} from 'lucide-react';

// Asset type icon mapping
const assetTypeIcons: Record<string, React.ReactNode> = {
  'raw_material_storage': <Database className="h-5 w-5" />,
  'manufacturing_line': <Cpu className="h-5 w-5" />,
  'finished_goods_storage': <Package className="h-5 w-5" />,
  'quality_control': <CheckCircle className="h-5 w-5" />
};

// Status icon mapping
const statusIcons = {
  running: <Activity className="h-4 w-4 text-green-500" />,
  stale: <Clock className="h-4 w-4 text-yellow-500" />,
  offline: <WifiOff className="h-4 w-4 text-red-500" />
};

// Status color mapping
const statusColors = {
  running: 'bg-green-500',
  stale: 'bg-yellow-500',
  offline: 'bg-red-500'
};

export default function DeviceDetails() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { selectedDevice, devicesById, selectDevice } = useDeviceTelemetry();

  // Ensure the device is selected when navigating to this page
  React.useEffect(() => {
    if (deviceId && devicesById[deviceId] && selectedDevice?.device_id !== deviceId) {
      selectDevice(deviceId);
    }
  }, [deviceId, devicesById, selectedDevice, selectDevice]);

  const device = deviceId ? devicesById[deviceId] : null;

  if (!device) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Device Not Found</h3>
            <p className="text-muted-foreground">
              Device "{deviceId}" not found or no telemetry data available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alerts = checkDeviceAlerts(device.asset_type, device.telemetry);
  const location = device.metadata?.Location ? parseLocation(device.metadata.Location) : null;
  const lastSeenFormatted = new Date(device.lastSeenTs).toLocaleString();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            {assetTypeIcons[device.asset_type] || <Cpu className="h-5 w-5" />}
            <div>
              <h1 className="text-2xl font-bold">{device.device_id}</h1>
              <p className="text-muted-foreground">{formatAssetType(device.asset_type)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            {statusIcons[device.status]}
            <span className="capitalize">{device.status}</span>
          </Badge>
          
          <div className={`w-3 h-3 rounded-full ${statusColors[device.status]}`} />
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="capitalize">{alert.severity} Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Info */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Basic device details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Device ID</label>
                <p className="font-mono text-sm">{device.device_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                <p>{formatAssetType(device.asset_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  {statusIcons[device.status]}
                  <span className="capitalize">{device.status}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Seen</label>
                <p className="text-sm">{lastSeenFormatted}</p>
              </div>
            </div>

            {location && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <p className="text-sm font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Additional device metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {Object.keys(device.metadata).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(device.metadata).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-sm font-mono truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No metadata available</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Live Telemetry */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Telemetry</CardTitle>
            <CardDescription>Real-time device metrics and measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(device.telemetry).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(device.telemetry).map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-lg font-bold">
                      {formatTelemetryValue(value)}
                    </p>
                    {typeof value === 'number' && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          History (last 10)
                        </div>
                        <div className="flex gap-1 mt-1">
                          {device.history[key]?.slice(-10).map((histValue, idx) => (
                            <div
                              key={idx}
                              className="w-2 h-2 bg-primary rounded-full"
                              style={{ opacity: 0.3 + (idx / 10) * 0.7 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No telemetry data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
