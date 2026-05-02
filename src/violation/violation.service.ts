import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateViolationDto} from "../def/dto/violation/CreateViolationDto";
import {UpdateViolationDto} from "../def/dto/violation/UpdateViolationDto";
import {Violation} from "../entity/Violation";

@Injectable()
export class ViolationsService {
    constructor(
        @InjectRepository(Violation)
        private violationRepository: Repository<Violation>,
    ) {
    }

    async create(dto: CreateViolationDto) {
        const violation = this.violationRepository.create(dto);
        return this.violationRepository.save(violation);
    }

    async findAll() {
        return this.violationRepository.find({order: {createdAt: "DESC"}});
    }

    async findOne(id: string) {
        const violation = await this.violationRepository.findOneBy({id});
        if (!violation) throw new NotFoundException("Violation not found");
        return violation;
    }

    async updateStatus(id: string, dto: UpdateViolationDto) {
        const violation = await this.findOne(id);
        if (dto.status !== undefined) {
            violation.status = dto.status;
        }
        return this.violationRepository.save(violation);
    }

    async remove(id: string) {
        const violation = await this.findOne(id);
        return this.violationRepository.remove(violation);
    }
}