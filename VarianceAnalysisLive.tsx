import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Plus,
  Download,
  Filter,
  BarChart3,
  FileText,
  Package
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useData } from '../contexts/DataContext';
import DataProcessor from '../utils/dataProcessor';

interface VarianceFormData {
  itemName: string;
  plannedQty: string;
  plannedRate: string;
  actualQty: string;
  actualRate: string;
}

interface ChartData {
  name: string;
  planned: number;
  actual: number;
  value: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const VarianceAnalysis: React.FC = () => {
  const { hasData, varianceData, processedData } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<VarianceFormData>({
    itemName: '',
    plannedQty: '',
    plannedRate: '',
    actualQty: '',
    actualRate: ''
  });
  const [dateRange, setDateRange] = useState('30days');

  // Filter variance data based on date range
  const getFilteredVarianceData = () => {
    if (dateRange === 'all') {
      return varianceData;
    }
    
    const dataLimits = {
      '7days': Math.max(1, Math.floor(varianceData.length * 0.1)),
      '30days': Math.max(1, Math.floor(varianceData.length * 0.3)),
      '90days': Math.max(1, Math.floor(varianceData.length * 0.6)),
      '1year': Math.max(1, Math.floor(varianceData.length * 0.8))
    };
    
    const limit = dataLimits[dateRange as keyof typeof dataLimits] || varianceData.length;
    return varianceData.slice(0, limit);
  };

  const filteredVarianceData = getFilteredVarianceData();

  // Calculate summary statistics
  const summaryStats = filteredVarianceData.reduce(
    (acc, item) => {
      const totalVariance = acc.totalVariance + item.variance;
      const totalPlanned = acc.totalPlanned + item.plannedAmount;
      const totalActual = acc.totalActual + item.actualAmount;
      const profitCount = item.variance < 0 ? acc.profitCount + 1 : acc.profitCount;
      const lossCount = item.variance > 0 ? acc.lossCount + 1 : acc.lossCount;

      return {
        totalVariance,
        totalPlanned,
        totalActual,
        profitCount,
        lossCount,
        variancePercentage: totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0
      };
    },
    { totalVariance: 0, totalPlanned: 0, totalActual: 0, profitCount: 0, lossCount: 0, variancePercentage: 0 }
  );

  // Prepare chart data
  const chartData: ChartData[] = filteredVarianceData.slice(0, 10).map(item => ({
    name: item.itemName.length > 20 ? item.itemName.substring(0, 20) + '...' : item.itemName,
    planned: item.plannedAmount,
    actual: item.actualAmount,
    value: item.actualAmount
  }));

  // Monthly trend data based on date range
  const getMonthlyTrendData = (): ChartData[] => {
    const baseData = [
      { name: 'Jan', planned: 45000, actual: 48000, value: 48000 },
      { name: 'Feb', planned: 52000, actual: 51000, value: 51000 },
      { name: 'Mar', planned: 48000, actual: 55000, value: 55000 },
      { name: 'Apr', planned: 61000, actual: 59000, value: 59000 },
      { name: 'May', planned: 55000, actual: 58000, value: 58000 },
      { name: 'Jun', planned: 67000, actual: 64000, value: 64000 },
      { name: 'Jul', planned: 59000, actual: 61000, value: 61000 },
      { name: 'Aug', planned: 62000, actual: 60000, value: 60000 },
      { name: 'Sep', planned: 58000, actual: 59000, value: 59000 },
      { name: 'Oct', planned: 64000, actual: 66000, value: 66000 },
      { name: 'Nov', planned: 70000, actual: 68000, value: 68000 },
      { name: 'Dec', planned: 75000, actual: 72000, value: 72000 }
    ];

    switch (dateRange) {
      case '7days':
        // Show last week of December
        return baseData.slice(-1).map(item => ({
          ...item,
          name: `${item.name} (Week 4)`,
          planned: item.planned * 0.25,
          actual: item.actual * 0.25,
          value: item.value * 0.25
        }));
      case '30days':
        // Show December only
        return baseData.slice(-1);
      case '90days':
        // Show Oct, Nov, Dec
        return baseData.slice(-3);
      case '1year':
        // Show all 12 months
        return baseData;
      case 'all':
      default:
        // Show recent 6 months
        return baseData.slice(-6);
    }
  };

  const monthlyTrendData = getMonthlyTrendData();

  // Category distribution
  const categoryData = varianceData.reduce((acc, item) => {
    const category = item.itemName.split(' ')[0] || 'Other';
    const existing = acc.find(c => c.name === category);
    if (existing) {
      existing.value += Math.abs(item.variance);
    } else {
      acc.push({ name: category, value: Math.abs(item.variance) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would add to the dataset - for now just show the calculation
    const plannedQty = parseFloat(formData.plannedQty) || 0;
    const plannedRate = parseFloat(formData.plannedRate) || 0;
    const actualQty = parseFloat(formData.actualQty) || 0;
    const actualRate = parseFloat(formData.actualRate) || 0;

    const plannedAmount = plannedQty * plannedRate;
    const actualAmount = actualQty * actualRate;
    const variance = actualAmount - plannedAmount;

    console.log('Variance Calculation:', {
      itemName: formData.itemName,
      plannedAmount,
      actualAmount,
      variance,
      variancePercentage: plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0
    });

    // Reset form
    setFormData({
      itemName: '',
      plannedQty: '',
      plannedRate: '',
      actualQty: '',
      actualRate: ''
    });
    setShowAddModal(false);
  };

  const exportReport = (format: 'csv' | 'excel') => {
    if (!hasData) return;
    
    const exportData = varianceData.map(item => ({
      'Item Name': item.itemName,
      'Planned Quantity': item.plannedQty,
      'Planned Rate': item.plannedRate,
      'Planned Amount': item.plannedAmount,
      'Actual Quantity': item.actualQty,
      'Actual Rate': item.actualRate,
      'Actual Amount': item.actualAmount,
      'Variance': item.variance,
      'Variance Percentage': item.variancePercentage.toFixed(2) + '%',
      'Status': item.status
    }));

    DataProcessor.exportToCSV(exportData, `variance-analysis-report.${format}`);
    if (format === 'excel') {
      alert(`Report will be downloaded as ${format.toUpperCase()} file`);
    }
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variance Analysis</h1>
          <p className="text-gray-600 mt-2">Detailed variance analysis and reporting</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to see variance analysis
            </p>
            <button
              onClick={() => window.location.href = '/data-upload'}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Variance Analysis</h1>
          <p className="text-gray-600 mt-2">
            Analyzing {varianceData.length} items from {processedData?.summary.validRows || 0} records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Variance
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Variance</p>
              <div className="flex items-center mt-2">
                <p className={`text-2xl font-bold ${
                  summaryStats.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${Math.abs(summaryStats.totalVariance).toLocaleString('en-IN')}
                </p>
                {summaryStats.totalVariance >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-500 ml-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-500 ml-2" />
                )}
              </div>
              <p className={`text-sm mt-1 ${
                summaryStats.totalVariance >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {summaryStats.variancePercentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Planned Cost</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${summaryStats.totalPlanned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actual Cost</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${summaryStats.totalActual.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit/Loss Items</p>
              <div className="flex items-center mt-2">
                <span className="text-lg font-bold text-green-600">{summaryStats.profitCount}</span>
                <span className="mx-2">/</span>
                <span className="text-lg font-bold text-red-600">{summaryStats.lossCount}</span>
              </div>
              <p className="text-sm text-gray-500">Profit / Loss</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variance Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned vs Actual Costs</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#3b82f6" />
                <Bar dataKey="actual" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No variance data available
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Variance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-4 gap-4">
          {['all', '7days', '30days', '90days', '1year'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                dateRange === range
                  ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-600 ring-offset-2'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range === 'all' && 'All Time'}
              {range === '7days' && 'Last 7 Days'}
              {range === '30days' && 'Last 30 Days'}
              {range === '90days' && 'Last 90 Days'}
              {range === '1year' && 'Last Year'}
            </button>
          ))}
        </div>
      </div>

        {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Items:</span>
            <span className="text-sm font-medium">{varianceData.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Avg Variance:</span>
            <span className="text-sm font-medium">
              ${varianceData.length > 0 ? (summaryStats.totalVariance / varianceData.length).toFixed(2) : '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Max Variance:</span>
            <span className="text-sm font-medium">
              ${varianceData.length > 0 ? Math.max(...varianceData.map(v => Math.abs(v.variance))).toFixed(2) : '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Min Variance:</span>
            <span className="text-sm font-medium">
              ${varianceData.length > 0 ? Math.min(...varianceData.map(v => Math.abs(v.variance))).toFixed(2) : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Variance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variance Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVarianceData.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.plannedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.actualAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      item.variance >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.variance >= 0 ? '+' : ''}${item.variance.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-xs ml-2 ${
                      item.variance >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      ({item.variancePercentage.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'profit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'profit' ? 'Profit' : 'Loss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVarianceData.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
              View all {filteredVarianceData.length} items
            </button>
          </div>
        )}
      </div>

      {/* Add Variance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add Variance Record</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned Quantity
                  </label>
                  <input
                    type="number"
                    name="plannedQty"
                    value={formData.plannedQty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned Rate
                  </label>
                  <input
                    type="number"
                    name="plannedRate"
                    value={formData.plannedRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Quantity
                  </label>
                  <input
                    type="number"
                    name="actualQty"
                    value={formData.actualQty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Rate
                  </label>
                  <input
                    type="number"
                    name="actualRate"
                    value={formData.actualRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Calculate Variance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VarianceAnalysis;
