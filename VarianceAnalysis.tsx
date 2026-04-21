import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Plus,
  Calculator,
  FileText,
  AlertCircle
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
  Bar
} from 'recharts';

interface VarianceItem {
  id: string;
  itemName: string;
  plannedQuantity: number;
  plannedRate: number;
  plannedAmount: number;
  actualQuantity: number;
  actualRate: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  quantityVariance: number;
  priceVariance: number;
  date: string;
  status: 'profit' | 'loss';
}

interface VarianceSummary {
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  variancePercentage: number;
  totalOrders: number;
  profitableOrders: number;
  lossOrders: number;
}

const VarianceAnalysis: React.FC = () => {
  const [varianceData, setVarianceData] = useState<VarianceItem[]>([]);
  const [summary, setSummary] = useState<VarianceSummary>({
    totalPlanned: 0,
    totalActual: 0,
    totalVariance: 0,
    variancePercentage: 0,
    totalOrders: 0,
    profitableOrders: 0,
    lossOrders: 0
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [formData, setFormData] = useState({
    itemName: '',
    plannedQuantity: 0,
    plannedRate: 0,
    actualQuantity: 0,
    actualRate: 0
  });

  useEffect(() => {
    fetchVarianceData();
  }, []);

  const fetchVarianceData = async () => {
    setLoading(true);
    try {
      // Mock API data - replace with actual API call
      const mockData: VarianceItem[] = [
        {
          id: '1',
          itemName: 'Cotton Fabric - Premium',
          plannedQuantity: 100,
          plannedRate: 250,
          plannedAmount: 25000,
          actualQuantity: 110,
          actualRate: 260,
          actualAmount: 28600,
          variance: 3600,
          variancePercentage: 14.4,
          quantityVariance: 10,
          priceVariance: 1100,
          date: '2024-01-15',
          status: 'loss'
        },
        {
          id: '2',
          itemName: 'Polyester Thread',
          plannedQuantity: 500,
          plannedRate: 45,
          plannedAmount: 22500,
          actualQuantity: 480,
          actualRate: 42,
          actualAmount: 20160,
          variance: -2340,
          variancePercentage: -10.4,
          quantityVariance: -20,
          priceVariance: -1440,
          date: '2024-01-20',
          status: 'profit'
        },
        {
          id: '3',
          itemName: 'Dyes - Chemical',
          plannedQuantity: 200,
          plannedRate: 180,
          plannedAmount: 36000,
          actualQuantity: 190,
          actualRate: 185,
          actualAmount: 35150,
          variance: -850,
          variancePercentage: -2.36,
          quantityVariance: -10,
          priceVariance: 950,
          date: '2024-01-25',
          status: 'profit'
        }
      ];

      setVarianceData(mockData);
      calculateSummary(mockData);
    } catch (error) {
      console.error('Error fetching variance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: VarianceItem[]) => {
    const totalPlanned = data.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalActual = data.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActual - totalPlanned;
    const variancePercentage = totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0;
    const profitableOrders = data.filter(item => item.status === 'profit').length;
    const lossOrders = data.filter(item => item.status === 'loss').length;

    setSummary({
      totalPlanned,
      totalActual,
      totalVariance,
      variancePercentage,
      totalOrders: data.length,
      profitableOrders,
      lossOrders
    });
  };

  const handleAddVariance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const plannedAmount = formData.plannedQuantity * formData.plannedRate;
    const actualAmount = formData.actualQuantity * formData.actualRate;
    const variance = actualAmount - plannedAmount;
    const variancePercentage = plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0;
    const quantityVariance = formData.actualQuantity - formData.plannedQuantity;
    const priceVariance = (formData.actualRate - formData.plannedRate) * formData.actualQuantity;

    const newItem: VarianceItem = {
      id: Date.now().toString(),
      itemName: formData.itemName,
      plannedQuantity: formData.plannedQuantity,
      plannedRate: formData.plannedRate,
      plannedAmount,
      actualQuantity: formData.actualQuantity,
      actualRate: formData.actualRate,
      actualAmount,
      variance,
      variancePercentage,
      quantityVariance,
      priceVariance,
      date: new Date().toISOString().split('T')[0],
      status: variance >= 0 ? 'loss' : 'profit'
    };

    const updatedData = [...varianceData, newItem];
    setVarianceData(updatedData);
    calculateSummary(updatedData);
    setShowAddModal(false);
    setFormData({
      itemName: '',
      plannedQuantity: 0,
      plannedRate: 0,
      actualQuantity: 0,
      actualRate: 0
    });
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Mock export functionality - replace with actual API call
    console.log(`Exporting variance report as ${format}`);
    alert(`Report will be downloaded as ${format.toUpperCase()} file`);
  };

  const monthlyData = varianceData.reduce((acc: any[], item) => {
    const month = new Date(item.date).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(m => m.month === month);
    
    if (existingMonth) {
      existingMonth.planned += item.plannedAmount;
      existingMonth.actual += item.actualAmount;
      existingMonth.variance += item.variance;
    } else {
      acc.push({
        month,
        planned: item.plannedAmount,
        actual: item.actualAmount,
        variance: item.variance
      });
    }
    
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variance Analysis</h1>
          <p className="text-gray-600 mt-2">Analyze planned vs actual cost variances</p>
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Planned</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summary.totalPlanned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summary.totalActual.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Variance</p>
              <div className="flex items-center mt-2">
                <p className={`text-2xl font-bold ${
                  summary.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ₹{Math.abs(summary.totalVariance).toLocaleString('en-IN')}
                </p>
                {summary.totalVariance >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-500 ml-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-500 ml-2" />
                )}
              </div>
              <p className={`text-sm mt-1 ${
                summary.totalVariance >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {summary.variancePercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              summary.totalVariance >= 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <AlertCircle className={`w-6 h-6 ${
                summary.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders Analysis</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summary.totalOrders}
              </p>
              <div className="flex space-x-4 mt-2">
                <span className="text-sm text-green-600">
                  {summary.profitableOrders} Profit
                </span>
                <span className="text-sm text-red-600">
                  {summary.lossOrders} Loss
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Variance Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Variance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="planned" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Planned Cost"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Actual Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Variance Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Variance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="variance" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Variance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Variance Details</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('excel')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

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
              {varianceData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.plannedQuantity} × ₹{item.plannedRate}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₹{item.plannedAmount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.actualQuantity} × ₹{item.actualRate}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₹{item.actualAmount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      item.variance >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{Math.abs(item.variance).toLocaleString('en-IN')}
                    </div>
                    <div className={`text-xs ${
                      item.variance >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {item.variancePercentage.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'profit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'profit' ? 'PROFIT' : 'LOSS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Variance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add Variance Record</h2>
            </div>
            
            <form onSubmit={handleAddVariance} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.plannedQuantity}
                    onChange={(e) => setFormData({...formData, plannedQuantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.plannedRate}
                    onChange={(e) => setFormData({...formData, plannedRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.actualQuantity}
                    onChange={(e) => setFormData({...formData, actualQuantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.actualRate}
                    onChange={(e) => setFormData({...formData, actualRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
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
                  Add Variance Record
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
