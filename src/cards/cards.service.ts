import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PokApiService } from '../external/pok-api.service';
import { UsersService } from '../users/users.service';
import {TokenizeCardDto} from "../def/enums/cards/createCard.type";
import {Card} from "../entity/Card";

@Injectable()
export class CardsService {
    private baseUrl: string | null = null;
    constructor(
        @InjectRepository(Card)
        private cardsRepository: Repository<Card>,

        private readonly configService: ConfigService,

        @Inject()
        private usersService: UsersService,
        private readonly pokApiService: PokApiService,
    ) {
        this.baseUrl = this.configService.get<string>('POK_STAGE_BASE_URL') ?? '';
    }

    async tokenizeGuestCard(userId: string, dto: TokenizeCardDto) {
        const tokenizedGuestCard = await this.pokApiService.tokenizeGuestCard(dto);
        const user = await this.usersService.getUser(userId);
        await this.cardsRepository.save({
            pokCardId: tokenizedGuestCard.id,
            hiddenNumber: tokenizedGuestCard.hiddenNumber,
            isDefault: false,
            user,
        });
    }

    async setupTokenized3DS(
        mySavedCardId: string,
        sdkOrderId: string,
        userId: string,
    ) {
        const card = await this.cardsRepository.findOne({
            where: { id: mySavedCardId, user: { id: userId } },
        });
        if (!card)
            throw new NotFoundException(`Card with id ${mySavedCardId} not found!`);
        const creditDebitCardId = card.pokCardId;
        const data = await this.pokApiService.setupTokenized3DS(
            creditDebitCardId,
            sdkOrderId,
        );
        return data;
    }

    // async checkCardExistence(
    //   cardId: string,
    //   clientId: string,
    // ): Promise<boolean> {
    //   const card = await this.cardsRepository.findOne({
    //     where: { pokCardId : cardId, user: { id: clientId } },
    //   });
    //   if (!card) {
    //     throw new NotFoundException(`You do not own any card with this number!`);
    //   }
    //   return true;
    // }

    async useDefaultCard(userId: string) {
        return this.cardsRepository.findOne({
            where: { user: { id: userId }, isDefault: true },
        });
    }

    async setDefaultCard(cardId: string, userId: string) {
        const card = await this.cardsRepository.findOne({
            where: { id: cardId, user: { id: userId } },
        });
        if (!card) throw new NotFoundException(`Card with id ${cardId} not found!`);
        await this.cardsRepository.update(
            { user: { id: userId }, isDefault: true },
            { isDefault: false },
        );
        card.isDefault = true;
        return this.cardsRepository.save(card);
    }

    // {{baseUrl}}/credit-debit-cards/{{creditDebitCardId}}/check-3ds-enrollment
    async check3dsEnrollment(
        userId: string,
        payload: {
            creditDebitCardId: string;
            sdkOrderId: string;
            payerAuthSetupReferenceId: string;
            amount: number;
            currency: string;
        },
    ) {
        const card = await this.cardsRepository.findOne({
            where: { pokCardId: payload.creditDebitCardId, user: { id: userId } },
        });
        if (!card)
            throw new NotFoundException(
                `Card with id ${payload.creditDebitCardId} not found!`,
            );
        const response = await this.pokApiService.check3dsEnrollment(
            payload.creditDebitCardId,
            {
                csAuthentication: {
                    amount: payload.amount,
                    currency: payload.currency,
                },
                sdkOrderId: payload.sdkOrderId,
                payerAuthSetupReferenceId: payload.payerAuthSetupReferenceId,
            },
        );
        return response; // means return payerAuthenticationEnrollment
    }

    async confirmPayment(
        userId: string,
        payload: {
            sdkOrderId: string;
            creditCardId: string;
            consumerAuthenticationInformation: any;
        },
    ) {
        const card = await this.cardsRepository.findOne({
            where: { pokCardId: payload.creditCardId, user: { id: userId } },
        });
        if (!card)
            throw new NotFoundException(
                `Card with id ${payload.creditCardId} not found!`,
            );
        const confirmedOrder = await this.pokApiService.guestConfirm(
            payload.sdkOrderId,
            payload.creditCardId,
            payload.consumerAuthenticationInformation,
        );
        return confirmedOrder; // means return sdkOrder
    }

    async listUserCards(userId: string) {
        return this.cardsRepository.find({
            where: { user: { id: userId } },
            order: { isDefault: 'DESC' },
        });
    }

    async getGuestCardsInfo(data: { cardIds: string[] }) {
        return this.pokApiService.getGuestCardsInformation(data.cardIds);
    }

    async saveCard(userId: string, cardPayload: any) {
        console.log('Saving card for user', userId, cardPayload);
        const user = await this.usersService.getUser(userId);
        const newCard = this.cardsRepository.create({
            pokCardId: cardPayload.pokCardId,
            hiddenNumber: cardPayload.hiddenNumber,
            isDefault: false,
            user: user,
        });

        return await this.cardsRepository.save(newCard);
    }
}