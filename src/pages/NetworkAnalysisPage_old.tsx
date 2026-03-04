import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { networkService } from '@/services/networkService';
import { telemetryService } from '@/services/telemetryService';
import NavigationSidebar from '@/components/NavigationSidebar';
import CSVMergeComponent from '@/components/CSVMergeComponent';
import { 
  Loader2, MapPin, TrendingUp, AlertTriangle, Database, BarChart3, 
  CheckCircle, XCircle, Clock, FileText, Activity, Heart, List, 
  Filter, Search, Radio 
} from 'lucide-react';

interface NetworkAnalysis {
  nearest_hub: string;
  distance_km: number;
  region?: string;
}

interface ComplianceAnalysis {
  total_orders: number;
  compliant_orders: number;
  non_compliant_orders: number;
  dispatch_compliance_pct: number;
  avg_distance_gap_km: number;
  cost_leakage_rupees: number;
  processing_method?: string;
  chunks_processed?: number;
  processing_time_seconds?: number;
}

interface UploadProgress {
  stage: string;
  progress: number;
  message: string;
}

interface DataStats {
  uniquePincodes: number;
  uniqueHubs: number;
  totalOrders: number;
  fileSizes: {
    orderData: string;
    pickData: string;
  };
}

const NetworkAnalysisPage: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [nearestHub, setNearestHub] = useState<NetworkAnalysis | null>(null);
  const [compliance, setCompliance] = useState<ComplianceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFindNearestHub = async () => {
    if (!pincode.trim()) {
      setError('Please enter a pincode');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await networkService.findNearestHub(pincode);
      setNearestHub(result);
    } catch (err) {
      setError('Failed to find nearest hub');
      console.error('Nearest hub error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateCompliance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await networkService.calculateCompliance(2.5);
      setCompliance(result);
    } catch (err) {
      setError('Failed to calculate compliance');
      console.error('Compliance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVDataUploaded = async (orderData: File, pickData: File) => {
    console.log('CSV files selected:', orderData.name, pickData.name);
    
    // Calculate file sizes
    const orderDataSize = (orderData.size / (1024 * 1024)).toFixed(2);
    const pickDataSize = (pickData.size / (1024 * 1024)).toFixed(2);
    
    setUploadProgress({
      stage: 'uploading',
      progress: 0,
      message: 'Uploading files...'
    });
    
    try {
      // Upload files to backend
      const result = await networkService.uploadCSVFiles(orderData, pickData);
      
      setUploadProgress({
        stage: 'analyzing',
        progress: 50,
        message: 'Analyzing unique data...'
      });
      
      // Analyze unique data
      const stats = await analyzeUniqueData(orderData, pickData);
      setDataStats(stats);
      
      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: 'Upload complete!'
      });
      
      setError(null);
      
      // Clear progress after 2 seconds
      setTimeout(() => setUploadProgress(null), 2000);
      
    } catch (err) {
      setError('Failed to upload files');
      setUploadProgress(null);
      console.error('Upload error:', err);
    }
  };
  
  const analyzeUniqueData = async (orderData: File, pickData: File): Promise<DataStats> => {
    // Simulate unique data analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uniquePincodes: Math.floor(Math.random() * 2000) + 1000,
          uniqueHubs: Math.floor(Math.random() * 50) + 20,
          totalOrders: Math.floor(Math.random() * 50000) + 10000,
          fileSizes: {
            orderData: `${(orderData.size / (1024 * 1024)).toFixed(2)} MB`,
            pickData: `${(pickData.size / (1024 * 1024)).toFixed(2)} MB`
          }
        });
      }, 1000);
    });
  };

  const handleLoadCSVData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setUploadProgress({
        stage: 'loading',
        progress: 25,
        message: 'Loading CSV data...'
      });
      
      const result = await networkService.loadCSVData(
        'data/Order_Data_csv_files/Order Data 28.12.25.csv',
        'data/Order_Pick_Data_csv_files/Order Pick Data 28.12.25.csv'
      );
      
      setUploadProgress({
        stage: 'loaded',
        progress: 100,
        message: 'Data loaded successfully!'
      });
      
      console.log('CSV Data loaded:', result);
      
      // Clear progress after 2 seconds
      setTimeout(() => setUploadProgress(null), 2000);
      
    } catch (err) {
      setError('Failed to load CSV data');
      setUploadProgress(null);
      console.error('CSV loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
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

          {/* Progress Indicator */}
          {uploadProgress && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {uploadProgress.stage === 'uploading' && <Upload className="h-5 w-5 text-green-600 animate-pulse" />}
                    {uploadProgress.stage === 'analyzing' && <Database className="h-5 w-5 text-blue-600 animate-pulse" />}
                    {uploadProgress.stage === 'loading' && <Loader2 className="h-5 w-5 text-green-600 animate-spin" />}
                    {uploadProgress.stage === 'complete' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadProgress.stage === 'loaded' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{uploadProgress.message}</p>
                      <span className="text-sm text-muted-foreground">{uploadProgress.progress}%</span>
                    </div>
                    <Progress value={uploadProgress.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="network-design" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Network Design (11)
              </TabsTrigger>
              <TabsTrigger value="telemetry" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Radio className="w-4 h-4 mr-2" />
                Telemetry (4)
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <CSVUpload onDataUploaded={handleCSVDataUploaded} />
              
              {/* Data Statistics */}
              {dataStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Data Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Unique Pincodes
                        </h4>
                        <p className="text-2xl font-bold text-green-600">{dataStats.uniquePincodes.toLocaleString()}</p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Unique Hubs
                        </h4>
                        <p className="text-2xl font-bold text-blue-600">{dataStats.uniqueHubs.toLocaleString()}</p>
                      </div>
                      
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Total Orders
                        </h4>
                        <p className="text-2xl font-bold text-emerald-600">{dataStats.totalOrders.toLocaleString()}</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          File Size
                        </h4>
                        <p className="text-sm font-medium text-orange-600">
                          Order: {dataStats.fileSizes.orderData}<br />
                          Pick: {dataStats.fileSizes.pickData}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              {/* Nearest Hub Finder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Nearest Hub Finder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Enter Pincode</Label>
                      <Input
                        id="pincode"
                        type="text"
                        placeholder="e.g., 400001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleFindNearestHub} 
                    disabled={loading}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Find Nearest Hub
                  </Button>

                  {nearestHub && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Nearest Hub Found!</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Hub Code</p>
                          <p className="font-semibold text-green-700">{nearestHub.nearest_hub}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Distance</p>
                          <p className="font-semibold text-green-700">{nearestHub.distance_km} km</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Region</p>
                          <p className="font-semibold text-green-700">{nearestHub.region || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              {/* Compliance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Compliance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleCalculateCompliance} 
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Calculate Compliance
                    </Button>
                    
                    <Button 
                      onClick={handleLoadCSVData} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      <Database className="mr-2 h-4 w-4" />
                      Load CSV Data
                    </Button>
                  </div>

                  {compliance && (
                    <div className="mt-6 space-y-4">
                      {/* Processing Info */}
                      {compliance.processing_method && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              Processing: {compliance.processing_method === 'chunked' ? 'Chunked' : 'Standard'}
                            </span>
                            {compliance.processing_time_seconds && (
                              <span className="text-blue-600">
                                ({compliance.processing_time_seconds}s)
                              </span>
                            )}
                            {compliance.chunks_processed && (
                              <span className="text-blue-600">
                                • {compliance.chunks_processed} chunks
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Compliance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Total Orders
                          </h4>
                          <p className="text-2xl font-bold text-blue-600">{compliance.total_orders?.toLocaleString()}</p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Compliant
                          </h4>
                          <p className="text-2xl font-bold text-green-600">{compliance.compliant_orders?.toLocaleString()}</p>
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Non-Compliant
                          </h4>
                          <p className="text-2xl font-bold text-red-600">{compliance.non_compliant_orders?.toLocaleString()}</p>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                          compliance.dispatch_compliance_pct >= 80 
                            ? 'bg-green-50 border-green-200'
                            : compliance.dispatch_compliance_pct >= 60
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <h4 className={`font-semibold flex items-center gap-2 ${
                            compliance.dispatch_compliance_pct >= 80 
                              ? 'text-green-800'
                              : compliance.dispatch_compliance_pct >= 60
                              ? 'text-yellow-800'
                              : 'text-red-800'
                          }`}>
                            <TrendingUp className="h-4 w-4" />
                            Compliance Rate
                          </h4>
                          <p className={`text-2xl font-bold ${
                            compliance.dispatch_compliance_pct >= 80 
                              ? 'text-green-600'
                              : compliance.dispatch_compliance_pct >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>{compliance.dispatch_compliance_pct?.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {compliance && compliance.dispatch_compliance_pct < 80 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Optimization Opportunity</h3>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Your compliance rate is {compliance.dispatch_compliance_pct?.toFixed(1)}%. Consider optimizing hub assignments to reduce costs and improve delivery times.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
