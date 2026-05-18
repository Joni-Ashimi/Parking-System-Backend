import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from "../entity/User";
import {CloudinaryModule} from "../cloudinary/cloudinary.module";
import {Violation} from "../entity/Violation";

@Module({
    imports: [TypeOrmModule.forFeature([User, Violation]), CloudinaryModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {
}