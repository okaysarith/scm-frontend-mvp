import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

interface ScenarioScore {
  return_rate_improvement: number;
  ontime_improvement: number;
  cost_impact: number;
  risk_score: number;
  overall_score: number;
}

interface Scenario {
  scenario_id: number;
  scenario_config: {
    sku: string;
    pincodes: string[];
    from_warehouse: string;
    to_warehouse: string;
  };
  results: any;
  score: ScenarioScore;
  rank: number;
}

interface ScenarioRankingProps {
  scenarios: Scenario[];
}

const ScenarioRanking: React.FC<ScenarioRankingProps> = ({ scenarios }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-600" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {rank}
        </div>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDelta = (value: number, isPercentage: boolean = true) => {
    const prefix = value > 0 ? '+' : '';
    const suffix = isPercentage ? '%' : '';
    return `${prefix}${value.toFixed(1)}${suffix}`;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'return_rate_improvement':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'ontime_improvement':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'cost_impact':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'risk_score':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'return_rate_improvement':
        return 'Return Rate Improvement';
      case 'ontime_improvement':
        return 'On-Time Improvement';
      case 'cost_impact':
        return 'Cost Impact';
      case 'risk_score':
        return 'Risk Score';
      default:
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getMetricValue = (key: string, value: number) => {
    switch (key) {
      case 'return_rate_improvement':
        return formatDelta(value * 100);
      case 'ontime_improvement':
        return formatDelta(value);
      case 'cost_impact':
        return `$${value.toFixed(0)}`;
      case 'risk_score':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <Card key={scenario.scenario_id} className="relative">
          <CardContent className="p-6">
            {/* Header with Rank */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRankIcon(scenario.rank)}
                <div>
                  <div className="font-semibold text-lg">
                    {scenario.scenario_config.sku}: {scenario.scenario_config.from_warehouse} → {scenario.scenario_config.to_warehouse}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {scenario.scenario_config.pincodes.length} pincodes affected
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(scenario.score.overall_score)}`}>
                  {scenario.score.overall_score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(scenario.score).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {getMetricIcon(key)}
                  </div>
                  <div className="text-sm font-medium">
                    {getMetricValue(key, value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getMetricLabel(key)}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bars */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Performance</span>
                <span className="font-medium">{scenario.score.overall_score.toFixed(1)}%</span>
              </div>
              <Progress value={scenario.score.overall_score} className="h-2" />
            </div>

            {/* Recommendation Badge */}
            {scenario.rank === 1 && (
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Recommended Scenario
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScenarioRanking;
