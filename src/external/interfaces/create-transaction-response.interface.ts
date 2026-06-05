import {Item} from "./create-item.interface";

export interface SdkOrderSelf {
    confirmUrl: string;
    confirmDeeplink: string;
}

export interface Commissions {
    netAmount: number;
    totalCommissionAmount: number;
    grossAmount: number;
}

export interface Merchant {
    id: string;
}

export interface SdkOrder {
    id: string;
    amount: number;
    currencyCode: string;

    item: Item;

    originalCurrencyCode: string;
    originalAmount: number;
    appliedExchangeRate: number;

    shippingCost: number;
    finalAmount: number;

    createdAt: string;
    expiresAt: string;

    redirectUrl: string | null;
    failRedirectUrl: string | null;

    __self: SdkOrderSelf;

    description: string | null;
    isCompleted: boolean;
    isRefunded: boolean;
    merchantCustomReference: string | null;
    selectedBranchId: string | null;
    transactionId: string | null;

    commissions?: Commissions;
    merchant?: Merchant;
}

export interface CreateTransactionResponseInterface {
    sdkOrder: SdkOrder;
}

import { PokApiResponse } from './auth-response.interface';
export type TransactionResponse = PokApiResponse<CreateTransactionResponseInterface>;