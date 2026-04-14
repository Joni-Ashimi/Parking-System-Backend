import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entity/Vehicle';
import { UsersService } from '../users/users.service';
import { CreateVehicleDto } from '../def/types/create-vehicle.dto';
import { UpdateVehicleDto } from '../def/types/update-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,

        // We inject UsersService to verify the user exists before
        // assigning a vehicle to them
        private usersService: UsersService,
    ) {}

    async create(dto: CreateVehicleDto, userId: string): Promise<Vehicle> {
        // Make sure the user actually exists — throws NotFoundException if not
        const user = await this.usersService.getUser(userId);

        //  Check if that plate is already registered
        //    Two users can't register the same physical car
        const existing = await this.vehiclesRepository.findOne({
            where: { plateNumber: dto.plateNumber },
        });
        if (existing) {
            throw new ConflictException(
                `Plate number "${dto.plateNumber}" is already registered`,
            );
        }
             
        const vehicle = this.vehiclesRepository.create({
            plateNumber: dto.plateNumber,
            type: dto.type,
            user, // TypeORM reads the user.id from this and stores the FK
        });

        
        return this.vehiclesRepository.save(vehicle);
    }

    async findById(id: string, relations: string[] = []): Promise<Vehicle> {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations, //  ['user'] will join and return the full user object
        });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle with id "${id}" not found`);
        }
        return vehicle;
    }

    // Find by plate — used during parking session entry
    // Returns null if not found (doesn't throw) so the caller can decide what to do
    async findByPlate(plateNumber: string): Promise<Vehicle | null> {
        return this.vehiclesRepository.findOne({
            where: { plateNumber },
            relations: ['user'], // we usually need to know who owns it
        });
    }

     // Get all vehicles belonging to one user
    // Used for "my vehicles" screens or admin views
    async findAllByUser(userId: string): Promise<Vehicle[]> {
        // Make sure the user exists first
        await this.usersService.getUser(userId);

        return this.vehiclesRepository.find({
            where: {
                user: { id: userId }, // filter by nested relation fields
            },
        });
    }
    async update(id: string, userId: string, dto: UpdateVehicleDto): Promise<Vehicle> {
        //  Fetch the vehicle (throws if missing)
        //  Verify it belongs to the user making the request
        const vehicle = await this.validateOwnership(id, userId);

        // If they're changing the plate, make sure the new plate isn't taken
        if (dto.plateNumber && dto.plateNumber !== vehicle.plateNumber) {
            const conflict = await this.vehiclesRepository.findOne({
                where: { plateNumber: dto.plateNumber },
            });
            if (conflict) {
                throw new ConflictException(
                    `Plate number "${dto.plateNumber}" is already registered`,
                );
            }
        }

        // .merge() copies the DTO fields onto the existing entity object in memory
        const updated = this.vehiclesRepository.merge(vehicle, dto);
        return this.vehiclesRepository.save(updated);
    }

    async validateOwnership(vehicleId: string, userId: string): Promise<Vehicle> {
        // Load vehicle AND its user relation so we can compare IDs
        const vehicle = await this.findById(vehicleId, ['user']);

        if (vehicle.user.id !== userId) {
            // 403 Forbidden — the vehicle exists, but you don't own it
            throw new ForbiddenException(
                'You do not have permission to access this vehicle',
            );
        }

        return vehicle;
    }

}