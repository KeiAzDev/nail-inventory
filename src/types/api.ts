import { Type } from "@prisma/client";

export type ProductResponse = {
  product: {
    id: string;
    brand: string;
    productName: string;
    colorCode: string;
    colorName: string;
    type: Type;
    price: number;
    quantity: number;
    usageCount: number;
    lastUsed: Date | null;
    averageUsesPerMonth: number | null;
    estimatedDaysLeft: number | null;
    minStockAlert: number;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
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