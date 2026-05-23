import { Order, Pagination } from "../order/order.type";

export type ProductionOrderStatus = "PENDING_PROCESSING" | "PROCESSING" | "READY" | "PICKED_UP" | "CANCELLED";

export type ProductionSource = "QR_TABLE" | "TOUCHSCREEN" | "STAFF" | "ADMIN";

export interface ProductionOrder extends Omit<Order, "status" | "source"> {
	status: ProductionOrderStatus;
	source: ProductionSource;
}

export interface GetAllProductionsParams {
	page?: number;
	limit?: number;
	source?: ProductionSource;
}

export interface GetAllProductionsResponse {
	success: boolean;
	statusCode: number;
	message: string;
	pagination: Pagination;
	data: ProductionOrder[];
}
