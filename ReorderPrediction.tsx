import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Filter,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck
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

interface ReorderItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  dailyConsumption: number;
  leadTime: number;
  safetyStock: number;
  supplierName: string;
  reorderLevel: number;
  reorderQuantity: number;
  urgencyLevel: 'urgent' | 'high' | 'medium' | 'normal';
  daysOfStock: number;
  estimatedStockoutDate: string;
  recommendedOrderDate: string;
}

interface ReorderSummary {
  totalItems: number;
  urgentItems: number;
  highItems: number;
  mediumItems: number;
  normalItems: number;
  totalReorderValue: number;
}

const ReorderPrediction: React.FC = () => {
  const [reorderItems, setReorderItems] = useState<ReorderItem[]>([]);
  const [summary, setSummary] = useState<ReorderSummary>({
    totalItems: 0,
    urgentItems: 0,
    highItems: 0,
    mediumItems: 0,
    normalItems: 0,
    totalReorderValue: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDetails, setShowDetails] = useState<ReorderItem | null>(null);

  const categories = ['Raw Material', 'Finished Goods', 'Packaging', 'Consumables', 'Spare Parts'];

  useEffect(() => {
    fetchReorderPredictions();
  }, []);

  const fetchReorderPredictions = async () => {
    setLoading(true);
    try {
      // Mock API data - replace with actual API call
      const mockData: ReorderItem[] = [
        {
          id: '1',
          itemCode: 'FAB001',
          itemName: 'Cotton Fabric - Premium',
          category: 'Raw Material',
          currentStock: 80,
          minimumStock: 200,
          dailyConsumption: 50,
          leadTime: 7,
          safetyStock: 100,
          supplierName: 'Textile Mills Ltd',
          reorderLevel: 450,
          reorderQuantity: 370,
          urgencyLevel: 'urgent',
          daysOfStock: 1,
          estimatedStockoutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recommendedOrderDate: new Date().toISOString().split('T')[0]
        },
        {
          id: '2',
          itemCode: 'THR001',
          itemName: 'Polyester Thread',
          category: 'Raw Material',
          currentStock: 600,
          minimumStock: 300,
          dailyConsumption: 80,
          leadTime: 5,
          safetyStock: 200,
          supplierName: 'Thread Suppliers Co',
          reorderLevel: 600,
          reorderQuantity: 0,
          urgencyLevel: 'normal',
          daysOfStock: 7,
          estimatedStockoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recommendedOrderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: '3',
          itemCode: 'DYE001',
          itemName: 'Chemical Dyes - Red',
          category: 'Raw Material',
          currentStock: 150,
          minimumStock: 100,
          dailyConsumption: 30,
          leadTime: 10,
          safetyStock: 50,
          supplierName: 'Chemical Supplies Inc',
          reorderLevel: 350,
          reorderQuantity: 200,
          urgencyLevel: 'high',
          daysOfStock: 5,
          estimatedStockoutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recommendedOrderDate: new Date().toISOString().split('T')[0]
        },
        {
          id: '4',
          itemCode: 'BUT001',
          itemName: 'Buttons - Premium',
          category: 'Packaging',
          currentStock: 500,
          minimumStock: 200,
          dailyConsumption: 100,
          leadTime: 3,
          safetyStock: 100,
          supplierName: 'Button World',
          reorderLevel: 400,
          reorderQuantity: 0,
          urgencyLevel: 'medium',
          daysOfStock: 5,
          estimatedStockoutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recommendedOrderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      setReorderItems(mockData);
      calculateSummary(mockData);
    } catch (error) {
      console.error('Error fetching reorder predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: ReorderItem[]) => {
    const urgentItems = data.filter(item => item.urgencyLevel === 'urgent').length;
    const highItems = data.filter(item => item.urgencyLevel === 'high').length;
    const mediumItems = data.filter(item => item.urgencyLevel === 'medium').length;
    const normalItems = data.filter(item => item.urgencyLevel === 'normal').length;
    const totalReorderValue = data.reduce((sum, item) => sum + (item.reorderQuantity * 100), 0); // Assuming ₹100 per unit avg

    setSummary({
      totalItems: data.length,
      urgentItems,
      highItems,
      mediumItems,
      normalItems,
      totalReorderValue
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting reorder report as ${format}`);
    alert(`Reorder report will be downloaded as ${format.toUpperCase()} file`);
  };

  const filteredItems = reorderItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesCategory && item.reorderQuantity > 0;
  });

  const pieData = [
    { name: 'Urgent', value: summary.urgentItems, color: '#ef4444' },
    { name: 'High', value: summary.highItems, color: '#f59e0b' },
    { name: 'Medium', value: summary.mediumItems, color: '#eab308' },
    { name: 'Normal', value: summary.normalItems, color: '#22c55e' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reorder Prediction</h1>
          <p className="text-gray-600 mt-2">Smart inventory reorder predictions and alerts</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Calculator className="w-5 h-5 mr-2" />
            Calculate All
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
                {summary.totalItems}
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
                {summary.urgentItems}
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
                {summary.highItems}
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
                {summary.mediumItems}
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
                ₹{summary.totalReorderValue.toLocaleString('en-IN')}
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

        {/* Reorder Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Mon', urgent: 5, high: 3, medium: 2 },
              { name: 'Tue', urgent: 3, high: 4, medium: 3 },
              { name: 'Wed', urgent: 7, high: 2, medium: 1 },
              { name: 'Thu', urgent: 4, high: 5, medium: 2 },
              { name: 'Fri', urgent: 6, high: 3, medium: 4 },
              { name: 'Sat', urgent: 2, high: 2, medium: 3 },
              { name: 'Sun', urgent: 4, high: 1, medium: 2 }
            ]}>
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
              {filteredItems.map((item) => {
                const UrgencyIcon = getUrgencyIcon(item.urgencyLevel);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.itemCode} • {item.supplierName}</div>
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
                          Min: {item.minimumStock} units
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
                          Value: ₹{(item.reorderQuantity * 100).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.daysOfStock} days left
                        </div>
                        <div className="text-xs text-gray-500">
                          Stockout: {item.estimatedStockoutDate}
                        </div>
                        <div className="text-xs text-gray-500">
                          Order by: {item.recommendedOrderDate}
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
                      <span className="text-sm text-gray-500">Item Code:</span>
                      <span className="text-sm font-medium">{showDetails.itemCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Item Name:</span>
                      <span className="text-sm font-medium">{showDetails.itemName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="text-sm font-medium">{showDetails.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Supplier:</span>
                      <span className="text-sm font-medium">{showDetails.supplierName}</span>
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
                      <span className="text-sm text-gray-500">Minimum Stock:</span>
                      <span className="text-sm font-medium">{showDetails.minimumStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Daily Consumption:</span>
                      <span className="text-sm font-medium">{showDetails.dailyConsumption} units/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Days of Stock:</span>
                      <span className="text-sm font-medium">{showDetails.daysOfStock} days</span>
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
    </div>
  );
};

export default ReorderPrediction;
