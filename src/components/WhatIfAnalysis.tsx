import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { whatIfService } from '@/services/apiService';
import { Play, BarChart3, AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface ScenarioResult {
  scenario_id: string;
  results: {
    metric_name: string;
    baseline_value: number;
    scenario_value: number;
    impact: number;
    impact_percentage: number;
  }[];
  summary: {
    overall_impact: 'positive' | 'negative' | 'neutral';
    confidence_score: number;
  };
}

const WhatIfAnalysis: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [results, setResults] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});

  const fetchScenarios = async () => {
    try {
      const scenarioData = await whatIfService.getScenarios();
      setScenarios(scenarioData || []);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setResults(null);
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const initialParams: Record<string, number> = {};
      Object.keys(scenario.parameters).forEach(key => {
        initialParams[key] = scenario.parameters[key].default || 50;
      });
      setParameters(initialParams);
    }
  };

  const handleParameterChange = (paramName: string, value: number[]) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value[0]
    }));
  };

  const runScenario = async () => {
    if (!selectedScenario) return;

    setLoading(true);
    setError(null);
    try {
      const scenarioData = {
        scenario_id: selectedScenario,
        parameters: parameters
      };
      const result = await whatIfService.runScenario(scenarioData);
      setResults(result);
    } catch (err) {
      setError('Failed to run scenario analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (impact < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">What-If Analysis</h1>
          <p className="text-muted-foreground">Simulate supply chain scenarios and analyze impacts</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Scenario Configuration
            </CardTitle>
            <CardDescription>
              Select a scenario and adjust parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Scenario</label>
              <Select value={selectedScenario} onValueChange={handleScenarioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a scenario..." />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScenarioData && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">{selectedScenarioData.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedScenarioData.description}
                  </p>
                </div>

                {Object.entries(selectedScenarioData.parameters).map(([paramName, paramConfig]) => (
                  <div key={paramName} className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                      <span>{paramConfig.label || paramName}</span>
                      <span className="text-muted-foreground">
                        {parameters[paramName] || paramConfig.default || 50}
                      </span>
                    </label>
                    <Slider
                      value={[parameters[paramName] || paramConfig.default || 50]}
                      onValueChange={(value) => handleParameterChange(paramName, value)}
                      max={paramConfig.max || 100}
                      min={paramConfig.min || 0}
                      step={paramConfig.step || 1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{paramConfig.min || 0}</span>
                      <span>{paramConfig.max || 100}</span>
                    </div>
                  </div>
                ))}

                <Button 
                  onClick={runScenario} 
                  disabled={loading || !selectedScenario}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {loading ? 'Running Analysis...' : 'Run Scenario'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Impact analysis for the selected scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Overall Impact</h4>
                    <Badge variant={
                      results.summary.overall_impact === 'positive' ? 'default' :
                      results.summary.overall_impact === 'negative' ? 'destructive' : 'secondary'
                    }>
                      {results.summary.overall_impact}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {(results.summary.confidence_score * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-3">
                  {results.results.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.metric_name}</span>
                        {getImpactIcon(result.impact)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Baseline: </span>
                          <span>{result.baseline_value.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scenario: </span>
                          <span>{result.scenario_value.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`font-medium ${getImpactColor(result.impact)}`}>
                          {result.impact > 0 ? '+' : ''}{result.impact_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run a scenario to see analysis results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
