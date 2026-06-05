export class TokenizeCardDto {
    csFlexCard: {
        numericCardType?: string;
        expirationYear?: string;
        expirationMonth?: string;
        jwe: string;
    };

    billingInfo?: {
        name?: string;
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        locality: string;
        postalCode?: string | null;
        countryCode: string;
        administrativeArea?: string;
        sameAsShipping?: boolean;
        email: string;
        phoneNumber?: string;
    };

    securityCode: string;
}