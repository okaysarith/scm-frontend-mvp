import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface CSVUploadProps {
  onDataUploaded?: (orderData: File, pickData: File) => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onDataUploaded }) => {
  const [orderDataFile, setOrderDataFile] = useState<File | null>(null);
  const [pickDataFile, setPickDataFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleOrderDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setOrderDataFile(file);
    } else {
      alert('Please select a valid CSV file for Order Data');
    }
  };

  const handlePickDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setPickDataFile(file);
    } else {
      alert('Please select a valid CSV file for Pick Data');
    }
  };

  const handleUpload = async () => {
    if (!orderDataFile || !pickDataFile) {
      alert('Please select both Order Data and Pick Data CSV files');
      return;
    }

    setUploading(true);
    
    try {
      // Import networkService dynamically to avoid circular dependency
      const { networkService } = await import('../services/networkService');
      
      const result = await networkService.uploadCSVFiles(orderDataFile, pickDataFile);
      
      if (onDataUploaded) {
        onDataUploaded(orderDataFile, pickDataFile);
      }
      
      alert(`CSV files uploaded successfully!\n\nOrder Data: ${result.order_data.rows} rows\nPick Data: ${result.pick_data.rows} rows`);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload CSV Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order-data">Order Data CSV</Label>
            <Input
              id="order-data"
              type="file"
              accept=".csv"
              onChange={handleOrderDataChange}
              className="cursor-pointer"
            />
            {orderDataFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                {orderDataFile.name}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pick-data">Pick Data CSV</Label>
            <Input
              id="pick-data"
              type="file"
              accept=".csv"
              onChange={handlePickDataChange}
              className="cursor-pointer"
            />
            {pickDataFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                {pickDataFile.name}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!orderDataFile || !pickDataFile || uploading}
          className="w-full"
        >
          {uploading ? 'Processing...' : 'Use These CSV Files'}
        </Button>
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Order Data: Must contain "Order No", "Pincode" columns</li>
                <li>Pick Data: Must contain "Order No", "Hub Pincode" columns</li>
                <li>Files should be in UTF-8 encoding</li>
                <li>First row should contain column headers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;
