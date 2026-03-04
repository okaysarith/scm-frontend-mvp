import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { networkService } from '@/services/networkService';
import NavigationSidebar from '@/components/NavigationSidebar';
import CSVMergeComponent from '@/components/CSVMergeComponent';
import { 
  Loader2, MapPin, BarChart3, XCircle, Database, TrendingUp, 
  AlertTriangle, CheckCircle, Activity, Upload, FileText, Heart,
  Monitor, Wifi, Download, Eye, RefreshCw
} from 'lucide-react';

interface NearestHubResponse {
  pincode: string;
  nearest_hub: string;
  hub_pincode: string;
  distance_km: number;
  region?: string;
}

interface NetworkCoverageResponse {
  total_pincodes: number;
  successful_assignments: number;
  failed_assignments: number;
  coverage_percentage: number;
}

interface NetworkStatusResponse {
  status: string;
  hubs_info: {
    total_hubs: number;
    pincode_mapping_size: number;
  };
  data_status: {
    order_data_available: boolean;
    master_data_available: boolean;
  };
  service_health: {
    database: 'healthy' | 'degraded' | 'down';
    api: 'healthy' | 'degraded' | 'down';
  };
}

interface OrderRiskResponse {
  order_no: string;
  sku: string;
  customer_pincode: string;
  delivery_period: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface BaselineResponse {
  total_orders: number;
  avg_delivery_time: number;
  service_level: number;
  total_hubs: number;
  coverage_percentage: number;
}

interface ComplianceResponse {
  total_orders: number;
  compliant_orders: number;
  non_compliant_orders: number;
  dispatch_compliance_pct: number;
  avg_distance_gap_km: number;
  cost_leakage_rupees: number;
}

interface TelemetryHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  last_update: string;
  active_devices: number;
  total_devices: number;
}

const NetworkAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Network Design States
  const [pincode, setPincode] = useState('');
  const [coveragePincodes, setCoveragePincodes] = useState('621714,423206,743221');
  const [orderNo, setOrderNo] = useState('1033626');
  const [sku, setSku] = useState('S1344713');
  const [riskPincode, setRiskPincode] = useState('621714');
  const [deliveryPeriod, setDeliveryPeriod] = useState('2');
  const [baselineLimit, setBaselineLimit] = useState('10000');
  const [costPerKm, setCostPerKm] = useState('2.5');
  
  // Data Source Toggle States
  const [dataSource, setDataSource] = useState<'preloaded' | 'custom'>('preloaded');
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [pickFile, setPickFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File validation function
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'File must be in CSV format';
    }
    
    // Check file size (30MB limit)
    const maxSize = 30 * 1024 * 1024; // 30MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 30MB';
    }
    
    return null;
  };

  // Handle file selection with validation
  const handleOrderFileChange = (file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
    }
    setOrderFile(file);
    setError(null);
  };

  const handlePickFileChange = (file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
    }
    setPickFile(file);
    setError(null);
  };
  
  // Results States
  const [nearestHub, setNearestHub] = useState<NearestHubResponse | null>(null);
  const [networkCoverage, setNetworkCoverage] = useState<NetworkCoverageResponse | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusResponse | null>(null);
  const [orderRisk, setOrderRisk] = useState<OrderRiskResponse | null>(null);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResponse | null>(null);
  const [telemetryHealth, setTelemetryHealth] = useState<TelemetryHealthResponse | null>(null);
  
  const [loading, setLoading] = useState({
    nearestHub: false,
    coverage: false,
    status: false,
    risk: false,
    baseline: false,
    compliance: false,
    telemetry: false
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNetworkStatus();
    loadTelemetryHealth();
  }, []);

  // Network Design Handlers
  const handleFindNearestHub = async () => {
    if (!pincode.trim()) {
      setError('Please enter a pincode');
      return;
    }

    setLoading(prev => ({ ...prev, nearestHub: true }));
    setError(null);
    
    try {
      const result = await networkService.findNearestHub(pincode);
      setNearestHub(result);
    } catch (err) {
      setError('Failed to find nearest hub');
    } finally {
      setLoading(prev => ({ ...prev, nearestHub: false }));
    }
  };

  const handleNetworkCoverage = async () => {
    const pincodes = coveragePincodes.split(',').map(p => p.trim()).filter(p => p);
    if (pincodes.length === 0) {
      setError('Please enter at least one pincode');
      return;
    }

    setLoading(prev => ({ ...prev, coverage: true }));
    setError(null);
    
    try {
      const result = await networkService.analyzeNetworkCoverage(pincodes);
      setNetworkCoverage(result);
    } catch (err) {
      setError('Failed to analyze network coverage');
    } finally {
      setLoading(prev => ({ ...prev, coverage: false }));
    }
  };

  const loadNetworkStatus = async () => {
    try {
      const result = await networkService.getNetworkStatus();
      setNetworkStatus(result);
    } catch (err) {
      console.error('Network status error:', err);
    }
  };

  const handleProfileOrderRisk = async () => {
    if (!orderNo || !sku || !riskPincode || !deliveryPeriod) {
      setError('Please fill all order risk fields');
      return;
    }

    setLoading(prev => ({ ...prev, risk: true }));
    setError(null);
    
    try {
      const result = await networkService.profileOrderRisk(orderNo, sku, riskPincode, parseInt(deliveryPeriod));
      setOrderRisk(result);
    } catch (err) {
      setError('Failed to profile order risk');
    } finally {
      setLoading(prev => ({ ...prev, risk: false }));
    }
  };

  const handleGenerateBaseline = async () => {
    // Validation
    if (dataSource === 'custom' && (!orderFile || !pickFile)) {
      setError('Please upload both Order Data and Pick Data CSV files');
      return;
    }
    
    const limit = baselineLimit ? parseInt(baselineLimit) : undefined;
    
    setLoading(prev => ({ ...prev, baseline: true }));
    setError(null);
    setUploadProgress(0);
    
    try {
      const result = await networkService.generateComprehensiveBaseline(
        dataSource,
        limit,
        orderFile || undefined,
        pickFile || undefined,
        (progress) => setUploadProgress(progress)
      );
      setBaseline(result);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to generate baseline');
      setUploadProgress(0);
    } finally {
      setLoading(prev => ({ ...prev, baseline: false }));
    }
  };

  const handleCalculateCompliance = async () => {
    const cost = parseFloat(costPerKm) || 2.5;
    
    setLoading(prev => ({ ...prev, compliance: true }));
    setError(null);
    
    try {
      const result = await networkService.calculateComprehensiveCompliance(cost);
      setCompliance(result);
    } catch (err) {
      setError('Failed to calculate compliance');
    } finally {
      setLoading(prev => ({ ...prev, compliance: false }));
    }
  };

  const loadTelemetryHealth = async () => {
    try {
      const result = await networkService.telemetry.getHealth();
      setTelemetryHealth(result);
    } catch (err) {
      console.error('Telemetry health error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-white bg-gradient-to-r from-green-500 to-green-600 border-green-700 shadow-green';
      case 'degraded': return 'text-gray-800 bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500 shadow-yellow';
      case 'down': return 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-700 shadow-red';
      default: return 'text-gray-700 bg-gradient-to-r from-gray-300 to-gray-400 border-gray-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-800 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <NavigationSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Network Analysis</h1>
                <p className="text-sm text-muted-foreground">Supply Chain Intelligence & Compliance Analytics</p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white border-0">
              <Database className="w-3 h-3 mr-1" />
              Enterprise Ready
            </Badge>
          </div>

          {/* Network Status Dashboard */}
          {networkStatus && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                      <Wifi className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">API Status</p>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(networkStatus.service_health.api)}`}>
                        {networkStatus.service_health.api.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Database</p>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(networkStatus.service_health.database)}`}>
                        {networkStatus.service_health.database.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Total Hubs</p>
                      <p className="text-lg font-bold text-gray-900 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {networkStatus.hubs_info.total_hubs.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Pincode Mappings</p>
                      <p className="text-lg font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        {networkStatus.hubs_info.pincode_mapping_size.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-12 mb-8">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="network-design" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <MapPin className="w-4 h-4 mr-2" />
                Network Design
              </TabsTrigger>
              <TabsTrigger value="file-operations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                File Operations
              </TabsTrigger>
              <TabsTrigger value="telemetry" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Monitor className="w-4 h-4 mr-2" />
                Telemetry
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Button 
                        onClick={() => setActiveTab('network-design')}
                        variant="outline"
                        className="h-28 flex-col"
                      >
                        <MapPin className="h-6 w-6 mb-2" />
                        <span className="text-xs">Find Hub</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('file-operations')}
                        variant="outline"
                        className="h-28 flex-col"
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        <span className="text-xs">Upload CSV</span>
                      </Button>
                      <Button 
                        onClick={handleGenerateBaseline}
                        disabled={loading.baseline}
                        variant="outline"
                        className="h-28 flex-col"
                      >
                        {loading.baseline ? <Loader2 className="h-6 w-6 mb-2 animate-spin" /> : <TrendingUp className="h-6 w-6 mb-2" />}
                        <span className="text-xs">Baseline</span>
                      </Button>
                      <Button 
                        onClick={handleCalculateCompliance}
                        disabled={loading.compliance}
                        variant="outline"
                        className="h-28 flex-col"
                      >
                        {loading.compliance ? <Loader2 className="h-6 w-6 mb-2 animate-spin" /> : <CheckCircle className="h-6 w-6 mb-2" />}
                        <span className="text-xs">Compliance</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Results */}
                {(nearestHub || networkCoverage || orderRisk || baseline || compliance) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-600" />
                        Recent Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {nearestHub && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Nearest Hub Found</h4>
                          <p className="text-sm text-blue-600">
                            Pincode {nearestHub.pincode} → Hub {nearestHub.nearest_hub} ({nearestHub.distance_km} km)
                          </p>
                        </div>
                      )}
                      
                      {networkCoverage && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Coverage Analysis Complete</h4>
                          <p className="text-sm text-green-600">
                            {networkCoverage.successful_assignments}/{networkCoverage.total_pincodes} pincodes covered ({networkCoverage.coverage_percentage}%)
                          </p>
                        </div>
                      )}
                      
                      {orderRisk && (
                        <div className={`p-3 rounded-lg ${getRiskColor(orderRisk.risk_level)}`}>
                          <h4 className={`font-semibold mb-2 ${getRiskColor(orderRisk.risk_level)}`}>Order Risk Profile</h4>
                          <p className="text-sm">
                            Order {orderRisk.order_no} - {orderRisk.risk_level.toUpperCase()} risk (score: {orderRisk.risk_score})
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Network Design Tab */}
            <TabsContent value="network-design" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Nearest Hub Finder */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      1. Nearest Hub Finder
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Find nearest hub for a given pincode
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Enter Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g., 110001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleFindNearestHub} 
                      disabled={loading.nearestHub || !pincode}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading.nearestHub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                      Find Nearest Hub
                    </Button>
                    
                    {nearestHub && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Nearest Hub Result:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Pincode:</span> {nearestHub.pincode}</p>
                          <p><span className="font-medium">Nearest Hub:</span> {nearestHub.nearest_hub}</p>
                          <p><span className="font-medium">Hub Pincode:</span> {nearestHub.hub_pincode}</p>
                          <p><span className="font-medium">Distance:</span> {nearestHub.distance_km} km</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Network Coverage */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      2. Network Coverage Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Analyze hub network coverage for multiple pincodes
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coveragePincodes">Enter Pincodes (comma-separated)</Label>
                      <Input
                        id="coveragePincodes"
                        placeholder="e.g., 621714,423206,743221"
                        value={coveragePincodes}
                        onChange={(e) => setCoveragePincodes(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleNetworkCoverage} 
                      disabled={loading.coverage || !coveragePincodes}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading.coverage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                      Analyze Coverage
                    </Button>
                    
                    {networkCoverage && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Network Coverage:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Total Pincodes:</span> {networkCoverage.total_pincodes}</p>
                          <p><span className="font-medium">Successful Assignments:</span> {networkCoverage.successful_assignments}</p>
                          <p><span className="font-medium">Failed Assignments:</span> {networkCoverage.failed_assignments}</p>
                          <p><span className="font-medium">Coverage Percentage:</span> {networkCoverage.coverage_percentage}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Network Status */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      3. Network Status
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Check network and data status
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={loadNetworkStatus} 
                      disabled={loading.status}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading.status ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                      Refresh Network Status
                    </Button>
                    
                    {networkStatus && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">Network Status:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {networkStatus.status}</p>
                          <p><span className="font-medium">Total Hubs:</span> {networkStatus.hubs_info.total_hubs}</p>
                          <p><span className="font-medium">Pincode Mappings:</span> {networkStatus.hubs_info.pincode_mapping_size}</p>
                          <p><span className="font-medium">Order Data:</span> {networkStatus.data_status.order_data_available ? 'Available' : 'Not Available'}</p>
                          <p><span className="font-medium">Master Data:</span> {networkStatus.data_status.master_data_available ? 'Available' : 'Not Available'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 4. Order Risk Profiling */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      4. Order Risk Profiling
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Profile order risk before dispatch
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderNo">Order Number</Label>
                        <Input
                          id="orderNo"
                          placeholder="e.g., 1033626"
                          value={orderNo}
                          onChange={(e) => setOrderNo(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          placeholder="e.g., S1344713"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="riskPincode">Customer Pincode</Label>
                        <Input
                          id="riskPincode"
                          placeholder="e.g., 621714"
                          value={riskPincode}
                          onChange={(e) => setRiskPincode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryPeriod">Delivery Period (days)</Label>
                        <Input
                          id="deliveryPeriod"
                          type="number"
                          placeholder="e.g., 7"
                          value={deliveryPeriod}
                          onChange={(e) => setDeliveryPeriod(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleProfileOrderRisk} 
                      disabled={loading.risk || !orderNo || !sku || !riskPincode || !deliveryPeriod}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {loading.risk ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                      Profile Order Risk
                    </Button>
                    
                    {orderRisk && (
                      <div className={`mt-4 p-3 rounded-lg border ${getRiskColor(orderRisk.risk_level)}`}>
                        <h4 className={`font-semibold mb-2 ${getRiskColor(orderRisk.risk_level)}`}>Order Risk Profile:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Order No:</span> {orderRisk.order_no}</p>
                          <p><span className="font-medium">Risk Level:</span> {orderRisk.risk_level.toUpperCase()}</p>
                          <p><span className="font-medium">Risk Score:</span> {orderRisk.risk_score}</p>
                          <p><span className="font-medium">Delivery Period:</span> {orderRisk.delivery_period} days</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 5. Comprehensive Baseline */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-600" />
                      5. Comprehensive Baseline
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generate baseline network using real CSV data
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Source Toggle */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Data Source</Label>
                      <RadioGroup value={dataSource} onValueChange={(value: 'preloaded' | 'custom') => setDataSource(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="preloaded" id="preloaded" />
                          <Label htmlFor="preloaded" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              <span>Preloaded Data</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">Uses existing system data (default)</p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              <span>Custom Data</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">Upload your own CSV files</p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* File Upload Section - Only show for custom data */}
                    {dataSource === 'custom' && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <div className="space-y-2">
                          <Label htmlFor="orderFile" className="text-sm font-medium">Order Data CSV</Label>
                          <Input
                            id="orderFile"
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleOrderFileChange(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {orderFile && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {orderFile.name} ({(orderFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pickFile" className="text-sm font-medium">Pick Data CSV</Label>
                          <Input
                            id="pickFile"
                            type="file"
                            accept=".csv"
                            onChange={(e) => handlePickFileChange(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {pickFile && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {pickFile.name} ({(pickFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                        
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          <strong>File Requirements:</strong> CSV format, max 30MB each. Must contain required columns for order and pick data.
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Upload Progress</Label>
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground">{uploadProgress}% uploaded</p>
                      </div>
                    )}

                    {/* Limit Input */}
                    <div className="space-y-2">
                      <Label htmlFor="baselineLimit">Record Limit (optional)</Label>
                      <Input
                        id="baselineLimit"
                        placeholder="e.g., 10000"
                        value={baselineLimit}
                        onChange={(e) => setBaselineLimit(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of orders to process (default: 10,000)
                      </p>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      onClick={handleGenerateBaseline} 
                      disabled={loading.baseline || (dataSource === 'custom' && (!orderFile || !pickFile))}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      {loading.baseline ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                      Generate Baseline
                      {dataSource === 'custom' && ' from Custom Data'}
                    </Button>
                    
                    {baseline && (
                      <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <h4 className="font-semibold text-cyan-800 mb-2">Baseline Analysis:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Total Orders:</span> {baseline.total_orders.toLocaleString()}</p>
                          <p><span className="font-medium">Avg Delivery Time:</span> {baseline.avg_delivery_time} days</p>
                          <p><span className="font-medium">Service Level:</span> {baseline.service_level}%</p>
                          <p><span className="font-medium">Total Hubs:</span> {baseline.total_hubs}</p>
                          <p><span className="font-medium">Coverage:</span> {baseline.coverage_percentage}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 6. Comprehensive Compliance */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                      6. Comprehensive Compliance
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Calculate dispatch compliance metrics
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPerKm">Cost per Km ($)</Label>
                      <Input
                        id="costPerKm"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={costPerKm}
                        onChange={(e) => setCostPerKm(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleCalculateCompliance} 
                      disabled={loading.compliance}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {loading.compliance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Calculate Compliance
                    </Button>
                    
                    {compliance && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">Compliance Analysis:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Total Orders:</span> {compliance.total_orders.toLocaleString()}</p>
                          <p><span className="font-medium">Compliant Orders:</span> {compliance.compliant_orders.toLocaleString()}</p>
                          <p><span className="font-medium">Non-Compliant Orders:</span> {compliance.non_compliant_orders.toLocaleString()}</p>
                          <p><span className="font-medium">Compliance Rate:</span> {compliance.dispatch_compliance_pct}%</p>
                          <p><span className="font-medium">Cost Leakage:</span> ₹{compliance.cost_leakage_rupees.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* File Operations Tab */}
            <TabsContent value="file-operations" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 7. CSV Upload */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-600" />
                      7. CSV File Upload
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload order and pick CSV files for analysis
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-600 mb-2">
                        Drag & Drop CSV Files Here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to select files
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv"
                        className="hidden"
                        id="csv-upload"
                      />
                      <Button 
                        onClick={() => document.getElementById('csv-upload')?.click()}
                        variant="outline"
                        className="mt-2"
                      >
                        Select Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 8. CSV Merge Component */}
                <CSVMergeComponent />
              </div>
            </TabsContent>

            {/* Telemetry Tab */}
            <TabsContent value="telemetry" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* 10. Telemetry Health */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      10. Telemetry Health
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Health check for telemetry service
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={loadTelemetryHealth} 
                      disabled={loading.telemetry}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {loading.telemetry ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Check Health
                    </Button>
                    
                    {telemetryHealth && (
                      <div className={`mt-4 p-3 rounded-lg border ${getStatusColor(telemetryHealth.status)}`}>
                        <h4 className={`font-semibold mb-2 ${getStatusColor(telemetryHealth.status)}`}>Telemetry Health:</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Status:</span> {telemetryHealth.status.toUpperCase()}</p>
                          <p><span className="font-medium">Active Devices:</span> {telemetryHealth.active_devices}/{telemetryHealth.total_devices}</p>
                          <p><span className="font-medium">Last Update:</span> {new Date(telemetryHealth.last_update).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalysisPage;
