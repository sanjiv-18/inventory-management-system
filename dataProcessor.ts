import * as XLSX from 'xlsx';

export interface ProcessedData {
  headers: string[];
  rows: Record<string, any>[];
  summary: {
    totalRows: number;
    validRows: number;
    errors: string[];
    warnings: string[];
  };
}

export interface ColumnMapping {
  itemName: string[];
  plannedQty: string[];
  plannedRate: string[];
  actualQty: string[];
  actualRate: string[];
  currentStock: string[];
  dailyConsumption: string[];
  leadTime: string[];
  safetyStock: string[];
  category: string[];
  supplier: string[];
}

export interface VarianceCalculation {
  itemName: string;
  plannedQty: number;
  plannedRate: number;
  plannedAmount: number;
  actualQty: number;
  actualRate: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'profit' | 'loss';
}

export interface ReorderCalculation {
  itemName: string;
  currentStock: number;
  dailyConsumption: number;
  leadTime: number;
  safetyStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  urgencyLevel: 'urgent' | 'high' | 'medium' | 'normal';
  daysOfStock: number;
  needsReorder: boolean;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockItems: number;
  totalPlannedCost: number;
  totalActualCost: number;
  totalVariance: number;
  pendingReorders: number;
  variancePercentage: number;
}

class DataProcessor {
  private static readonly COLUMN_MAPPINGS: ColumnMapping = {
    itemName: [
      'ItemName', 'itemname', 'item_name', 'itemName', 'Product Name', 'productname', 'product_name',
      'Material', 'material', 'Product', 'product', 'Item', 'item'
    ],
    plannedQty: [
      'PlannedQty', 'planned_qty', 'Planned Quantity', 'plannedquantity', 'PlannedQty', 'plannedqty',
      'Plan Qty', 'plan_qty', 'Planned', 'planned', 'Expected Qty', 'expected_qty'
    ],
    plannedRate: [
      'PlannedRate', 'planned_rate', 'Planned Rate', 'plannedrate', 'PlannedPrice', 'planned_price',
      'Plan Rate', 'plan_rate', 'Planned Cost', 'planned_cost', 'Expected Rate', 'expected_rate'
    ],
    actualQty: [
      'ActualQty', 'actual_qty', 'Actual Quantity', 'actualquantity', 'ActualQty', 'actualqty',
      'Used Qty', 'used_qty', 'Actual', 'actual', 'Consumed Qty', 'consumed_qty'
    ],
    actualRate: [
      'ActualRate', 'actual_rate', 'Actual Rate', 'actualrate', 'ActualPrice', 'actual_price',
      'Actual Cost', 'actual_cost', 'Used Rate', 'used_rate', 'Consumed Rate', 'consumed_rate'
    ],
    currentStock: [
      'CurrentStock', 'current_stock', 'Current Stock', 'currentstock', 'Stock', 'stock',
      'Available', 'available', 'On Hand', 'on_hand', 'Inventory', 'inventory'
    ],
    dailyConsumption: [
      'DailyConsumption', 'daily_consumption', 'Daily Consumption', 'dailyconsumption',
      'Daily Usage', 'daily_usage', 'Daily Use', 'daily_use', 'Per Day', 'per_day'
    ],
    leadTime: [
      'LeadTime', 'lead_time', 'Lead Time', 'leadtime', 'Lead Days', 'lead_days',
      'Delivery Time', 'delivery_time', 'Lead', 'lead', 'LT', 'lt'
    ],
    safetyStock: [
      'SafetyStock', 'safety_stock', 'Safety Stock', 'safetystock', 'Safety', 'safety',
      'Buffer Stock', 'buffer_stock', 'Min Stock', 'min_stock', 'Reorder Point', 'reorder_point'
    ],
    category: [
      'Category', 'category', 'Type', 'type', 'Group', 'group', 'Classification', 'classification'
    ],
    supplier: [
      'Supplier', 'supplier', 'Vendor', 'vendor', 'Supplier Name', 'supplier_name',
      'Provider', 'provider', 'Source', 'source'
    ]
  };

  static async processFile(file: File): Promise<ProcessedData> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let data: any[] = [];
      let headers: string[] = [];

