import {ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {IsNull, Repository} from 'typeorm';
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
    ) {
    }

    async create(dto: CreateVehicleDto) {
        const user = await this.userRepo.findOne({
            where: {id: dto.userId},
        });

        if (!user) throw new NotFoundException('User not found');

        const existing = await this.vehicleRepo.findOne({
            where: {plateNumber: dto.plateNumber},
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
        const where = userId ? {user: {id: userId}} : {};

        return this.vehicleRepo.find({
            where,
            relations: ['user'],
        });
    }

    async findMyVehicles(userId: string) {
        return this.vehicleRepo.find({
            where: {
                user: {id: userId},
            },
            withDeleted: false,
            relations: ['user'],
            order: {plateNumber: 'ASC', createdAt: "DESC"},
        });
    }

    async findOne(id: string) {
        const vehicle = await this.vehicleRepo.findOne({
            where: {id},
            relations: ['user'],
        });

        if (!vehicle) throw new NotFoundException('Vehicle not found');

        return vehicle;
    }

    async update(id: string, dto: UpdateVehicleDto) {
        const vehicle = await this.findOne(id);

        if (dto.plateNumber) {
            const exists = await this.vehicleRepo.findOne({
                where: {plateNumber: dto.plateNumber},
                withDeleted: true,
            });

            if (exists && exists.id !== id) {
                throw new ConflictException('Plate number already in use');
            }
        }

        Object.assign(vehicle, dto);

        return this.vehicleRepo.save(vehicle);
    }

    async setDefaultVehicle(userId: string, vehicleId: string) {
        const vehicle = await this.vehicleRepo.findOne({
            where: {
                id: vehicleId,
                user: { id: userId },
                deletedAt: IsNull(),
            },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        await this.vehicleRepo.update(
            { user: { id: userId }, isDefault: true },
            { isDefault: false }
        );

        vehicle.isDefault = true;
        return this.vehicleRepo.save(vehicle);
    }

    async getDefaultVehicle(userId: string) {
        const vehicle = await this.vehicleRepo.findOne({
            where: { user: { id: userId }, isDefault: true },
        });
        if (!vehicle) throw new NotFoundException('No default vehicle set');
        return vehicle;
    }

    async remove(id: string) {
        const result = await this.vehicleRepo.softDelete(id);

        if (result.affected === 0) {
            throw new NotFoundException('Vehicle not found');
        }

        return result;
    }
}