export type PaginationQuery = {
    qs?: string;
    page: number;
    pageSize: number;
};

export interface FindAuctionsOptions extends PaginationQuery {
    status?: any;
    sellerId?: string;
    bidderId?: string;
    relations?: string[];
}

export interface FindTransactionsOptions extends PaginationQuery {
    status?: any;
    bidderId?: string;
    merchantId?: string;
    relations?: string[];
}