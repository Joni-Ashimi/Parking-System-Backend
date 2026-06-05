export type AuthRequest = {
    keyId: string;
    keySecret: string;
};

export type RefreshTokenRequest = {
    refreshToken: string;
};