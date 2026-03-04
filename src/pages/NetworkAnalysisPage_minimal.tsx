import React from 'react';
import NavigationSidebar from '@/components/NavigationSidebar';

const NetworkAnalysisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-green-600">Network Analysis</h1>
          <p className="text-muted-foreground">Page is loading successfully!</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalysisPage;
