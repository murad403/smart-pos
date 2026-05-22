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
    method: string;
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
    processedAt: string | null;
    readyAt: string | null;
    pickedUpAt: string | null;
    table: Table | null;
    assignedTo: any;
    orderItems: OrderItem[];
    payment: Payment[];
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
