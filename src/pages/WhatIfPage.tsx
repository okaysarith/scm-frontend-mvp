import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import WhatIfAnalysisEnhanced from '@/components/WhatIfAnalysisEnhanced';

const WhatIfPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
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
          <h1 className="text-2xl font-bold">What-If Analysis</h1>
          <p className="text-muted-foreground">Simulate scenarios and predict outcomes</p>
        </div>
      </div>
      <WhatIfAnalysisEnhanced />
    </div>
  );
};

export default WhatIfPage;
