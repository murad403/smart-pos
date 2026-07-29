export interface PriceAdjustment {
  id: number;
  level: "TAX" | "SERVICE_CHARGE" | string;
  percentage: string | null;
  fixedAmount: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllPriceAdjustmentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pagination: Pagination;
  data: PriceAdjustment[];
}

export interface GetPriceAdjustmentDetailsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PriceAdjustment;
}

export interface CreatePriceAdjustmentBody {
  level: "TAX" | "SERVICE_CHARGE" | string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  percentage?: number | null;
  fixedAmount?: number | null;
}

export interface UpdatePriceAdjustmentBody {
  level?: "TAX" | "SERVICE_CHARGE" | string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  percentage?: number | null;
  fixedAmount?: number | null;
}

export interface AdditionalPricingAdjustment {
  id: number;
  level: string;
  percentage: string | null;
  fixedAmount: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllAdditionalPricingAdjustmentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pagination: Pagination;
  data: AdditionalPricingAdjustment[];
}

export interface GetAdditionalPricingAdjustmentDetailsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdditionalPricingAdjustment;
}

export interface CreateAdditionalPricingAdjustmentBody {
  level: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  percentage?: number | null;
  fixedAmount?: number | null;
}

export interface UpdateAdditionalPricingAdjustmentBody {
  level?: string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  percentage?: number | null;
  fixedAmount?: number | null;
}

