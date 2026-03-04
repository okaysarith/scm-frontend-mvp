import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { whatIfService } from '@/services/apiService';
import { 
  Play, 
  BarChart3, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Warehouse,
  MapPin,
  Package,
  ArrowRightLeft,
  Download,
  Share2
} from 'lucide-react';

// Types for the enhanced what-if analysis
interface WhatIfOptions {
  available_skus: string[];
  available_warehouses: string[];
  available_pincodes: string[];
  warehouse_locations: Record<string, {
    latitude: number;
    longitude: number;
    capacity: number;
    current_utilization: number;
  }>;
  order_summary: {
    total_orders: number;
    unique_skus: number;
    unique_pincodes: number;
    active_warehouses: number;
  };
}

interface WarehouseRelocationData {
  sku: string;
  pincodes: string[];
  from_warehouse: string;
  to_warehouse: string;
}

interface ScenarioResult {
  baseline_avg_return_prob: number;
  scenario_avg_return_prob: number;
  return_prob_delta: number;
  baseline_on_time_pct: number;
  scenario_on_time_pct: number;
  on_time_delta_pct: number;
  order_count_affected: number;
  total_orders: number;
  recommendation: string;
}

interface ScenarioComparison {
  scenario_id: number;
  scenario_config: WarehouseRelocationData;
  results: ScenarioResult;
  score: {
    return_rate_improvement: number;
    ontime_improvement: number;
    cost_impact: number;
    risk_score: number;
    overall_score: number;
  };
  rank: number;
}

