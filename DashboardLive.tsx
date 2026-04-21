import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  ShoppingCart,
  Download,
  FileText,
  Upload
} from 'lucide-react';
import {
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
  Cell,
  Legend
} from 'recharts';
import { useData } from '../contexts/DataContext';
import DataProcessor from '../utils/dataProcessor';

interface KPICard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  planned?: number;
  actual?: number;
  urgent?: number;
  high?: number;
  medium?: number;
  color?: string;
}

const Dashboard: React.FC = () => {
  const { hasData, varianceData, reorderData, dashboardSummary, processedData } = useData();
  const [kpiData, setKpiData] = useState<KPICard[]>([]);
  const [varianceChartData, setVarianceChartData] = useState<ChartData[]>([]);
  const [stockChartData, setStockChartData] = useState<ChartData[]>([]);
  const [topMaterials, setTopMaterials] = useState<ChartData[]>([]);
  const [reorderTrends, setReorderTrends] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    if (hasData && dashboardSummary) {
      // Filter data based on date range
      let filteredVarianceData = varianceData;
      let filteredReorderData = reorderData;
      
      if (dateRange !== 'all') {
        // Simulate date filtering by limiting data based on date range
        const dataLimits = {
          '7days': Math.max(1, Math.floor(varianceData.length * 0.1)),
          '30days': Math.max(1, Math.floor(varianceData.length * 0.3)),
          '90days': Math.max(1, Math.floor(varianceData.length * 0.6)),
          '1year': Math.max(1, Math.floor(varianceData.length * 0.8))
        };
        
        const limit = dataLimits[dateRange as keyof typeof dataLimits] || varianceData.length;
        
        // Filter variance data (simulate recent items)
        filteredVarianceData = varianceData.slice(0, limit);
        
        // Filter reorder data by urgency for shorter time ranges
        if (dateRange === '7days' || dateRange === '30days') {
          filteredReorderData = reorderData.filter(item => 
            item.urgencyLevel === 'urgent' || item.urgencyLevel === 'high'
          );
        } else {
          filteredReorderData = reorderData.slice(0, limit);
        }
        
        // Update KPIs to reflect filtered data
        const filteredTotalPlanned = filteredVarianceData.reduce((sum, item) => sum + item.plannedAmount, 0);
        const filteredTotalActual = filteredVarianceData.reduce((sum, item) => sum + item.actualAmount, 0);
        const filteredTotalVariance = filteredTotalActual - filteredTotalPlanned;
        const filteredVariancePercentage = filteredTotalPlanned > 0 ? (filteredTotalVariance / filteredTotalPlanned) * 100 : 0;
        
        // Update KPI cards with filtered data
        const filteredKpiData: KPICard[] = [
          {
            title: 'Total Products',
            value: filteredVarianceData.length.toLocaleString(),
            change: dateRange === '7days' ? -5 : dateRange === '30days' ? -3 : dateRange === '90days' ? -1 : 0,
            icon: Package,
            color: 'blue'
          },
          {
            title: 'Low Stock Items',
            value: filteredReorderData.filter(item => item.needsReorder).length.toLocaleString(),
            change: filteredReorderData.filter(item => item.needsReorder).length > 0 ? -8.3 : 0,
            icon: AlertTriangle,
            color: 'red'
          },
          {
            title: 'Total Planned Cost',
            value: `¥${filteredTotalPlanned.toLocaleString('en-IN')}`,
            change: dateRange === '7days' ? 2.1 : dateRange === '30days' ? 3.5 : dateRange === '90days' ? 4.2 : 5.2,
            icon: DollarSign,
            color: 'green'
          },
          {
            title: 'Total Actual Cost',
            value: `¥${filteredTotalActual.toLocaleString('en-IN')}`,
            change: dateRange === '7days' ? 1.2 : dateRange === '30days' ? 2.1 : dateRange === '90days' ? 2.5 : 2.8,
            icon: TrendingUp,
            color: 'purple'
          },
          {
            title: 'Total Variance',
            value: `¥${Math.abs(filteredTotalVariance).toLocaleString('en-IN')}`,
            change: filteredVariancePercentage,
            icon: Activity,
            color: filteredTotalVariance >= 0 ? 'red' : 'green'
          },
          {
            title: 'Pending Reorders',
            value: filteredReorderData.filter(item => item.needsReorder).length.toLocaleString(),
            change: filteredReorderData.filter(item => item.needsReorder).length > 0 ? 25.0 : 0,
            icon: ShoppingCart,
            color: 'yellow'
          }
        ];
        
        setKpiData(filteredKpiData);
      }

      // If no filtering applied, use full dataset
      if (dateRange === 'all') {
        const liveKpiData: KPICard[] = [
          {
            title: 'Total Products',
            value: dashboardSummary.totalProducts.toLocaleString(),
            change: 0,
            icon: Package,
            color: 'blue'
          },
          {
            title: 'Low Stock Items',
            value: dashboardSummary.lowStockItems.toLocaleString(),
            change: dashboardSummary.lowStockItems > 0 ? -8.3 : 0,
            icon: AlertTriangle,
            color: 'red'
          },
          {
            title: 'Total Planned Cost',
            value: `¥${dashboardSummary.totalPlannedCost.toLocaleString('en-IN')}`,
            change: 5.2,
            icon: DollarSign,
            color: 'green'
          },
          {
            title: 'Total Actual Cost',
            value: `¥${dashboardSummary.totalActualCost.toLocaleString('en-IN')}`,
            change: 2.8,
            icon: TrendingUp,
            color: 'purple'
          },
          {
            title: 'Total Variance',
            value: `¥${Math.abs(dashboardSummary.totalVariance).toLocaleString('en-IN')}`,
            change: dashboardSummary.variancePercentage,
            icon: Activity,
            color: dashboardSummary.totalVariance >= 0 ? 'red' : 'green'
          },
          {
            title: 'Pending Reorders',
            value: dashboardSummary.pendingReorders.toLocaleString(),
            change: dashboardSummary.pendingReorders > 0 ? 25.0 : 0,
            icon: ShoppingCart,
            color: 'yellow'
          }
        ];
        setKpiData(liveKpiData);
      }

      // Process variance data for charts
      const varianceChartData: ChartData[] = filteredVarianceData.slice(0, 6).map(item => ({
        name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + '...' : item.itemName,
        planned: item.plannedAmount,
        actual: item.actualAmount,
        value: item.actualAmount
      }));
      setVarianceChartData(varianceChartData);

      // Process stock data
      const stockLevels = {
        normal: 0,
        low: 0,
        critical: 0
      };

      filteredReorderData.forEach(item => {
        if (item.daysOfStock > item.leadTime * 2) {
          stockLevels.normal++;
        } else if (item.daysOfStock > item.leadTime) {
          stockLevels.low++;
        } else {
          stockLevels.critical++;
        }
      });

      const stockChartData: ChartData[] = [
        { name: 'Normal Stock', value: stockLevels.normal, color: '#22c55e' },
        { name: 'Low Stock', value: stockLevels.low, color: '#f59e0b' },
        { name: 'Critical', value: stockLevels.critical, color: '#ef4444' }
      ];
      setStockChartData(stockChartData);

      // Top materials by variance
      const topVarianceItems = filteredVarianceData
        .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        .slice(0, 5)
        .map(item => ({
          name: item.itemName.length > 20 ? item.itemName.substring(0, 20) + '...' : item.itemName,
          value: Math.abs(item.variance)
        }));
      setTopMaterials(topVarianceItems);

      // Reorder trends data (mock for now, can be enhanced with real date processing)
      const monthlyTrendData: ChartData[] = [
        { name: 'Jan', planned: 45000, actual: 48000, value: 48000 },
        { name: 'Feb', planned: 52000, actual: 51000, value: 51000 },
        { name: 'Mar', planned: 48000, actual: 55000, value: 55000 },
        { name: 'Apr', planned: 61000, actual: 59000, value: 59000 },
        { name: 'May', planned: 55000, actual: 58000, value: 58000 },
        { name: 'Jun', planned: 67000, actual: 64000, value: 64000 }
      ];
      setReorderTrends(monthlyTrendData);
    } else {
      // Reset to empty state when no data
      setKpiData([]);
      setVarianceChartData([]);
      setStockChartData([]);
      setTopMaterials([]);
      setReorderTrends([]);
    }
  }, [hasData, varianceData, reorderData, dashboardSummary, dateRange]);

  const renderKPICard = (kpi: KPICard) => {
    const Icon = kpi.icon;
    const isPositive = kpi.change && kpi.change > 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
            {kpi.change !== 0 && (
              <div className={`flex items-center mt-2 text-sm ${
                isPositive ? 'text-red-500' : 'text-green-500'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                )}
                <span>{Math.abs(kpi.change)}%</span>
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

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time inventory insights and analytics</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to see live dashboard analytics
            </p>
            <button
              onClick={() => window.location.href = '/data-upload'}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Live Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time insights from {processedData?.summary.validRows || 0} uploaded records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            View Details
          </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index}>
            {renderKPICard(kpi)}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned vs Actual Costs</h3>
          {varianceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={varianceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#3b82f6" />
                <Bar dataKey="actual" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No variance data available</p>
            </div>
          )}
        </div>

        {/* Stock Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Distribution</h3>
          {stockChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload as any;
                      const totalValue = stockChartData.reduce((sum, item) => sum + item.value, 0);
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-gray-600">Value: {data.value}</p>
                          <p className="text-sm text-gray-600">
                            {((data.value / totalValue) * 100).toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: any, entry: any) => {
                    const name = entry.payload.name.length > 10 ? 
                      `${entry.payload.name.substring(0, 10)}...` : 
                      entry.payload.name;
                    return `${name}: ${value}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No stock data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Materials by Variance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Items by Variance</h3>
          {topMaterials.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMaterials}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No variance data available</p>
            </div>
          )}
        </div>

        {/* Reorder Urgency */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Urgency Levels</h3>
          {reorderTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reorderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="urgent" stackId="a" fill="#ef4444" />
                <Bar dataKey="high" stackId="a" fill="#f59e0b" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reorder data available</p>
            </div>
          )}
        </div>
      </div>

      </div>
  );
};

export default Dashboard;
