import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Activity,
  TrendingDown,
  BarChart3
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
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  planned?: number;
  actual?: number;
}

const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPICard[]>([]);
  const [varianceData, setVarianceData] = useState<ChartData[]>([]);
  const [stockData, setStockData] = useState<ChartData[]>([]);
  const [topMaterials, setTopMaterials] = useState<ChartData[]>([]);
  const [reorderTrends, setReorderTrends] = useState<ChartData[]>([]);

  const fetchDashboardData = async () => {
    try {
      // Mock API data - replace with actual API call
      const mockKpiData = [
        {
          title: 'Total Products',
          value: '1,248',
          change: 12.5,
          icon: Package,
          color: 'blue'
        },
        {
          title: 'Low Stock Items',
          value: '23',
          change: -8.3,
          icon: AlertTriangle,
          color: 'red'
        },
        {
          title: 'Total Planned Cost',
          value: '₹2,45,000',
          change: 5.2,
          icon: DollarSign,
          color: 'green'
        },
        {
          title: 'Total Actual Cost',
          value: '₹2,52,000',
          change: 2.8,
          icon: TrendingUp,
          color: 'purple'
        },
        {
          title: 'Total Variance',
          value: '₹7,000',
          change: 15.6,
          icon: Activity,
          color: 'orange'
        },
        {
          title: 'Pending Reorders',
          value: '18',
          change: 25.0,
          icon: ShoppingCart,
          color: 'yellow'
        }
      ];

      setKpiData(mockKpiData);

      const mockVarianceData = [
        { name: 'Jan', planned: 45000, actual: 48000, value: 48000 },
        { name: 'Feb', planned: 52000, actual: 51000, value: 51000 },
        { name: 'Mar', planned: 48000, actual: 55000, value: 55000 },
        { name: 'Apr', planned: 61000, actual: 59000, value: 59000 },
        { name: 'May', planned: 55000, actual: 58000, value: 58000 },
        { name: 'Jun', planned: 67000, actual: 64000, value: 64000 }
      ];

      setVarianceData(mockVarianceData);

      const mockStockData = [
        { name: 'Normal Stock', value: 65 },
        { name: 'Low Stock', value: 25 },
        { name: 'Critical', value: 10 }
      ];

      setStockData(mockStockData);

      const mockTopMaterials = [
        { name: 'Cotton Fabric', value: 45000 },
        { name: 'Polyester Thread', value: 32000 },
        { name: 'Dyes', value: 28000 },
        { name: 'Buttons', value: 15000 },
        { name: 'Zippers', value: 12000 }
      ];

      setTopMaterials(mockTopMaterials);

      const mockReorderTrends = [
        { name: 'Week 1', urgent: 5, high: 3, medium: 2, value: 10 },
        { name: 'Week 2', urgent: 3, high: 4, medium: 3, value: 10 },
        { name: 'Week 3', urgent: 7, high: 2, medium: 1, value: 10 },
        { name: 'Week 4', urgent: 6, high: 3, medium: 4, value: 13 }
      ];

      setReorderTrends(mockReorderTrends);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const renderKPICard = (kpi: KPICard) => {
    const Icon = kpi.icon;
    const isPositive = kpi.change && kpi.change > 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
            {kpi.change && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(kpi.change)}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${kpi.color}-100`}>
            <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your inventory management overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <div key={index}>{renderKPICard(kpi)}</div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cost Variance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Variance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={varianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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
                stroke="#ef4444" 
                strokeWidth={2}
                name="Actual Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumed Materials */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumed Materials</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMaterials}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reorder Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reorderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Add Product</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <ShoppingCart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Create Order</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <AlertTriangle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Check Alerts</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
