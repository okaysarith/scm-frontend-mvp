import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { telemetryService } from '@/services/apiService';
import { Activity, Database, AlertCircle, RefreshCw } from 'lucide-react';

interface TelemetryData {
  timestamp: string;
  value: number;
  sensor_id: string;
  location?: string;
}

interface TelemetryMetrics {
  total_sensors: number;
  active_sensors: number;
  data_points: number;
  last_update: string;
}

const TelemetryDashboard: React.FC = () => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [status, setStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await telemetryService.getTelemetryData();
      setTelemetryData(data || []);
    } catch (err) {
      setError('Failed to fetch telemetry data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metricsData = await telemetryService.getTelemetryMetrics();
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const statusData = await telemetryService.getTelemetryStatus();
      setStatus(statusData.status || 'unknown');
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    fetchMetrics();
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    fetchTelemetryData();
    fetchMetrics();
    fetchStatus();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
        return 'bg-green-500';
      case 'inactive':
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Telemetry Dashboard</h1>
          <p className="text-muted-foreground">Real-time sensor data and metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              <span className="text-2xl font capitalize">{status}</span>
            </div>
          </CardContent>
        </Card>

        {metrics && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.active_sensors}</div>
                <p className="text-xs text-muted-foreground">
                  of {metrics.total_sensors} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.data_points?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {metrics?.last_update ? new Date(metrics.last_update).toLocaleString() : 'Never'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Telemetry Data */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Live Data</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Telemetry Data</CardTitle>
              <CardDescription>
                Latest sensor readings from the supply chain network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : telemetryData.length > 0 ? (
                <div className="space-y-4">
                  {telemetryData.slice(0, 10).map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{data.sensor_id}</Badge>
                        <div>
                          <p className="font-medium">Value: {data.value}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(data.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {data.location && (
                        <Badge variant="secondary">{data.location}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No telemetry data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>
                Performance and utilization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {((metrics.active_sensors / metrics.total_sensors) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Sensor Uptime</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.data_points.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Data Points</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Metrics not available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelemetryDashboard;
