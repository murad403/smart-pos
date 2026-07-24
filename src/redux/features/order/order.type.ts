/* eslint-disable @typescript-eslint/no-explicit-any */
export type PaymentMethod = "CASH" | "TRANSFER" | "OTHER";

export interface Table {
    id: number;
    slug: string;
    tableNumber: string;
    notes: string;
    isActive: boolean;
}

export interface PacketChoice {
    choice: string;
    section: string;
    quantity: number;
    productionStationId?: number | null;
}

export interface ProductionStation {
    id: number;
    slug: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
}

export interface OrderItem {
    id: string;
    orderId: number;
    itemId: number | null;
    productionStationId: number | null;
    itemName: string;
    unitPrice: string;
    promoPrice: string | null;
    quantity: number;
    status: string;
    packetChoices: PacketChoice[] | null;
    isCancelled: boolean;
    cancelledAt: string | null;
    cancelReviewedBy: string | null;
    processedAt: string | null;
    readyAt: string | null;
    pickedUpAt: string | null;
    item: any;
    productionStation?: ProductionStation;
}

export interface Payment {
    id: number;
    slug: string;
    orderId: number;
    method: PaymentMethod;
    status: string;
    subtotal: string;
    chargesTotal: string;
    totalAmount: string;
    cashReceived: string | null;
    changeAmount: string | null;
    proofImages: string[];
    appliedCharges: any;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    order?: Pick<Order, "id" | "slug" | "source" | "type" | "status" | "customerName" | "tableId" | "assignedToId" | "subtotal" | "totalAmount" | "createdAt" | "updatedAt">;
}

export interface Order {
    id: number;
    slug: string;
    source: "ADMIN" | "QR_TABLE" | "TOUCHSCREEN" | "STAFF";
    type: string;
    status: "PENDING" | "PENDING_PROCESSING" | "PROCESSING" | "READY" | "PICKED_UP" | "CANCELLED";
    customerName: string;
    tableId: number | null;
    assignedToId: number | null;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    processedAt: string | null;
    readyAt: string | null;
    pickedUpAt: string | null;
    table: Table | null;
    assignedTo: any;
    orderItems: OrderItem[];
    payment: Payment[];
    pricingAdjustments?: PricingAdjustment[];
}

export interface PricingAdjustment {
    id: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    level: string;
    percentage: number | null;
    fixedAmount: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetAllOrdersResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: Pagination;
    data: Order[];
}

export interface GetOrderDetailsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Order;
}

export interface SubmitOrderPaymentRequest {
    orderId: number;
    method: PaymentMethod;
    cashierId: number;
    cashReceived: number;
    proofImages?: File[];
    changeAmount?: number;
}

export interface SubmitOrderPaymentResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Payment;
}

export interface UpdateOrderPricingAdjustmentItem {
    id?: number;
    level: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    percentage?: number | null;
    fixedAmount?: number | null;
}

export interface UpdateOrderPricingAdjustmentsRequest {
    pricingAdjustments: UpdateOrderPricingAdjustmentItem[];
}

