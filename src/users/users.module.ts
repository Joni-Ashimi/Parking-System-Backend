import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from "../entity/User";
import {CloudinaryModule} from "../cloudinary/cloudinary.module";
import {Violation} from "../entity/Violation";
import {EmailModule} from "../email/email.module";

@Module({
    imports: [TypeOrmModule.forFeature([User, Violation]), CloudinaryModule, EmailModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {
}