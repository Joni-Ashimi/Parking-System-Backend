import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Vehicle} from "../entity/Vehicle";
import {User} from "../entity/User";
import {CreateVehicleDto} from "../def/dto/vehicles/CreateVehicleDto";
import {UpdateVehicleDto} from "../def/dto/vehicles/UpdateVehicleDto";


@Injectable()
export class VehicleService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepo: Repository<Vehicle>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async create(dto: CreateVehicleDto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });

        if (!user) throw new NotFoundException('User not found');

        const existing = await this.vehicleRepo.findOne({
            where: { plateNumber: dto.plateNumber },
        });

        if (existing) {
            throw new ConflictException('Vehicle with this plate already exists');
        }

        const vehicle = this.vehicleRepo.create({
            ...dto,
            user,
        });

        return this.vehicleRepo.save(vehicle);
    }

    async findAll(userId?: string) {
        const where = userId ? { user: { id: userId } } : {};

        return this.vehicleRepo.find({
            where,
            relations: ['user'],
        });
    }

    async findOne(id: string) {
        const vehicle = await this.vehicleRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!vehicle) throw new NotFoundException('Vehicle not found');

        return vehicle;
    }

    async update(id: string, dto: UpdateVehicleDto) {
        const vehicle = await this.findOne(id);

        if (dto.plateNumber) {
            const exists = await this.vehicleRepo.findOne({
                where: { plateNumber: dto.plateNumber },
            });

            if (exists && exists.id !== id) {
                throw new ConflictException('Plate number already in use');
            }
        }

        Object.assign(vehicle, dto);

        return this.vehicleRepo.save(vehicle);
    }

    async remove(id: string) {
        const vehicle = await this.findOne(id);
        return this.vehicleRepo.remove(vehicle);
    }
}