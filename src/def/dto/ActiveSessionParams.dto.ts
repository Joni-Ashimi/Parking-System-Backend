export interface ActiveSessionsParams {
    page: number;
    pageSize: number;
    qs?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}