      if (fileExtension === 'csv') {
        const csvText = await this.readCSVFile(file);
        data = this.parseCSV(csvText);
        headers = data.length > 0 ? Object.keys(data[0]) : [];
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const workbook = XLSX.read(await file.arrayBuffer());
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
        headers = data.length > 0 ? Object.keys(data[0]) : [];
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      return {
        headers,
        rows: data,
        summary: {
          totalRows: data.length,
          validRows: data.filter(row => this.isValidRow(row)).length,
          errors: [],
          warnings: []
        }
      };
    } catch (error: any) {
      throw new Error(`Error processing file: ${error.message}`);
    }
  }

  private static async readCSVFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  }

  private static parseCSV(csvText: string): Record<string, any>[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => this.parseCSVLine(line));
    
    return rows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static isValidRow(row: Record<string, any>): boolean {
    return Object.keys(row).length > 0 && Object.values(row).some(val => val !== null && val !== '');
  }

  static detectColumns(headers: string[]): ColumnMapping {
    console.log('Column Detection - Input headers:', headers);
    
    const detected: ColumnMapping = {
      itemName: [],
      plannedQty: [],
      plannedRate: [],
      actualQty: [],
      actualRate: [],
      currentStock: [],
      dailyConsumption: [],
      leadTime: [],
      safetyStock: [],
      category: [],
      supplier: []
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      Object.entries(this.COLUMN_MAPPINGS).forEach(([key, possibleNames]) => {
        if (possibleNames.some((name: string) => name.toLowerCase() === normalizedHeader)) {
          detected[key as keyof ColumnMapping].push(header);
          console.log(`Detected column: ${key} -> ${header}`);
        }
      });
    });

    console.log('Column Detection - Result:', detected);
    return detected;
  }

  static mapDataToStandardFormat(
    rows: Record<string, any>[], 
    columnMapping: ColumnMapping
  ): Record<string, any>[] {
    console.log('Data Mapping - Input rows:', rows);
    console.log('Data Mapping - Column mapping:', columnMapping);
    
    const result = rows.map(row => {
      const mappedRow: Record<string, any> = {};
      
      // Map Item Name
      const itemNameColumn = this.findBestMatch(columnMapping.itemName, row);
      if (itemNameColumn) mappedRow.itemName = row[itemNameColumn];

      // Map Planned Quantity
      const plannedQtyColumn = this.findBestMatch(columnMapping.plannedQty, row);
      if (plannedQtyColumn) mappedRow.plannedQty = this.parseNumber(row[plannedQtyColumn]);

      // Map Planned Rate
      const plannedRateColumn = this.findBestMatch(columnMapping.plannedRate, row);
      if (plannedRateColumn) mappedRow.plannedRate = this.parseNumber(row[plannedRateColumn]);

      // Map Actual Quantity
      const actualQtyColumn = this.findBestMatch(columnMapping.actualQty, row);
      if (actualQtyColumn) mappedRow.actualQty = this.parseNumber(row[actualQtyColumn]);

      // Map Actual Rate
      const actualRateColumn = this.findBestMatch(columnMapping.actualRate, row);
      if (actualRateColumn) mappedRow.actualRate = this.parseNumber(row[actualRateColumn]);

      // Map Current Stock
      const currentStockColumn = this.findBestMatch(columnMapping.currentStock, row);
      if (currentStockColumn) mappedRow.currentStock = this.parseNumber(row[currentStockColumn]);

      // Map Daily Consumption
      const dailyConsumptionColumn = this.findBestMatch(columnMapping.dailyConsumption, row);
      if (dailyConsumptionColumn) mappedRow.dailyConsumption = this.parseNumber(row[dailyConsumptionColumn]);

      // Map Lead Time
      const leadTimeColumn = this.findBestMatch(columnMapping.leadTime, row);
      if (leadTimeColumn) mappedRow.leadTime = this.parseNumber(row[leadTimeColumn]);

      // Map Safety Stock
      const safetyStockColumn = this.findBestMatch(columnMapping.safetyStock, row);
      if (safetyStockColumn) mappedRow.safetyStock = this.parseNumber(row[safetyStockColumn]);

      // Map Category
      const categoryColumn = this.findBestMatch(columnMapping.category, row);
      if (categoryColumn) mappedRow.category = row[categoryColumn];

      // Map Supplier
      const supplierColumn = this.findBestMatch(columnMapping.supplier, row);
      if (supplierColumn) mappedRow.supplier = row[supplierColumn];

      console.log('Mapped row:', mappedRow);
      return mappedRow;
    });
    
    console.log('Data Mapping - Result:', result);
    return result;
  }

  private static findBestMatch(possibleColumns: string[], row: Record<string, any>): string | null {
    for (const column of possibleColumns) {
      if (row[column] !== undefined && row[column] !== null && row[column] !== '') {
        return column;
      }
    }
    return null;
  }

  private static parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  static calculateVariance(data: Record<string, any>[]): VarianceCalculation[] {
    console.log('Variance Calculation - Input data:', data);
    const result = data.map(row => {
      const plannedQty = row.plannedQty || 0;
      const plannedRate = row.plannedRate || 0;
      const actualQty = row.actualQty || 0;
      const actualRate = row.actualRate || 0;

      const plannedAmount = plannedQty * plannedRate;
      const actualAmount = actualQty * actualRate;
      const variance = actualAmount - plannedAmount;
      const variancePercentage = plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0;

      console.log('Row calculation:', {
        itemName: row.itemName,
        plannedQty,
        plannedRate,
        actualQty,
        actualRate,
        plannedAmount,
        actualAmount,
        variance,
        variancePercentage
      });

      return {
        itemName: row.itemName || 'Unknown',
        plannedQty,
        plannedRate,
        plannedAmount,
        actualQty,
        actualRate,
        actualAmount,
        variance,
        variancePercentage,
        status: (variance >= 0 ? 'loss' : 'profit') as 'loss' | 'profit'
      };
    });
    console.log('Variance Calculation - Result:', result);
    return result;
  }

  static calculateReorderPredictions(data: Record<string, any>[]): ReorderCalculation[] {
    console.log('=== REORDER CALCULATION DEBUG ===');
    console.log('Input data:', data);
    
    const result = data.map(row => {
      const currentStock = row.currentStock || 0;
      const dailyConsumption = row.dailyConsumption || 1;
      const leadTime = row.leadTime || 7;
      const safetyStock = row.safetyStock || 0;

      const reorderLevel = (dailyConsumption * leadTime) + safetyStock;
      const reorderQuantity = Math.max(0, reorderLevel - currentStock);
      const daysOfStock = dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : 0;
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

      console.log('Row calculation:', {
        itemName: row.itemName,
        currentStock,
        dailyConsumption,
        leadTime,
        safetyStock,
        reorderLevel,
        reorderQuantity,
        daysOfStock,
        needsReorder
      });

      return {
        itemName: row.itemName || 'Unknown',
        currentStock,
        dailyConsumption,
        leadTime,
        safetyStock,
        reorderLevel,
        reorderQuantity,
        urgencyLevel,
        daysOfStock,
        needsReorder
      };
    });
    
    console.log('Reorder Calculation - Result:', result);
    return result;
  }

  static generateDashboardSummary(
    varianceData: VarianceCalculation[],
    reorderData: ReorderCalculation[]
  ): DashboardSummary {
    const totalProducts = varianceData.length;
    
    const lowStockItems = reorderData.filter(item => 
      item.currentStock < (item.dailyConsumption * item.leadTime)
    ).length;

    const totalPlannedCost = varianceData.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalActualCost = varianceData.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActualCost - totalPlannedCost;
    const variancePercentage = totalPlannedCost > 0 ? (totalVariance / totalPlannedCost) * 100 : 0;
    
    const pendingReorders = reorderData.filter(item => item.needsReorder).length;

    return {
      totalProducts,
      lowStockItems,
      totalPlannedCost,
      totalActualCost,
      totalVariance,
      pendingReorders,
      variancePercentage
    };
  }

  static generateSampleCSV(): string {
    const headers = [
      'ItemName', 'PlannedQty', 'PlannedRate', 'ActualQty', 'ActualRate',
      'CurrentStock', 'DailyConsumption', 'LeadTime', 'SafetyStock', 'Category', 'Supplier'
    ];
    
    const sampleData = [
      ['Cotton Fabric - Premium', '1000', '250', '1100', '260', '500', '50', '7', '100', 'Raw Material', 'Textile Mills Ltd'],
      ['Polyester Thread', '5000', '45', '4800', '42', '800', '80', '5', '200', 'Raw Material', 'Thread Suppliers Co'],
      ['Chemical Dyes - Red', '200', '180', '190', '185', '150', '30', '10', '50', 'Raw Material', 'Chemical Supplies Inc']
    ];

    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  static exportToCSV(data: Record<string, any>[], filename: string): void {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    (a as HTMLAnchorElement).href = url;
    (a as HTMLAnchorElement).download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Test function to verify variance calculation
  static testVarianceCalculation(): void {
    console.log('=== TESTING VARIANCE CALCULATION ===');
    
    const testData = [
      {
        itemName: 'Test Item 1',
        plannedQty: 100,
        plannedRate: 10,
        actualQty: 120,
        actualRate: 8
      },
      {
        itemName: 'Test Item 2',
        plannedQty: 50,
        plannedRate: 20,
        actualQty: 45,
        actualRate: 22
      }
    ];
    
    const varianceResult = this.calculateVariance(testData);
    console.log('Test variance result:', varianceResult);
    
    // Expected results:
    // Item 1: Planned = 1000, Actual = 960, Variance = -40 (profit)
    // Item 2: Planned = 1000, Actual = 990, Variance = -10 (profit)
  }
}

// Add test function to window for debugging
if (typeof window !== 'undefined') {
  (window as any).testVariance = DataProcessor.testVarianceCalculation;
}

export default DataProcessor;
