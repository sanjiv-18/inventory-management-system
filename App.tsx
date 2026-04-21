import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/DashboardLive';
import ProductManagement from './pages/ProductManagementLive';
import ProductionPlanning from './pages/ProductionPlanningLive';
import ActualConsumption from './pages/ActualConsumptionLive';
import VarianceAnalysis from './pages/VarianceAnalysisLive';
import ReorderPrediction from './pages/ReorderPredictionLive';
import DataUpload from './pages/DataUpload';
import Reports from './pages/ReportsLive';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            {/* Main App Layout */}
            <div className="flex">
              <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
              
              <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <main className="p-6">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/production-planning" element={<ProductionPlanning />} />
                    <Route path="/actual-consumption" element={<ActualConsumption />} />
                    <Route path="/variance-analysis" element={<VarianceAnalysis />} />
                    <Route path="/reorder-prediction" element={<ReorderPrediction />} />
                    <Route path="/data-upload" element={<DataUpload />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
