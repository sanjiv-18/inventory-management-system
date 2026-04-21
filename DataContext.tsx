import React, { createContext, useContext, useState, ReactNode } from 'react';
import DataProcessor, { 
  ProcessedData, 
  VarianceCalculation, 
  ReorderCalculation, 
  DashboardSummary 
} from '../utils/dataProcessor';

interface DataContextType {
  processedData: ProcessedData | null;
  varianceData: VarianceCalculation[];
  reorderData: ReorderCalculation[];
  dashboardSummary: DashboardSummary | null;
  hasData: boolean;
  setProcessedData: (data: ProcessedData) => void;
  clearData: () => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [processedData, setProcessedDataState] = useState<ProcessedData | null>(null);
  const [varianceData, setVarianceData] = useState<VarianceCalculation[]>([]);
  const [reorderData, setReorderData] = useState<ReorderCalculation[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  const setProcessedData = (data: ProcessedData) => {
    setProcessedDataState(data);
    
    // Process the data to generate calculations
    const columnMapping = DataProcessor.detectColumns(data.headers);
    const mappedData = DataProcessor.mapDataToStandardFormat(data.rows, columnMapping);
    
    const variance = DataProcessor.calculateVariance(mappedData);
    const reorder = DataProcessor.calculateReorderPredictions(mappedData);
    const summary = DataProcessor.generateDashboardSummary(variance, reorder);
    
    setVarianceData(variance);
    setReorderData(reorder);
    setDashboardSummary(summary);
  };

  const clearData = () => {
    setProcessedDataState(null);
    setVarianceData([]);
    setReorderData([]);
    setDashboardSummary(null);
  };

  const refreshData = () => {
    if (processedData) {
      setProcessedData(processedData);
    }
  };

  const hasData = !!processedData && processedData.summary.validRows > 0;

  return (
    <DataContext.Provider
      value={{
        processedData,
        varianceData,
        reorderData,
        dashboardSummary,
        hasData,
        setProcessedData,
        clearData,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
