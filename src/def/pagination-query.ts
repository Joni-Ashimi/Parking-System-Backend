import {ViolationStatus} from "./enums/ViolationStatus";

export type PaginationQuery = {
    qs?: string;
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
};

export interface FindTransactionsOptions extends PaginationQuery {
    status?: any;
    bidderId?: string;
    merchantId?: string;
    relations?: string[];
}

export class ViolationsQuery {
    page?: number;
    pageSize?: number;
    qs?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    status?: ViolationStatus;
    type?: string;
}
