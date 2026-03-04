import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { networkService } from '@/services/networkService';
import { Loader2, Upload, Download, FileText, Merge, CheckCircle, XCircle, Info } from 'lucide-react';

interface MergeResult {
  filename: string;
  stats: string;
}

const CSVMergeComponent: React.FC = () => {
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [pickFile, setPickFile] = useState<File | null>(null);
  const [outputFilename, setOutputFilename] = useState('combined_df.csv');
  const [loading, setLoading] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMerge = async () => {
    if (!orderFile || !pickFile) {
      setError('Please select both order and pick CSV files');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await networkService.mergeCSVFiles(orderFile, pickFile, outputFilename);
      
      // Download the merged file automatically
      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMergeResult({
        filename: result.filename,
        stats: result.stats || ''
      });
      
    } catch (err) {
      setError('Failed to merge CSV files');
      console.error('Merge error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrderFile(null);
    setPickFile(null);
    setMergeResult(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Merge className="h-5 w-5 text-indigo-600" />
          11. CSV File Merger
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Merge Order and Pick CSV files into combined format with automatic download
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orderFile">Order CSV File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
              <input
                id="orderFile"
                type="file"
                accept=".csv"
                onChange={(e) => setOrderFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="orderFile" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {orderFile ? orderFile.name : 'Click to upload Order CSV'}
                </p>
                {orderFile && (
                  <div className="mt-2 space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {(orderFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                    <p className="text-xs text-green-600">✓ File selected</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pickFile">Pick CSV File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
              <input
                id="pickFile"
                type="file"
                accept=".csv"
                onChange={(e) => setPickFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="pickFile" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {pickFile ? pickFile.name : 'Click to upload Pick CSV'}
                </p>
                {pickFile && (
                  <div className="mt-2 space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {(pickFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                    <p className="text-xs text-green-600">✓ File selected</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Output Filename */}
        <div className="space-y-2">
          <Label htmlFor="outputFilename">Output Filename</Label>
          <Input
            id="outputFilename"
            placeholder="combined_df.csv"
            value={outputFilename}
            onChange={(e) => setOutputFilename(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            The merged file will be saved with this name and downloaded automatically
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleMerge} 
            disabled={loading || !orderFile || !pickFile}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Merge className="mr-2 h-4 w-4" />}
            Merge & Download CSV
          </Button>
          
          <Button 
            onClick={resetForm} 
            variant="outline"
            disabled={loading}
          >
            Reset
          </Button>
        </div>

        {/* Success Result */}
        {mergeResult && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-800">Merge Complete!</h3>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Downloaded:</span> 
                <span className="ml-2 font-mono bg-white px-2 py-1 rounded">{mergeResult.filename}</span>
              </div>
              {mergeResult.stats && (
                <div>
                  <span className="font-medium">Merge Statistics:</span> 
                  <span className="ml-2 text-indigo-600">{mergeResult.stats}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-indigo-600 text-xs mt-3">
                <Download className="h-3 w-3" />
                <span>File downloaded to your browser's download folder</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">📋 Instructions:</h4>
          </div>
          <ul className="text-sm text-blue-700 space-y-1 ml-6">
            <li>• Upload Order CSV file (required)</li>
            <li>• Upload Pick CSV file (required)</li>
            <li>• Set output filename (optional, defaults to combined_df.csv)</li>
            <li>• Click "Merge & Download" to combine and download</li>
            <li>• Merged file will be available for other endpoints</li>
            <li>• File downloads automatically to your Downloads folder</li>
          </ul>
        </div>

        {/* Feature Highlights */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-800">🚀 Features:</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
            <div>• Smart column detection</div>
            <div>• Automatic data merging</div>
            <div>• Left join on order_no</div>
            <div>• Duplicate column handling</div>
            <div>• Date format parsing</div>
            <div>• Immediate download</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVMergeComponent;
