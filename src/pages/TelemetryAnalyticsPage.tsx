// TelemetryAnalyticsPage - Comprehensive graph dashboard for all IoT sensors
// Shows 15 metrics across 9 devices in categorized views

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Activity, Database, Thermometer, Droplets, 
  Factory, Package, Truck, Battery, Target,
  RefreshCw, Home
} from 'lucide-react';

// Interface for telemetry data
interface TelemetryPoint {
  id: string;
  deviceId: string;
  metric: string;
  value: number;
  timestamp: string;
  source: string;
}

// Device categories based on sensor analysis
const DEVICE_CATEGORIES = {
  environmental: {
    name: 'Environmental Monitoring',
    devices: ['RawMaterial_Storage_01', 'Logistics_Vehicle_01'],
    metrics: ['Ambient_Temperature', 'Humidity_Level', 'Temperature', 'Shock_Level', 'Fuel_Level'],
    icon: <Thermometer className="h-5 w-5" />,
    color: '#10b981'
  },
  manufacturing: {
    name: 'Manufacturing',
    devices: ['CNC_Machine_01', 'AssemblyPlant_01', 'Conveyor_01', 'PackagingUnit_01'],
    metrics: ['SpindleSpeed', 'AssemblyRate', 'BeltSpeed', 'PackagingSpeed', 'PackageCount'],
    icon: <Factory className="h-5 w-5" />,
    color: '#3b82f6'
  },
  quality: {
    name: 'Quality & Service',
    devices: ['QualityCheck_01', 'AfterSales_01'],
    metrics: ['DefectCount', 'QualityScore', 'Active_Repairs'],
    icon: <Target className="h-5 w-5" />,
    color: '#f59e0b'
  },
  logistics: {
    name: 'Logistics',
    devices: ['Logistics_Vehicle_01'],
    metrics: ['Location', 'Temperature', 'Humidity', 'Shock_Level', 'Fuel_Level'],
    icon: <Truck className="h-5 w-5" />,
    color: '#8b5cf6'
  },
  retail: {
    name: 'Retail & End-User',
    devices: ['RetailDistribution_01', 'ConsumerDevice_01'],
    metrics: ['Stock_Level', 'Battery_Drain_Rate', 'Device_Temperature'],
    icon: <Package className="h-5 w-5" />,
    color: '#ef4444'
  }
};

const TelemetryAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch telemetry data
  const fetchTelemetryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API or use mock data
      const response = await fetch('/data/telemetry_export_20251226_172106.json');
      if (!response.ok) {
        throw new Error('Failed to fetch telemetry data');
      }
      const data = await response.json();
      setTelemetryData(data);
    } catch (err) {
      setError('Failed to fetch telemetry data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processChartData = (devices: string[], metrics: string[]) => {
    const filteredData = telemetryData.filter(
      point => devices.includes(point.deviceId) && metrics.includes(point.metric)
    );

    // Group by timestamp and create chart data
    const chartData: any[] = [];
    const timeGroups: { [key: string]: any } = {};

    filteredData.forEach(point => {
      const timestamp = new Date(point.timestamp).toLocaleTimeString();
      if (!timeGroups[timestamp]) {
        timeGroups[timestamp] = { timestamp };
      }
      const key = `${point.deviceId}_${point.metric}`;
      timeGroups[timestamp][key] = point.value;
    });

    return Object.values(timeGroups).slice(-50); // Last 50 data points
  };

  // Get device statistics
  const getDeviceStats = (deviceId: string) => {
    const deviceData = telemetryData.filter(point => point.deviceId === deviceId);
    const latestData = deviceData.reduce((acc: any, point) => {
      acc[point.metric] = point.value;
      return acc;
    }, {});

    return {
      deviceId,
      metrics: Object.keys(latestData).length,
      lastUpdate: deviceData.length > 0 ? 
        new Date(Math.max(...deviceData.map(d => new Date(d.timestamp).getTime()))).toLocaleString() : 
        'No data',
      latestData
    };
  };

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockData: TelemetryPoint[] = [];
    const now = Date.now();

    // Environmental sensors
    for (let i = 0; i < 20; i++) {
      const timestamp = now - i * 60000;
      
      // Raw Material Storage
      mockData.push({
        id: `RawMaterial_Storage_01_Ambient_Temperature_${i}`,
        deviceId: 'RawMaterial_Storage_01',
        metric: 'Ambient_Temperature',
        value: 22 + Math.random() * 3 - 1.5, // 20.5-24.5°C
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `RawMaterial_Storage_01_Humidity_Level_${i}`,
        deviceId: 'RawMaterial_Storage_01',
        metric: 'Humidity_Level',
        value: 45 + Math.random() * 10 - 5, // 40-50%
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // Logistics Vehicle
      mockData.push({
        id: `Logistics_Vehicle_01_Temperature_${i}`,
        deviceId: 'Logistics_Vehicle_01',
        metric: 'Temperature',
        value: 19 + Math.random() * 4 - 2, // 17-21°C
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `Logistics_Vehicle_01_Humidity_${i}`,
        deviceId: 'Logistics_Vehicle_01',
        metric: 'Humidity',
        value: 35 + Math.random() * 8 - 4, // 31-39%
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `Logistics_Vehicle_01_Shock_Level_${i}`,
        deviceId: 'Logistics_Vehicle_01',
        metric: 'Shock_Level',
        value: Math.random() * 0.5, // 0-0.5g
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `Logistics_Vehicle_01_Fuel_Level_${i}`,
        deviceId: 'Logistics_Vehicle_01',
        metric: 'Fuel_Level',
        value: 85 - i * 0.5 + Math.random() * 5, // Decreasing fuel
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
    }

    // Manufacturing sensors
    for (let i = 0; i < 20; i++) {
      const timestamp = now - i * 30000; // Every 30 seconds
      
      // Assembly Plant
      mockData.push({
        id: `AssemblyPlant_01_AssemblyRate_${i}`,
        deviceId: 'AssemblyPlant_01',
        metric: 'AssemblyRate',
        value: 85 + Math.random() * 10 - 5, // 80-90 units/min
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // CNC Machine
      mockData.push({
        id: `CNC_Machine_01_SpindleSpeed_${i}`,
        deviceId: 'CNC_Machine_01',
        metric: 'SpindleSpeed',
        value: 1500 + Math.random() * 300 - 150, // 1350-1650 RPM
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // Conveyor
      mockData.push({
        id: `Conveyor_01_BeltSpeed_${i}`,
        deviceId: 'Conveyor_01',
        metric: 'BeltSpeed',
        value: Math.random() > 0.3 ? 2.3 + Math.random() * 0.4 - 0.2 : 0, // Running or stopped
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // Packaging Unit
      mockData.push({
        id: `PackagingUnit_01_PackagingSpeed_${i}`,
        deviceId: 'PackagingUnit_01',
        metric: 'PackagingSpeed',
        value: Math.random() > 0.3 ? 115 + Math.random() * 15 - 7.5 : 0, // Running or stopped
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `PackagingUnit_01_PackageCount_${i}`,
        deviceId: 'PackagingUnit_01',
        metric: 'PackageCount',
        value: 1000 + i * 5 + Math.random() * 10, // Increasing count
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
    }

    // Quality sensors
    for (let i = 0; i < 20; i++) {
      const timestamp = now - i * 30000;
      
      // Quality Check
      mockData.push({
        id: `QualityCheck_01_QualityScore_${i}`,
        deviceId: 'QualityCheck_01',
        metric: 'QualityScore',
        value: 96 + Math.random() * 3, // 96-99%
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `QualityCheck_01_DefectCount_${i}`,
        deviceId: 'QualityCheck_01',
        metric: 'DefectCount',
        value: Math.floor(i * 0.6 + Math.random() * 2), // Increasing defects
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // After Sales
      mockData.push({
        id: `AfterSales_01_Active_Repairs_${i}`,
        deviceId: 'AfterSales_01',
        metric: 'Active_Repairs',
        value: 5 + Math.random() * 4 - 2, // 3-7 repairs
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
    }

    // Retail sensors
    for (let i = 0; i < 20; i++) {
      const timestamp = now - i * 60000;
      
      // Retail Distribution
      mockData.push({
        id: `RetailDistribution_01_Stock_Level_${i}`,
        deviceId: 'RetailDistribution_01',
        metric: 'Stock_Level',
        value: Math.max(10, 85 - i * 2 + Math.random() * 5), // Decreasing stock
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });

      // Consumer Device
      mockData.push({
        id: `ConsumerDevice_01_Battery_Drain_Rate_${i}`,
        deviceId: 'ConsumerDevice_01',
        metric: 'Battery_Drain_Rate',
        value: 2.5 + Math.random() * 1, // 2.5-3.5 %/hr
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
      
      mockData.push({
        id: `ConsumerDevice_01_Device_Temperature_${i}`,
        deviceId: 'ConsumerDevice_01',
        metric: 'Device_Temperature',
        value: 38 + Math.random() * 7, // 38-45°C
        timestamp: new Date(timestamp).toISOString(),
        source: 'sensor'
      });
    }

    setTelemetryData(mockData);
    console.log(`Generated ${mockData.length} mock data points`);
  };

  useEffect(() => {
    // Try to fetch real data first, if it fails, generate mock data
    fetchTelemetryData().catch(() => {
      console.log('Real data not available, generating mock data');
      generateMockData();
    });
  }, []);

  // Render gauge chart for current values
  const renderGaugeChart = (title: string, value: number, max: number, unit: string, color: string) => {
    const data = [
      { name: 'Value', value: value, fill: color }
    ];

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data}>
              <RadialBar dataKey="value" cornerRadius={10} fill={color} max={max} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center">
            <div className="text-2xl font-bold">{value.toFixed(1)}{unit}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render line chart for trends
  const renderTrendChart = (title: string, devices: string[], metrics: string[], color: string) => {
    const chartData = processChartData(devices, metrics);
    const dataKeys = chartData.length > 0 ? 
      Object.keys(chartData[0]).filter(key => key !== 'timestamp') : [];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" style={{ backgroundColor: color, color: 'white' }}>
              {dataKeys.length} metrics
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Telemetry Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive monitoring of {Object.keys(DEVICE_CATEGORIES).length} categories, 
              {Object.values(DEVICE_CATEGORIES).reduce((acc, cat) => acc + cat.devices.length, 0)} devices
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchTelemetryData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={generateMockData}>
            Generate Mock Data
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => {
          const deviceStats = category.devices.map(getDeviceStats);
          const totalMetrics = deviceStats.reduce((acc, stat) => acc + stat.metrics, 0);
          
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {category.icon}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <p className="text-2xl font-bold">{category.devices.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalMetrics} metrics total
                    </p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Environmental Monitoring */}
        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Storage Temperature', 
              ['RawMaterial_Storage_01'],
              ['Ambient_Temperature'],
              DEVICE_CATEGORIES.environmental.color
            )}
            {renderTrendChart(
              'Storage Humidity',
              ['RawMaterial_Storage_01'],
              ['Humidity_Level'],
              DEVICE_CATEGORIES.environmental.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Vehicle Temperature',
              ['Logistics_Vehicle_01'],
              ['Temperature'],
              DEVICE_CATEGORIES.environmental.color
            )}
            {renderTrendChart(
              'Vehicle Environment',
              ['Logistics_Vehicle_01'],
              ['Shock_Level'],
              DEVICE_CATEGORIES.environmental.color
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderGaugeChart('Storage Temp', 22.5, 50, '°C', '#ef4444')}
            {renderGaugeChart('Storage Humidity', 45, 100, '%', '#3b82f6')}
            {renderGaugeChart('Vehicle Temp', 19.5, 30, '°C', '#f59e0b')}
            {renderGaugeChart('Fuel Level', 85, 100, '%', '#10b981')}
          </div>
        </TabsContent>

        {/* Manufacturing */}
        <TabsContent value="manufacturing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Assembly Production Rate',
              ['AssemblyPlant_01'],
              ['AssemblyRate'],
              DEVICE_CATEGORIES.manufacturing.color
            )}
            {renderTrendChart(
              'Packaging Speed',
              ['PackagingUnit_01'],
              ['PackagingSpeed'],
              DEVICE_CATEGORIES.manufacturing.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'CNC Spindle Speed',
              ['CNC_Machine_01'],
              ['SpindleSpeed'],
              DEVICE_CATEGORIES.manufacturing.color
            )}
            {renderTrendChart(
              'Conveyor Belt Speed',
              ['Conveyor_01'],
              ['BeltSpeed'],
              DEVICE_CATEGORIES.manufacturing.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Package Count Tracking',
              ['PackagingUnit_01'],
              ['PackageCount'],
              DEVICE_CATEGORIES.manufacturing.color
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {renderGaugeChart('Assembly Rate', 85, 100, 'units/min', '#3b82f6')}
            {renderGaugeChart('Packaging Speed', 115, 130, 'units/min', '#10b981')}
            {renderGaugeChart('Spindle Speed', 1500, 2000, 'RPM', '#f59e0b')}
            {renderGaugeChart('Belt Speed', 2.3, 3.0, 'm/s', '#8b5cf6')}
            {renderGaugeChart('Package Count', 1250, 2000, 'units', '#ef4444')}
          </div>
        </TabsContent>

        {/* Quality & Service */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Quality Score',
              ['QualityCheck_01'],
              ['QualityScore'],
              DEVICE_CATEGORIES.quality.color
            )}
            {renderTrendChart(
              'Defect Count',
              ['QualityCheck_01'],
              ['DefectCount'],
              DEVICE_CATEGORIES.quality.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Active Repairs',
              ['AfterSales_01'],
              ['Active_Repairs'],
              DEVICE_CATEGORIES.quality.color
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderGaugeChart('Quality Score', 96.5, 100, '%', '#10b981')}
            {renderGaugeChart('Defect Count', 12, 50, 'units', '#ef4444')}
            {renderGaugeChart('Active Repairs', 5, 20, 'jobs', '#f59e0b')}
          </div>
        </TabsContent>

        {/* Logistics */}
        <TabsContent value="logistics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Temperature Monitoring',
              DEVICE_CATEGORIES.logistics.devices,
              ['Temperature'],
              DEVICE_CATEGORIES.logistics.color
            )}
            {renderTrendChart(
              'Humidity Levels',
              DEVICE_CATEGORIES.logistics.devices,
              ['Humidity'],
              DEVICE_CATEGORIES.logistics.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Shock/Vibration Levels',
              DEVICE_CATEGORIES.logistics.devices,
              ['Shock_Level'],
              DEVICE_CATEGORIES.logistics.color
            )}
            {renderTrendChart(
              'Fuel Consumption',
              DEVICE_CATEGORIES.logistics.devices,
              ['Fuel_Level'],
              DEVICE_CATEGORIES.logistics.color
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderGaugeChart('Vehicle Temperature', 19.5, 30, '°C', '#3b82f6')}
            {renderGaugeChart('Humidity', 35, 100, '%', '#10b981')}
            {renderGaugeChart('Shock Level', 0.2, 1.0, 'g', '#f59e0b')}
            {renderGaugeChart('Fuel Level', 85, 100, '%', '#10b981')}
          </div>
        </TabsContent>

        {/* Retail & End-User */}
        <TabsContent value="retail" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Retail Stock Levels',
              ['RetailDistribution_01'],
              ['Stock_Level'],
              DEVICE_CATEGORIES.retail.color
            )}
            {renderTrendChart(
              'Consumer Battery Drain',
              ['ConsumerDevice_01'],
              ['Battery_Drain_Rate'],
              DEVICE_CATEGORIES.retail.color
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTrendChart(
              'Consumer Device Temperature',
              ['ConsumerDevice_01'],
              ['Device_Temperature'],
              DEVICE_CATEGORIES.retail.color
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderGaugeChart('Stock Level', 85, 100, '%', '#10b981')}
            {renderGaugeChart('Battery Drain', 2.5, 5.0, '%/hr', '#ef4444')}
            {renderGaugeChart('Device Temp', 38, 50, '°C', '#f59e0b')}
          </div>
        </TabsContent>
      </Tabs>

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <Activity className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchTelemetryData}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TelemetryAnalyticsPage;
