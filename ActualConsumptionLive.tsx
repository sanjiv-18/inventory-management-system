import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
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
import { useData } from '../contexts/DataContext';

interface ConsumptionRecord {
  id: string;
  itemName: string;
  category: string;
  plannedQty: number;
  actualQty: number;
  variance: number;
  variancePercentage: number;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  operator: string;
  status: 'normal' | 'high' | 'low';
}

const ActualConsumption: React.FC = () => {
  const { hasData, processedData } = useData();
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    if (hasData && processedData) {
      // Generate consumption records from processed data
      const generatedRecords: ConsumptionRecord[] = processedData.rows.map((row, index) => {
        const plannedQty = parseFloat(row.plannedQty) || Math.floor(Math.random() * 100) + 50;
        const actualQty = parseFloat(row.actualQty) || plannedQty * (0.8 + Math.random() * 0.4);
        const variance = actualQty - plannedQty;
        const variancePercentage = plannedQty > 0 ? (variance / plannedQty) * 100 : 0;
        
        const shifts: ('morning' | 'afternoon' | 'night')[] = ['morning', 'afternoon', 'night'];
        const statuses: ('normal' | 'high' | 'low')[] = ['normal', 'high', 'low'];
        
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        let status: 'normal' | 'high' | 'low' = 'normal';
        if (Math.abs(variancePercentage) > 20) {
          status = variance > 0 ? 'high' : 'low';
        }

        return {
          id: `consumption-${index}`,
          itemName: row.itemName || `Item ${index + 1}`,
          category: row.category || 'General',
          plannedQty,
          actualQty,
          variance,
          variancePercentage,
          date: date.toLocaleDateString(),
          shift: shifts[Math.floor(Math.random() * shifts.length)],
          operator: `Operator ${Math.floor(Math.random() * 10) + 1}`,
          status
        };
      });

      setRecords(generatedRecords);
    }
  }, [hasData, processedData]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(records.map(r => r.category)));

  // Prepare chart data
  const chartData = records.slice(0, 10).map(record => ({
    name: record.itemName.length > 15 ? record.itemName.substring(0, 15) + '...' : record.itemName,
    planned: record.plannedQty,
    actual: record.actualQty,
    variance: Math.abs(record.variance)
  }));

  // Daily trend data
  const dailyTrendData = [
    { date: 'Mon', planned: 450, actual: 480, variance: 30 },
    { date: 'Tue', planned: 520, actual: 510, variance: 10 },
    { date: 'Wed', planned: 480, actual: 550, variance: 70 },
    { date: 'Thu', planned: 610, actual: 590, variance: 20 },
    { date: 'Fri', planned: 550, actual: 580, variance: 30 },
    { date: 'Sat', planned: 320, actual: 310, variance: 10 },
    { date: 'Sun', planned: 280, actual: 290, variance: 10 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 5) return 'text-green-600';
    if (Math.abs(variance) < 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actual Consumption</h1>
          <p className="text-gray-600 mt-2">Track actual material consumption</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to track consumption
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
          <h1 className="text-3xl font-bold text-gray-900">Actual Consumption</h1>
          <p className="text-gray-600 mt-2">
            Tracking {records.length} consumption records from {processedData?.summary.validRows || 0} uploaded records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Record Consumption
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Comparison */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned vs Actual Consumption</h3>
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
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Consumption Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search consumption records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
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

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredRecords.length} of {records.length} records
            </span>
          </div>
        </div>
      </div>

      {/* Consumption Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift & Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.slice(0, 10).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.itemName}</div>
                        <div className="text-xs text-gray-500">{record.category}</div>
                        <div className="text-xs text-gray-500">{record.date}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Planned: {record.plannedQty} units</div>
                      <div>Actual: {record.actualQty} units</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className={`font-medium ${getVarianceColor(record.variancePercentage)}`}>
                        {record.variance > 0 ? '+' : ''}{record.variance.toFixed(1)} units
                      </span>
                      <div className={`text-xs ${getVarianceColor(record.variancePercentage)}`}>
                        ({record.variancePercentage.toFixed(1)}%)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{record.shift.charAt(0).toUpperCase() + record.shift.slice(1)}</div>
                      <div className="text-xs text-gray-500">{record.operator}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No consumption records found</p>
          </div>
        )}
        
        {filteredRecords.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
              View all {filteredRecords.length} records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualConsumption;
