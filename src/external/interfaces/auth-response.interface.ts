export interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
    expiresAt: string;
}

export interface PokApiResponse<T> {
    statusCode: number;
    serverStatusCode: number;
    data: T;
    message: string;
    errors: any[];
}

export type AuthResponse = PokApiResponse<TokenData>;