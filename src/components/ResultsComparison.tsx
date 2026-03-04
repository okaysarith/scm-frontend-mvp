import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonMetric {
  label: string;
  baseline: number;
  scenario: number;
  delta: number;
  unit: string;
  format?: 'percentage' | 'currency' | 'number';
}

interface ResultsComparisonProps {
  metrics: ComparisonMetric[];
  recommendation: string;
  affectedOrders: number;
  totalOrders: number;
}

const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  metrics,
  recommendation,
  affectedOrders,
  totalOrders
}) => {
  const formatValue = (value: number, format?: string, unit?: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'number':
      default:
        return `${value.toFixed(1)}${unit || ''}`;
    }
  };

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (delta: number) => {
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRecommendationColor = (rec: string) => {
    if (rec.includes('STRONGLY RECOMMEND')) return 'bg-green-100 text-green-800 border-green-200';
    if (rec.includes('RECOMMEND')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className={`p-4 border rounded-lg ${getRecommendationColor(recommendation)}`}>
        <div className="font-medium mb-1">Recommendation</div>
        <div className="text-sm">{recommendation}</div>
      </div>

      {/* Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{metric.label}</span>
                {getTrendIcon(metric.delta)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Baseline:</span>
                  <span>{formatValue(metric.baseline, metric.format, metric.unit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scenario:</span>
                  <span>{formatValue(metric.scenario, metric.format, metric.unit)}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Change</span>
                  <span className={`text-xs font-medium ${getTrendColor(metric.delta)}`}>
                    {metric.delta > 0 ? '+' : ''}{formatValue(metric.delta, 'percentage')}
                  </span>
                </div>
                <Progress 
                  value={Math.abs(metric.delta)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Affected Orders */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Orders Affected</div>
              <div className="text-xs text-muted-foreground">
                {((affectedOrders / totalOrders) * 100).toFixed(1)}% of total orders
              </div>
            </div>
            <Badge variant="outline">
              {affectedOrders} / {totalOrders}
            </Badge>
          </div>
          <Progress 
            value={(affectedOrders / totalOrders) * 100} 
            className="h-2 mt-3"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsComparison;
