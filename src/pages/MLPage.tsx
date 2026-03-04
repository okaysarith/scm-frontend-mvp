import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import MLPredictions from '@/components/MLPredictions';

const MLPage = () => {
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
          <h1 className="text-2xl font-bold">Machine Learning</h1>
          <p className="text-muted-foreground">AI-powered supply chain predictions and analytics</p>
        </div>
      </div>
      <MLPredictions />
    </div>
  );
};

export default MLPage;
