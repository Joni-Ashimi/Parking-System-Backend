import {Module} from '@nestjs/common';
import {ChatController} from "./chat.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../entity/User";
import {ChatService} from "./chat.service";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule {
}