import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Filter,
  Download,
  Clock,
  AlertCircle,
  Truck,
  FileText
} from 'lucide-react';
import {
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
import { useData } from '../contexts/DataContext';
import DataProcessor from '../utils/dataProcessor';

interface ReorderFormData {
  itemName: string;
  currentStock: string;
  dailyConsumption: string;
  leadTime: string;
  safetyStock: string;
}

interface ChartData {
  name: string;
  value: number;
  urgent?: number;
  high?: number;
  medium?: number;
  color?: string;
}

const ReorderPrediction: React.FC = () => {
  const { hasData, reorderData, processedData } = useData();
  const [showDetails, setShowDetails] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<ReorderFormData>({
    itemName: '',
    currentStock: '',
    dailyConsumption: '',
    leadTime: '',
    safetyStock: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');

  // Calculate summary statistics
  const summaryStats = reorderData.reduce(
    (acc, item) => {
      const urgentItems = item.urgencyLevel === 'urgent' ? acc.urgentItems + 1 : acc.urgentItems;
      const highItems = item.urgencyLevel === 'high' ? acc.highItems + 1 : acc.highItems;
      const mediumItems = item.urgencyLevel === 'medium' ? acc.mediumItems + 1 : acc.mediumItems;
      const normalItems = item.urgencyLevel === 'normal' ? acc.normalItems + 1 : acc.normalItems;
      const totalReorderValue = acc.totalReorderValue + (item.reorderQuantity * 100); // Assuming avg $100 per unit

      return {
        totalItems: acc.totalItems + 1,
        urgentItems,
        highItems,
        mediumItems,
        normalItems,
        totalReorderValue
      };
    },
    { totalItems: 0, urgentItems: 0, highItems: 0, mediumItems: 0, normalItems: 0, totalReorderValue: 0 }
  );

  // Prepare chart data
  const urgencyPieData = [
    { name: 'Urgent', value: summaryStats.urgentItems, color: '#ef4444' },
    { name: 'High', value: summaryStats.highItems, color: '#f59e0b' },
    { name: 'Medium', value: summaryStats.mediumItems, color: '#eab308' },
    { name: 'Normal', value: summaryStats.normalItems, color: '#22c55e' }
  ];

  // Reorder trends data (mock for now, can be enhanced with real date processing)
  const reorderTrendsData: ChartData[] = [
    { name: 'Week 1', urgent: 5, high: 3, medium: 2, value: 10 },
    { name: 'Week 2', urgent: 3, high: 4, medium: 3, value: 10 },
    { name: 'Week 3', urgent: 7, high: 2, medium: 1, value: 10 },
    { name: 'Week 4', urgent: 6, high: 3, medium: 4, value: 13 }
  ];

  // Categories for filtering
  const categories = Array.from(new Set(reorderData.map(item => item.itemName.split(' ')[0])));

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentStock = parseFloat(formData.currentStock) || 0;
    const dailyConsumption = parseFloat(formData.dailyConsumption) || 1;
    const leadTime = parseFloat(formData.leadTime) || 7;
    const safetyStock = parseFloat(formData.safetyStock) || 0;

    const reorderLevel = (dailyConsumption * leadTime) + safetyStock;
    const reorderQuantity = Math.max(0, reorderLevel - currentStock);
    const daysOfStock = (dailyConsumption > 0 && currentStock > 0) ? Math.floor(currentStock / dailyConsumption) : 0;
    const needsReorder = reorderQuantity > 0;

    let urgencyLevel: 'urgent' | 'high' | 'medium' | 'normal' = 'normal';
    if (needsReorder) {
      if (daysOfStock <= leadTime) {
        urgencyLevel = 'urgent';
      } else if (daysOfStock <= leadTime * 2) {
        urgencyLevel = 'high';
      } else if (daysOfStock <= leadTime * 3) {
        urgencyLevel = 'medium';
      }
    }

    console.log('Reorder Calculation:', {
      itemName: formData.itemName,
      currentStock,
      dailyConsumption,
      leadTime,
      safetyStock,
      reorderLevel,
      reorderQuantity,
      urgencyLevel,
      daysOfStock,
      needsReorder
    });

    // Reset form
    setFormData({
      itemName: '',
      currentStock: '',
      dailyConsumption: '',
      leadTime: '',
      safetyStock: ''
    });
    setShowAddModal(false);
  };

  const exportReport = (format: 'csv' | 'excel') => {
    if (!hasData) return;
    
    const exportData = reorderData.map(item => ({
      'Item Name': item.itemName,
      'Current Stock': item.currentStock,
      'Daily Consumption': item.dailyConsumption,
      'Lead Time': item.leadTime,
      'Safety Stock': item.safetyStock,
      'Reorder Level': item.reorderLevel,
      'Reorder Quantity': item.reorderQuantity,
      'Urgency Level': item.urgencyLevel,
      'Days of Stock': item.daysOfStock,
      'Needs Reorder': item.needsReorder ? 'Yes' : 'No'
    }));

    DataProcessor.exportToCSV(exportData, `reorder-prediction-report.${format}`);
    if (format === 'excel') {
      alert(`Report will be downloaded as ${format.toUpperCase()} file`);
    }
  };

  const filteredItems = reorderData.filter(item => {
    const matchesCategory = !selectedCategory || item.itemName.includes(selectedCategory);
    return matchesCategory && item.reorderQuantity > 0;
  });

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reorder Prediction</h1>
          <p className="text-gray-600 mt-2">Smart inventory reorder predictions and alerts</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to see reorder predictions
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
          <h1 className="text-3xl font-bold text-gray-900">Reorder Prediction</h1>
          <p className="text-gray-600 mt-2">
            Analyzing {reorderData.length} items from {processedData?.summary.validRows || 0} records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate New
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Needing Reorder</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summaryStats.totalItems}
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
              <p className="text-sm font-medium text-gray-600">Urgent Items</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {summaryStats.urgentItems}
              </p>
              <p className="text-sm text-red-500">Immediate action required</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {summaryStats.highItems}
              </p>
              <p className="text-sm text-orange-500">Order this week</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Priority</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {summaryStats.mediumItems}
              </p>
              <p className="text-sm text-yellow-500">Plan for next month</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reorder Value</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                ${summaryStats.totalReorderValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={urgencyPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {urgencyPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reorder Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Trends (Last 4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reorderTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="urgent" stackId="a" fill="#ef4444" />
              <Bar dataKey="high" stackId="a" fill="#f59e0b" />
              <Bar dataKey="medium" stackId="a" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reorder Predictions</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Reorder Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item, index) => {
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate" title={item.itemName}>
                            {item.itemName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(item.urgencyLevel)}`}>
                            {item.urgencyLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900">
                          Current: {item.currentStock} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.reorderLevel} units
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">
                          Order: {item.reorderQuantity} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Level: {item.reorderLevel} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Value: ${(item.reorderQuantity * 100).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.daysOfStock > 0 ? `${item.daysOfStock} days left` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stockout: {new Date(Date.now() + item.daysOfStock * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Order by: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDetails(item)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Truck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No items need reordering</p>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Reorder Analysis</h2>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Item Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Item Name:</span>
                      <span className="text-sm font-medium">{showDetails.itemName}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Current Stock:</span>
                      <span className="text-sm font-medium">{showDetails.currentStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Daily Consumption:</span>
                      <span className="text-sm font-medium">{showDetails.dailyConsumption} units/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Days of Stock:</span>
                      <span className="text-sm font-medium">{showDetails.daysOfStock > 0 ? `${showDetails.daysOfStock} days` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reorder Calculation */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Calculation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Formula:</strong> Reorder Level = (Daily Consumption × Lead Time) + Safety Stock
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Calculation:</strong> ({showDetails.dailyConsumption} × {showDetails.leadTime}) + {showDetails.safetyStock} = {showDetails.reorderLevel} units
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Reorder Quantity:</strong> {showDetails.reorderLevel} - {showDetails.currentStock} = {showDetails.reorderQuantity} units
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Truck className="w-5 h-5 mr-2" />
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reorder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Calculate Reorder Prediction</h2>
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
                    Current Stock
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Consumption
                  </label>
                  <input
                    type="number"
                    name="dailyConsumption"
                    value={formData.dailyConsumption}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    name="leadTime"
                    value={formData.leadTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Stock
                  </label>
                  <input
                    type="number"
                    name="safetyStock"
                    value={formData.safetyStock}
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
                  Calculate Reorder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReorderPrediction;
