export interface Menu {
    id: number;
    slug: string;
    name: string;
    coverImageUrl: string | null;
    isVisible: boolean;
    visibleOnQrTable: boolean;
    visibleOnTouchscreen: boolean;
    visibleOnService: boolean;
    visibleOnAdmin: boolean;
    orientationKiosk: string;
    orientationService: string;
    sortOrder: number;
}

export interface GetAllMenuResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: Menu[];
}

export interface AddMenuBody {
    name: string;
}

export interface AddMenuResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Menu;
}

export interface UpdateMenuBody {
    name: string;
}

export interface UpdateMenuResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Menu;
}

export interface DeleteMenuResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Menu;
}

// Section types
export type SectionLayoutType =
  | "SINGLE"
  | "DOUBLE"
  | "TRIPLE"
  | "QUADRUPLE"
  | "LIST_WITH_IMAGE"
  | "LIST_NO_IMAGE";

export interface Section {
    id: number;
    slug: string;
    name: string;
    layout: SectionLayoutType;
    sortOrder: number;
    menuId: number;
}

export interface GetAllSectionResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Section[];
}

export interface AddSectionBody {
    name: string;
    layout: SectionLayoutType;
    menuId: number;
}

export interface AddSectionResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: Section;
}
