import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  Package,
  TrendingUp,
  TrendingDown,
  Calculator,
  Filter,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import DataProcessor, { 
  ProcessedData, 
  VarianceCalculation, 
  ReorderCalculation, 
  DashboardSummary 
} from '../utils/dataProcessor';
import { useData } from '../contexts/DataContext';

interface UploadedFile {
  file: File;
  processedData?: ProcessedData;
  status: 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  progress?: number;
}

const DataUpload: React.FC = () => {
  const { setProcessedData, varianceData, reorderData, dashboardSummary } = useData();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileWrapper = newFiles[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        fileWrapper.progress = progress;
        setUploadedFiles(prev => 
          prev.map(f => f.file === fileWrapper.file ? { ...f, progress } : f)
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Process the file
      try {
        (fileWrapper as UploadedFile).status = 'processing';
        setUploadedFiles(prev => 
          prev.map(f => f.file === fileWrapper.file ? { ...f, status: 'processing' as const } : f)
        );

        const processedData = await DataProcessor.processFile(fileWrapper.file);
        (fileWrapper as any).processedData = processedData;
        (fileWrapper as UploadedFile).status = processedData.summary.errors.length > 0 ? 'error' : 'success';
        
        if (processedData.summary.errors.length > 0) {
          (fileWrapper as any).error = processedData.summary.errors.join(', ');
        }

        setUploadedFiles(prev => 
          prev.map(f => f.file === fileWrapper.file ? { ...f, processedData, status: fileWrapper.status, error: (fileWrapper as any).error } : f)
        );

        // Update global analysis
        setProcessedData(processedData);
        
      } catch (error: any) {
        (fileWrapper as UploadedFile).status = 'error';
        (fileWrapper as any).error = error.message || 'Unknown error occurred';
        setUploadedFiles(prev => 
          prev.map(f => f.file === fileWrapper.file ? { ...f, status: 'error' as const, error: (fileWrapper as any).error } : f)
        );
      }
    }
  }, [setProcessedData]);

  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadTemplate = (type: 'products' | 'orders') => {
    const templateData = DataProcessor.generateSampleCSV();
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setUploadedFiles([]);
    // Data will be cleared through DataContext
  };

  // Test function for variance calculation
  const testVarianceCalculation = () => {
    console.log('=== MANUAL VARIANCE TEST ===');
    
    // Test with known data
    const testData = [
      {
        itemName: 'Test Item 1',
        plannedQty: '100',
        plannedRate: '10',
        actualQty: '120',
        actualRate: '8'
      }
    ];
    
    // Process through the same pipeline as uploaded data
    const columnMapping = DataProcessor.detectColumns(['ItemName', 'PlannedQty', 'PlannedRate', 'ActualQty', 'ActualRate']);
    console.log('Test column mapping:', columnMapping);
    
    const mappedData = DataProcessor.mapDataToStandardFormat(testData, columnMapping);
    console.log('Test mapped data:', mappedData);
    
    const varianceResult = DataProcessor.calculateVariance(mappedData);
    console.log('Test variance result:', varianceResult);
    
    // Expected: Planned=1000, Actual=960, Variance=-40 (profit)
  };

  const exportReport = (format: 'csv' | 'excel', type: 'variance' | 'reorder' | 'summary') => {
    if (!dashboardSummary) return;
    
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'variance':
        data = varianceData;
        filename = `variance-report.${format}`;
        break;
      case 'reorder':
        data = reorderData;
        filename = `reorder-report.${format}`;
        break;
      case 'summary':
        data = [
          {
            'Total Products': dashboardSummary.totalProducts,
            'Low Stock Items': dashboardSummary.lowStockItems,
            'Total Planned Cost': dashboardSummary.totalPlannedCost,
            'Total Actual Cost': dashboardSummary.totalActualCost,
            'Total Variance': dashboardSummary.totalVariance,
            'Pending Reorders': dashboardSummary.pendingReorders,
            'Variance Percentage': `${dashboardSummary.variancePercentage.toFixed(2)}%`
          }
        ];
        filename = `dashboard-summary.${format}`;
        break;
    }
    
    DataProcessor.exportToCSV(data, filename);
    if (format === 'excel') {
      alert(`${filename} will be downloaded as ${format.toUpperCase()} file`);
    }
  };

  const pieData = dashboardSummary ? [
    { name: 'Profit', value: varianceData.filter((v: VarianceCalculation) => v.status === 'profit').length, color: '#22c55e' },
    { name: 'Loss', value: varianceData.filter((v: VarianceCalculation) => v.status === 'loss').length, color: '#ef4444' }
  ] : [];

  const reorderPieData = dashboardSummary ? [
    { name: 'Urgent', value: reorderData.filter((r: ReorderCalculation) => r.urgencyLevel === 'urgent').length, color: '#ef4444' },
    { name: 'High', value: reorderData.filter((r: ReorderCalculation) => r.urgencyLevel === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: reorderData.filter((r: ReorderCalculation) => r.urgencyLevel === 'medium').length, color: '#eab308' },
    { name: 'Normal', value: reorderData.filter((r: ReorderCalculation) => r.urgencyLevel === 'normal').length, color: '#22c55e' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Data Upload</h1>
          <p className="text-gray-600 mt-2">Upload and analyze your inventory datasets with intelligent processing</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => downloadTemplate('products')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Sample Template
          </button>
          <button
            onClick={testVarianceCalculation}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Test Variance
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Dataset</h3>
          
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} className="hidden" />
            
            <div className="space-y-4">
              <Upload className={`w-12 h-12 mx-auto ${
                isDragActive ? 'text-primary-600' : 'text-gray-400'
              }`} />
              
              <p className={`text-lg font-medium ${
                isDragActive ? 'text-primary-600' : 'text-gray-600'
              }`}>
                {isDragActive 
                  ? 'Drop your files here' 
                  : 'Drag & drop CSV/Excel files here, or click to select'
                }
              </p>
              
              <p className="text-sm text-gray-500">
                Supports: .csv, .xlsx, .xls (Max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
            {uploadedFiles.length > 0 && (
              <button
                className="text-primary-600 hover:text-primary-900 text-sm"
              >
                View Column Mapping
              </button>
            )}
          </div>
          
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center flex-1">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024).toFixed(1)} KB
                      </p>
                      {file.status === 'processing' && (
                        <div className="flex items-center mt-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                          <span className="text-xs text-primary-600">Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    )}
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <button
              onClick={clearAll}
              className="mt-4 w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              Clear All Files
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {dashboardSummary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {dashboardSummary.totalProducts}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Variance</p>
                  <div className="flex items-center mt-2">
                    <p className={`text-2xl font-bold ${
                      dashboardSummary.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${Math.abs(dashboardSummary.totalVariance).toLocaleString('en-IN')}
                    </p>
                    {dashboardSummary.totalVariance >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-500 ml-2" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-500 ml-2" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    dashboardSummary.totalVariance >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {dashboardSummary.variancePercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {dashboardSummary.lowStockItems}
                  </p>
                  <p className="text-sm text-red-500">Need immediate reorder</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reorders</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {dashboardSummary.pendingReorders}
                  </p>
                  <p className="text-sm text-orange-500">Action required</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variance Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Reorder Urgency */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Urgency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reorderPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reorderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Variance Report</h4>
                <div className="space-x-2">
                  <button
                    onClick={() => exportReport('csv', 'variance')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportReport('excel', 'variance')}
                    className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reorder Report</h4>
                <div className="space-x-2">
                  <button
                    onClick={() => exportReport('csv', 'reorder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportReport('excel', 'reorder')}
                    className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dashboard Summary</h4>
                <div className="space-x-2">
                  <button
                    onClick={() => exportReport('csv', 'summary')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportReport('excel', 'summary')}
                    className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