const WhatIfAnalysisEnhanced: React.FC = () => {
  const [options, setOptions] = useState<WhatIfOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Single scenario state
  const [scenarioData, setScenarioData] = useState<WarehouseRelocationData>({
    sku: '',
    pincodes: [],
    from_warehouse: '',
    to_warehouse: ''
  });
  const [singleResult, setSingleResult] = useState<ScenarioResult | null>(null);
  
  // Multi-scenario comparison state
  const [scenarios, setScenarios] = useState<WarehouseRelocationData[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ScenarioComparison[] | null>(null);

  // Load available options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await whatIfService.getOptions();
        setOptions(data);
      } catch (err) {
        console.warn('Backend not available, using mock data:', err);
        // Use mock data when backend is not available
        const mockOptions: WhatIfOptions = {
          available_skus: ['SKU001', 'SKU002', 'SKU003', 'SKU004', 'SKU005'],
          available_warehouses: ['W1', 'W2', 'W3'],
          available_pincodes: ['400001', '400002', '400003', '400004', '400005', '400006', '400007', '400008'],
          warehouse_locations: {
            'W1': { latitude: 19.0760, longitude: 72.8777, capacity: 1000, current_utilization: 0.75 },
            'W2': { latitude: 28.6139, longitude: 77.2090, capacity: 800, current_utilization: 0.60 },
            'W3': { latitude: 12.9716, longitude: 77.5946, capacity: 600, current_utilization: 0.45 }
          },
          order_summary: {
            total_orders: 500,
            unique_skus: 5,
            unique_pincodes: 8,
            active_warehouses: 3
          }
        };
        setOptions(mockOptions);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const runSingleScenario = async () => {
    if (!scenarioData.sku || !scenarioData.from_warehouse || !scenarioData.to_warehouse || scenarioData.pincodes.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await whatIfService.analyzeWarehouseRelocation(scenarioData);
      setSingleResult(result);
    } catch (err) {
      setError('Failed to run scenario analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addScenario = () => {
    if (!scenarioData.sku || !scenarioData.from_warehouse || !scenarioData.to_warehouse || scenarioData.pincodes.length === 0) {
      setError('Please complete scenario configuration before adding');
      return;
    }
    setScenarios([...scenarios, { ...scenarioData }]);
    // Reset form
    setScenarioData({
      sku: '',
      pincodes: [],
      from_warehouse: '',
      to_warehouse: ''
    });
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const runComparison = async () => {
    if (scenarios.length === 0) {
      setError('Please add at least one scenario to compare');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await whatIfService.compareScenarios(scenarios);
      setComparisonResults(result.scenarios);
    } catch (err) {
      setError('Failed to run scenario comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('STRONGLY RECOMMEND')) return 'bg-green-100 text-green-800 border-green-200';
    if (recommendation.includes('RECOMMEND')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatDelta = (delta: number, isPercentage: boolean = true) => {
    const prefix = delta > 0 ? '+' : '';
    const suffix = isPercentage ? '%' : '';
    return `${prefix}${delta.toFixed(1)}${suffix}`;
  };

  if (loading && !options) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading what-if analysis options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Scenario Analysis</TabsTrigger>
          <TabsTrigger value="compare">Multi-Scenario Comparison</TabsTrigger>
        </TabsList>

        {/* Single Scenario Analysis */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warehouse className="mr-2 h-5 w-5" />
                  Warehouse Relocation Analysis
                </CardTitle>
                <CardDescription>
                  Configure and analyze warehouse relocation scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {options && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Select
                        value={scenarioData.sku}
                        onValueChange={(value) => setScenarioData(prev => ({ ...prev, sku: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select SKU..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options.available_skus.map((sku) => (
                            <SelectItem key={sku} value={sku}>
                              <div className="flex items-center">
                                <Package className="mr-2 h-4 w-4" />
                                {sku}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Pincodes</Label>
                      <MultiSelect
                        options={options.available_pincodes.map(pincode => ({
                          value: pincode,
                          label: pincode
                        }))}
                        selected={scenarioData.pincodes}
                        onChange={(selected) => setScenarioData(prev => ({ ...prev, pincodes: selected }))}
                        placeholder="Select pincodes..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from-warehouse">From Warehouse</Label>
                        <Select
                          value={scenarioData.from_warehouse}
                          onValueChange={(value) => setScenarioData(prev => ({ ...prev, from_warehouse: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="From..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.available_warehouses.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="to-warehouse">To Warehouse</Label>
                        <Select
                          value={scenarioData.to_warehouse}
                          onValueChange={(value) => setScenarioData(prev => ({ ...prev, to_warehouse: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="To..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.available_warehouses.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={runSingleScenario} 
                      disabled={loading || !scenarioData.sku || !scenarioData.from_warehouse || !scenarioData.to_warehouse || scenarioData.pincodes.length === 0}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {loading ? 'Running Analysis...' : 'Run Scenario Analysis'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  Impact analysis for the warehouse relocation scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {singleResult ? (
                  <div className="space-y-4">
                    {/* Recommendation */}
                    <div className={`p-4 border rounded-lg ${getRecommendationColor(singleResult.recommendation)}`}>
                      <div className="font-medium mb-1">Recommendation</div>
                      <div className="text-sm">{singleResult.recommendation}</div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Return Rate Impact</span>
                          {singleResult.return_prob_delta < 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-lg font-bold">
                          {formatDelta(singleResult.return_prob_delta * 100)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {singleResult.baseline_avg_return_prob.toFixed(1)}% → {singleResult.scenario_avg_return_prob.toFixed(1)}%
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">On-Time Delivery</span>
                          {singleResult.on_time_delta_pct > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-lg font-bold">
                          {formatDelta(singleResult.on_time_delta_pct)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {singleResult.baseline_on_time_pct.toFixed(1)}% → {singleResult.scenario_on_time_pct.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Affected Orders */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Orders Affected</span>
                        <Badge variant="outline">
                          {singleResult.order_count_affected} / {singleResult.total_orders}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {((singleResult.order_count_affected / singleResult.total_orders) * 100).toFixed(1)}% of total orders
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure and run a scenario to see analysis results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Multi-Scenario Comparison */}
        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRightLeft className="mr-2 h-5 w-5" />
                  Scenario Builder
                </CardTitle>
                <CardDescription>
                  Build multiple scenarios for comparison
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {options && (
                  <>
                    {/* Reuse the same form fields as single scenario */}
                    <div className="space-y-2">
                      <Label htmlFor="compare-sku">SKU</Label>
                      <Select
                        value={scenarioData.sku}
                        onValueChange={(value) => setScenarioData(prev => ({ ...prev, sku: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select SKU..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options.available_skus.map((sku) => (
                            <SelectItem key={sku} value={sku}>
                              {sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Pincodes</Label>
                      <MultiSelect
                        options={options.available_pincodes.map(pincode => ({
                          value: pincode,
                          label: pincode
                        }))}
                        selected={scenarioData.pincodes}
                        onChange={(selected) => setScenarioData(prev => ({ ...prev, pincodes: selected }))}
                        placeholder="Select pincodes..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Warehouse</Label>
                        <Select
                          value={scenarioData.from_warehouse}
                          onValueChange={(value) => setScenarioData(prev => ({ ...prev, from_warehouse: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="From..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.available_warehouses.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>To Warehouse</Label>
                        <Select
                          value={scenarioData.to_warehouse}
                          onValueChange={(value) => setScenarioData(prev => ({ ...prev, to_warehouse: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="To..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.available_warehouses.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={addScenario}
                        disabled={!scenarioData.sku || !scenarioData.from_warehouse || !scenarioData.to_warehouse || scenarioData.pincodes.length === 0}
                        variant="outline"
                        className="flex-1"
                      >
                        Add Scenario
                      </Button>
                      <Button 
                        onClick={runComparison}
                        disabled={loading || scenarios.length === 0}
                        className="flex-1"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {loading ? 'Comparing...' : 'Compare Scenarios'}
                      </Button>
                    </div>

                    {/* Scenario List */}
                    {scenarios.length > 0 && (
                      <div className="space-y-2">
                        <Label>Scenarios to Compare ({scenarios.length})</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {scenarios.map((scenario, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                              <span>{scenario.sku}: {scenario.from_warehouse} → {scenario.to_warehouse}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeScenario(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Comparison Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Comparison Results
                </CardTitle>
                <CardDescription>
                  Ranked comparison of multiple scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonResults ? (
                  <div className="space-y-4">
                    {comparisonResults.map((result) => (
                      <div key={result.scenario_id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Rank #{result.rank}</Badge>
                            <span className="font-medium">
                              {result.scenario_config.sku}: {result.scenario_config.from_warehouse} → {result.scenario_config.to_warehouse}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {result.score.overall_score.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Return Improvement: {formatDelta(result.score.return_rate_improvement * 100)}</div>
                          <div>On-Time Improvement: {formatDelta(result.score.ontime_improvement)}</div>
                          <div>Cost Impact: ${result.score.cost_impact.toFixed(0)}</div>
                          <div>Risk Score: {(result.score.risk_score * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add scenarios and run comparison to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatIfAnalysisEnhanced;
