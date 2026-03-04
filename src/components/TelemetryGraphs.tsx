// TelemetryGraphs - Visualizes telemetry data from REST API
// Creates charts for device metrics over time

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { telemetryService } from '@/services/apiService';
import { RefreshCw, TrendingUp, Activity, Database } from 'lucide-react';

interface TelemetryPoint {
  id: string;
  deviceId: string;
  metric: string;
  value: number;
  timestamp: string;
  source: string;
}

interface GraphData {
  timestamp: string;
  [key: string]: any;
}

const TelemetryGraphs: React.FC = () => {
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch telemetry data from REST API
  const fetchTelemetryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from your exported JSON file or API
      const response = await fetch('/data/telemetry_export_20251226_172106.json');
      const data = await response.json();
      setTelemetryData(data);
      processGraphData(data);
    } catch (err) {
      setError('Failed to fetch telemetry data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process telemetry data for graphing
  const processGraphData = (data: TelemetryPoint[]) => {
    // Filter data based on selections
    let filteredData = data;
    
    if (selectedDevice !== 'all') {
      filteredData = filteredData.filter(d => d.deviceId === selectedDevice);
    }
    
    if (selectedMetric !== 'all') {
      filteredData = filteredData.filter(d => d.metric === selectedMetric);
    }

    // Group by timestamp and aggregate metrics
    const groupedData: { [timestamp: string]: GraphData } = {};
    
    filteredData.forEach(point => {
      const timestamp = new Date(point.timestamp).toLocaleTimeString();
      if (!groupedData[timestamp]) {
        groupedData[timestamp] = { timestamp };
      }
      
      // Create metric key
      const key = `${point.deviceId}_${point.metric}`;
      groupedData[timestamp][key] = point.value;
    });

    // Convert to array and sort by timestamp
    const processedData = Object.values(groupedData)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    setGraphData(processedData);
  };

  // Get unique devices and metrics
  const devices = Array.from(new Set(telemetryData.map(d => d.deviceId)));
  const metrics = Array.from(new Set(telemetryData.map(d => d.metric)));

  // Update graph when filters change
  useEffect(() => {
    if (telemetryData.length > 0) {
      processGraphData(telemetryData);
    }
  }, [selectedDevice, selectedMetric, telemetryData]);

  // Initial data fetch
  useEffect(() => {
    fetchTelemetryData();
  }, []);

  // Get chart colors
  const getChartColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];
    return colors[index % colors.length];
  };

  // Render chart based on type
  const renderChart = () => {
    if (graphData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <Database className="h-8 w-8 mr-2" />
          No data available for selected filters
        </div>
      );
    }

    const dataKeys = Object.keys(graphData[0]).filter(key => key !== 'timestamp');

    return (
      <ResponsiveContainer width="100%" height={300}>
        <>
          {chartType === 'line' && (
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={getChartColor(index)}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          )}
          
          {chartType === 'area' && (
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={getChartColor(index)}
                  fill={getChartColor(index)}
                />
              ))}
            </AreaChart>
          )}
          
          {chartType === 'bar' && (
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={getChartColor(index)}
                />
              ))}
            </BarChart>
          )}
        </>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Telemetry Analytics</h2>
          <p className="text-muted-foreground">Visualize IoT device metrics over time</p>
        </div>
        
        <Button onClick={fetchTelemetryData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Metrics</p>
                <p className="text-2xl font-bold">{metrics.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Data Points</p>
                <p className="text-2xl font-bold">{telemetryData.length.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Graph Points</p>
                <p className="text-2xl font-bold">{graphData.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Configure data visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Device</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices.map(device => (
                    <SelectItem key={device} value={device}>{device}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  {metrics.map(metric => (
                    <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Telemetry Trends
            <Badge variant="outline">{chartType}</Badge>
          </CardTitle>
          <CardDescription>
            {selectedDevice === 'all' ? 'All devices' : selectedDevice} • 
            {selectedMetric === 'all' ? 'All metrics' : selectedMetric}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button onClick={fetchTelemetryData} className="mt-2">Retry</Button>
            </div>
          ) : (
            renderChart()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelemetryGraphs;
