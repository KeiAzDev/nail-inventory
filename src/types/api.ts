export type ProductResponse = {
  product: {
    id: string;
    brand: string;
    productName: string;
    colorCode: string;
    colorName: string;
    type: 'POLISH' | 'GEL';
    price: number;
    quantity: number;
    usageCount: number;
    lastUsed?: Date;
    averageUsesPerMonth?: number;
    estimatedDaysLeft?: number;
    minStockAlert: number;
  };
  alertStatus: {
    isLowStock: boolean;
    estimatedDaysLeft: number;
    lowStockThreshold: number;
  };
};

export type ProductUsageResponse = {
  usage: {
    id: string;
    date: string;
    note?: string;
  };
};

export type ApiError = {
  error: string;
};