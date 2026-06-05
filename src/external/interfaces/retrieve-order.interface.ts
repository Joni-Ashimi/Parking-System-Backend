import {Item} from "./create-item.interface";

export interface RetrieveOrderResponse {
    statusCode: number;
    serverStatusCode: number;
    data: RetrieveOrderData;
    message: string;
    errors: any[];
}

export interface RetrieveOrderData {
    sdkOrder: SdkOrder;
    commissions: Commissions;
}

export interface SelfLinks {
    confirmUrl: string;
    confirmDeeplink: string;
}

export interface Commissions {
    netAmount: number;
    totalCommissionNumber: number;
    grossAmount: number;
}

export interface Merchant {
    merchantId: string;
}

export interface SdkOrder {
    id: string;
    amount: number;
    currencyCode: string;
    originalCurrencyCode: string;
    originalAmount: number;
    appliedExchangeRate: number;
    items: Item; // got only one item
    shippingCose: number;
    finalAmount: number;
    createdAt: Date;
    expiresAt: Date;
    redirectUrl: string;
    failRedirectUrl: string;
    paymentMethod: string;
    cardType: string;
    merchant: Merchant;
    _self: SelfLinks;
    description: string;
    isCompleted: boolean;
    isRefunded: boolean;
    merchantCustomReference?: string;
    transactionId: string;
    sdkOrderPaymentFlows: [];
    issuer: string;
}