import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface ProductionOrder {
  id: string;
  productName: string;
  plannedQty: number;
  actualQty: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  materials: Material[];
}

interface Material {
  name: string;
  requiredQty: number;
  availableQty: number;
  status: 'available' | 'shortage';
}

const ProductionPlanning: React.FC = () => {
  const { hasData, processedData } = useData();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (hasData && processedData) {
      // Generate production orders from processed data
      const generatedOrders: ProductionOrder[] = processedData.rows.slice(0, 10).map((row, index) => {
        const plannedQty = parseFloat(row.plannedQty) || Math.floor(Math.random() * 1000) + 100;
        const actualQty = Math.floor(plannedQty * (0.8 + Math.random() * 0.4));
        
        const statuses: ('planned' | 'in-progress' | 'completed' | 'delayed')[] = ['planned', 'in-progress', 'completed', 'delayed'];
        const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);

        return {
          id: `order-${index}`,
          productName: row.itemName || `Product ${index + 1}`,
          plannedQty,
          actualQty,
          status,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          priority,
          materials: [
            {
              name: 'Raw Material A',
              requiredQty: plannedQty * 2,
              availableQty: Math.floor(Math.random() * 3000) + 500,
              status: 'available'
            },
            {
              name: 'Component B',
              requiredQty: plannedQty,
              availableQty: Math.floor(Math.random() * 1500) + 200,
              status: Math.random() > 0.3 ? 'available' : 'shortage'
            }
          ]
        };
      });

      setOrders(generatedOrders);
    }
  }, [hasData, processedData]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getCompletionPercentage = (planned: number, actual: number) => {
    return Math.min((actual / planned) * 100, 100);
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Planning</h1>
          <p className="text-gray-600 mt-2">Plan your production orders and BOM</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your inventory dataset to plan production
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
          <h1 className="text-3xl font-bold text-gray-900">Production Planning</h1>
          <p className="text-gray-600 mt-2">
            Managing {orders.length} production orders from {processedData?.summary.validRows || 0} records
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Create Order
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search production orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* Production Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.productName}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                    {order.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Production Progress</span>
                <span className="font-medium">
                  {getCompletionPercentage(order.plannedQty, order.actualQty).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage(order.plannedQty, order.actualQty)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{order.actualQty} / {order.plannedQty} units</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-2 font-medium">{order.startDate}</span>
                </div>
                <div>
                  <span className="text-gray-500">End:</span>
                  <span className="ml-2 font-medium">{order.endDate}</span>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Package className="w-4 h-4 mr-2" />
                Materials Status
              </div>
              <div className="space-y-2">
                {order.materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{material.name}</span>
                    <div className="flex items-center">
                      {material.status === 'available' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        material.status === 'available' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {material.availableQty} / {material.requiredQty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Production Orders Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;
