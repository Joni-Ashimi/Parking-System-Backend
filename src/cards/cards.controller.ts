import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {CardsService} from './cards.service';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {CurrentLoggedInUser} from "../decorator/current-user.decorator";
import {TokenizeCardDto} from "../def/enums/cards/createCard.type";

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
    constructor(private readonly cardsService: CardsService) {
    }

    // @Post('/check-card-existence')
    // checkCardExistence(
    //   @Body() cardNumber: string,
    //   @CurrentLoggedInUser('id') clientId: string,
    // ) {
    //   return this.cardsService.checkCardExistence(cardNumber, clientId);
    // }

    @Post('save')
    @UseGuards(JwtAuthGuard)
    async saveCard(
        @Body() body: { cardPayload: any },
        @CurrentLoggedInUser('id') userId: string
    ) {
        console.log('Received card payload:', body);
        return await this.cardsService.saveCard(userId, body.cardPayload);
    }

    @Post('/use-default')
    useDefaultCard(@CurrentLoggedInUser('id') clientId: string) {
        return this.cardsService.useDefaultCard(clientId);
    }

    @Post('/set-default')
    setDefaultCard(
        @CurrentLoggedInUser('id') clientId: string,
        @Body() payload: { cardId: string },
    ) {
        return this.cardsService.setDefaultCard(payload.cardId, clientId);
    }

    @Post('/tokenize-guest-card')
    tokenizeGuestCard(
        @CurrentLoggedInUser('id') userId: string,
        @Body() dto: TokenizeCardDto,
    ) {
        return this.cardsService.tokenizeGuestCard(userId, dto);
    }

    @Post('/setup-tokenized-3DS')
    setupTokenized3DS(
        @Body() payload: { mySavedCardId: string; sdkOrderId: string },
        @CurrentLoggedInUser('id') userId: string,
    ) {
        return this.cardsService.setupTokenized3DS(
            payload.mySavedCardId,
            payload.sdkOrderId,
            userId,
        );
    }

    @Post('/check-3ds-enrollment')
    check3dsEnrollment(
        @CurrentLoggedInUser('id') userId: string,
        @Body()
        payload: {
            creditDebitCardId: string;
            sdkOrderId: string;
            payerAuthSetupReferenceId: string;
            amount: number;
            currency: string;
        },
    ) {
        return this.cardsService.check3dsEnrollment(userId, payload);
    }

    @Post('/confirm-payment')
    confirmPayment(
        @CurrentLoggedInUser('id') userId: string,
        @Body()
        payload: {
            sdkOrderId: string;
            creditCardId: string;
            consumerAuthenticationInformation: any;
        },
    ) {
        return this.cardsService.confirmPayment(userId, payload);
    }

    @Post('/get-guest-card-info')
    getGuestCardsInformation(@Body() body: { cardIds: string[] }) {
        return this.cardsService.getGuestCardsInfo(body);
    }

    @Get('/list-cards')
    listUserCards(@CurrentLoggedInUser('id') userId: string) {
        return this.cardsService.listUserCards(userId);
    }
}