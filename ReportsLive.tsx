import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  FileDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useData } from '../contexts/DataContext';
import DataProcessor from '../utils/dataProcessor';

// Extend jsPDF to include autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  lastGenerated: string;
  dataCount: number;
}

const Reports: React.FC = () => {
  const { hasData, varianceData, reorderData, dashboardSummary, processedData } = useData();
  const [selectedReport, setSelectedReport] = useState<string>('variance');
  const [dateRange, setDateRange] = useState('30days');
  const [reportFormat, setReportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');

  const reportTypes: ReportType[] = [
    {
      id: 'variance',
      name: 'Variance Analysis Report',
      description: 'Detailed variance analysis with profit/loss breakdown',
      icon: TrendingUp,
      color: 'blue',
      lastGenerated: new Date().toLocaleDateString(),
      dataCount: varianceData.length
    },
    {
      id: 'reorder',
      name: 'Reorder Prediction Report',
      description: 'Inventory reorder predictions and urgency levels',
      icon: Package,
      color: 'orange',
      lastGenerated: new Date().toLocaleDateString(),
      dataCount: reorderData.length
    },
    {
      id: 'inventory',
      name: 'Inventory Summary Report',
      description: 'Complete inventory status and stock levels',
      icon: AlertTriangle,
      color: 'red',
      lastGenerated: new Date().toLocaleDateString(),
      dataCount: processedData?.summary.validRows || 0
    },
    {
      id: 'financial',
      name: 'Financial Summary Report',
      description: 'Cost analysis and financial impact',
      icon: DollarSign,
      color: 'green',
      lastGenerated: new Date().toLocaleDateString(),
      dataCount: varianceData.length
    }
  ];

  const generateVarianceReport = () => {
    const reportData = varianceData.map(item => ({
      'Item Name': item.itemName,
      'Planned Quantity': item.plannedQty,
      'Planned Rate': item.plannedRate,
      'Planned Amount': item.plannedAmount,
      'Actual Quantity': item.actualQty,
      'Actual Rate': item.actualRate,
      'Actual Amount': item.actualAmount,
      'Variance': item.variance,
      'Variance Percentage': item.variancePercentage.toFixed(2) + '%',
      'Status': item.status === 'profit' ? 'Profit' : 'Loss',
      'Impact': item.variance < 0 ? 'Savings' : 'Extra Cost'
    }));

    // Add summary rows
    const summary = {
      'Item Name': 'TOTAL',
      'Planned Amount': varianceData.reduce((sum, item) => sum + item.plannedAmount, 0),
      'Actual Amount': varianceData.reduce((sum, item) => sum + item.actualAmount, 0),
      'Variance': varianceData.reduce((sum, item) => sum + item.variance, 0),
      'Variance Percentage': dashboardSummary?.variancePercentage.toFixed(2) + '%' || '0%',
      'Status': '',
      'Impact': ''
    };

    return [...reportData, summary];
  };

  const generateReorderReport = () => {
    const reportData = reorderData.map(item => ({
      'Item Name': item.itemName,
      'Current Stock': item.currentStock,
      'Daily Consumption': item.dailyConsumption,
      'Lead Time': item.leadTime,
      'Safety Stock': item.safetyStock,
      'Reorder Level': item.reorderLevel,
      'Reorder Quantity': item.reorderQuantity,
      'Urgency Level': item.urgencyLevel.toUpperCase(),
      'Days of Stock': item.daysOfStock,
      'Needs Reorder': item.needsReorder ? 'Yes' : 'No',
      'Estimated Stockout Date': new Date(Date.now() + item.daysOfStock * 24 * 60 * 60 * 1000).toLocaleDateString(),
      'Recommended Action': item.needsReorder ? `Order ${item.reorderQuantity} units` : 'No action needed'
    }));

    return reportData;
  };

  const generateInventoryReport = () => {
    if (!processedData) return [];

    // Create inventory summary from processed data
    const inventoryData = processedData.rows.map((row, index) => ({
      'Item Name': row.itemName || `Item ${index + 1}`,
      'Category': row.category || 'Unknown',
      'Current Stock': row.currentStock || 0,
      'Daily Consumption': row.dailyConsumption || 0,
      'Lead Time': row.leadTime || 0,
      'Safety Stock': row.safetyStock || 0,
      'Supplier': row.supplier || 'Unknown',
      'Status': row.currentStock > 50 ? 'Normal' : row.currentStock > 20 ? 'Low' : 'Critical'
    }));

    return inventoryData;
  };

  const generateFinancialReport = () => {
    const financialData = varianceData.map(item => ({
      'Item Name': item.itemName,
      'Planned Cost': item.plannedAmount,
      'Actual Cost': item.actualAmount,
      'Variance': item.variance,
      'Variance Percentage': item.variancePercentage.toFixed(2) + '%',
      'Cost Impact': item.variance < 0 ? 'Savings' : 'Extra Cost',
      'Impact Amount': Math.abs(item.variance)
    }));

    // Add financial summary
    const totalPlanned = varianceData.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalActual = varianceData.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = varianceData.reduce((sum, item) => sum + item.variance, 0);
    const totalSavings = varianceData.filter(item => item.variance < 0).reduce((sum, item) => sum + Math.abs(item.variance), 0);
    const totalExtraCost = varianceData.filter(item => item.variance > 0).reduce((sum, item) => sum + item.variance, 0);

    const summary = {
      'Item Name': 'FINANCIAL SUMMARY',
      'Planned Cost': totalPlanned,
      'Actual Cost': totalActual,
      'Variance': totalVariance,
      'Variance Percentage': dashboardSummary?.variancePercentage.toFixed(2) + '%' || '0%',
      'Cost Impact': '',
      'Impact Amount': ''
    };

    const savingsSummary = {
      'Item Name': 'TOTAL SAVINGS',
      'Planned Cost': '',
      'Actual Cost': '',
      'Variance': -totalSavings,
      'Variance Percentage': '',
      'Cost Impact': 'Savings',
      'Impact Amount': totalSavings
    };

    const costSummary = {
      'Item Name': 'TOTAL EXTRA COST',
      'Planned Cost': '',
      'Actual Cost': '',
      'Variance': totalExtraCost,
      'Variance Percentage': '',
      'Cost Impact': 'Extra Cost',
      'Impact Amount': totalExtraCost
    };

    return [...financialData, summary, savingsSummary, costSummary];
  };

  const generateReport = () => {
    let reportData: any[] = [];
    let filename = '';

    switch (selectedReport) {
      case 'variance':
        reportData = generateVarianceReport();
        filename = `variance-analysis-report.${reportFormat}`;
        break;
      case 'reorder':
        reportData = generateReorderReport();
        filename = `reorder-prediction-report.${reportFormat}`;
        break;
      case 'inventory':
        reportData = generateInventoryReport();
        filename = `inventory-summary-report.${reportFormat}`;
        break;
      case 'financial':
        reportData = generateFinancialReport();
        filename = `financial-summary-report.${reportFormat}`;
        break;
    }

    if (reportData.length > 0) {
      if (reportFormat === 'pdf') {
        generatePDFReport(reportData, filename.replace('.pdf', ''));
      } else {
        DataProcessor.exportToCSV(reportData, filename);
        if (reportFormat === 'excel') {
          alert(`${filename} will be downloaded as ${reportFormat.toUpperCase()} file`);
        }
      }
    }
  };

  const generatePDFReport = (data: any[], filename: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`${filename.replace('-', ' ').toUpperCase()}`, 14, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add table
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row)),
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  };

  const getReportIcon = (icon: React.ComponentType<any>, color: string) => {
    const Icon = icon;
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      green: 'text-green-600 bg-green-100'
    };
    
    return (
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-6 h-6" />
      </div>
    );
  };

  // Chart data for reports overview
  const reportOverviewData = [
    { name: 'Variance', value: varianceData.length, color: '#3b82f6' },
    { name: 'Reorder', value: reorderData.length, color: '#f59e0b' },
    { name: 'Inventory', value: processedData?.summary.validRows || 0, color: '#ef4444' },
    { name: 'Financial', value: varianceData.length, color: '#10b981' }
  ];

  // Monthly trend data (mock for now)
  const monthlyTrend = [
    { month: 'Jan', reports: 45, value: 45 },
    { month: 'Feb', reports: 52, value: 52 },
    { month: 'Mar', reports: 48, value: 48 },
    { month: 'Apr', reports: 61, value: 61 },
    { month: 'May', reports: 55, value: 55 },
    { month: 'Jun', reports: 67, value: 67 }
  ];

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive reports</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to generate reports
            </p>
            <button
              onClick={() => window.location.href = '/data-upload'}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Upload Dataset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive reports from {processedData?.summary.validRows || 0} uploaded records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Report Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Types */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h3>
          <div className="space-y-4">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedReport === report.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getReportIcon(report.icon, report.color)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{report.dataCount}</p>
                    <p className="text-xs text-gray-500">records</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportOverviewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportOverviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Generation Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {reportTypes.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={reportFormat === 'csv'}
                  onChange={(e) => setReportFormat(e.target.value as 'csv' | 'excel' | 'pdf')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={reportFormat === 'excel'}
                  onChange={(e) => setReportFormat(e.target.value as 'csv' | 'excel' | 'pdf')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Excel</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={reportFormat === 'pdf'}
                  onChange={(e) => setReportFormat(e.target.value as 'csv' | 'excel' | 'pdf')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">PDF</span>
              </label>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-4 gap-4">
            {['7days', '30days', '90days', '1year'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 border rounded-lg ${
                  dateRange === range
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                {range === '7days' && 'Last 7 Days'}
                {range === '30days' && 'Last 30 Days'}
                {range === '90days' && 'Last 90 Days'}
                {range === '1year' && 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={generateReport}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {reportTypes.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getReportIcon(report.icon, report.color)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">Generated on {report.lastGenerated}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-primary-600 hover:text-primary-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
