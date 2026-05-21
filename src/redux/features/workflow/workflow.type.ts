export interface ShiftUser {
    id: number;
    name: string | null;
    email: string;
}

export interface CashProof {
    id: string;
    shiftSessionId?: string;
    imageUrl: string;
    uploadedBy: ShiftUser;
    verifiedBy?: ShiftUser | null;
    verifiedAt?: string | null;
    createdAt: string;
}

export interface ShiftSession {
    id: string;
    userId: number;
    user: ShiftUser;
    type: "OPENING" | "CLOSING";
    openingCashAmount?: string | null;
    closingCashAmount?: string | null;
    closingDiscrepancy?: string | null;
    inventoryAccurate: boolean | null;
    promotionConfirmed: boolean | null;
    salesConfirmed: boolean | null;
    skippedInventory: boolean;
    skippedPromotion: boolean;
    skippedCash: boolean;
    cashProofs: CashProof[];
    createdAt: string;
}

export interface OpenShiftBody {
    userId: number;
}

export interface CloseShiftBody {
    openingCashAmount: number;
    closingCashAmount: number;
    inventoryAccurate: boolean;
    promotionConfirmed: boolean;
    salesConfirmed: boolean;
    skippedInventory: boolean;
    skippedPromotion: boolean;
    skippedCash: boolean;
}

export interface ShiftResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}
