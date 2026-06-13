import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateViolationDto} from "../def/dto/violation/CreateViolationDto";
import {UpdateViolationDto} from "../def/dto/violation/UpdateViolationDto";
import {Violation} from "../entity/Violation";
import {ViolationStatus} from "../def/enums/ViolationStatus";
import {ViolationType} from "../def/enums/ViolationType";
import {ViolationsQuery} from "../def/pagination-query";

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

    async findAll(query: ViolationsQuery = {}) {
        const {
            page = 1,
            pageSize = 10,
            qs,
            sortBy = "createdAt",
            sortOrder = "DESC",
            status,
            type,
        } = query;

        const qb = this.violationRepository
            .createQueryBuilder("violation")
            .leftJoinAndSelect("violation.user", "user")
            .where("violation.deletedAt IS NULL");

        if (status) {
            const statusValue = String(status).toLowerCase();
            qb.andWhere("violation.status = :status", { status: statusValue });
        }

        if (type) {
            const types = type.split(",").map((t) => t.trim()).filter(Boolean);
            if (types.length === 1) {
                qb.andWhere("violation.type = :type", {type: types[0]});
            } else if (types.length > 1) {
                qb.andWhere("violation.type IN (:...types)", {types});
            }
        }

        if (qs) {
            qb.andWhere(
                "(LOWER(user.name) LIKE :qs OR LOWER(user.email) LIKE :qs)",
                {qs: `%${qs.toLowerCase()}%`},
            );
        }

        const allowedSortColumns: Record<string, string> = {
            createdAt: "violation.createdAt",
            updatedAt: "violation.updatedAt",
            type: "violation.type",
            status: "violation.status",
        };
        const orderColumn = allowedSortColumns[sortBy] ?? "violation.createdAt";
        qb.orderBy(orderColumn, sortOrder);

        qb.skip((page - 1) * pageSize).take(pageSize);

        const [data, total] = await qb.getManyAndCount();

        return {data, total, page, pageSize};
    }

    async getStats() {
        const qb = this.violationRepository
            .createQueryBuilder("violation")
            .where("violation.deletedAt IS NULL");

        const [total, pending, resolved, overstay, fraud] = await Promise.all([
            qb.getCount(),
            this.violationRepository.count({where: {status: ViolationStatus.PENDING}}),
            this.violationRepository.count({where: {status: ViolationStatus.RESOLVED}}),
            this.violationRepository.count({where: {type: ViolationType.OVERSTAY}}),
            this.violationRepository.count({where: {type: ViolationType.FRAUD}}),
        ]);

        return {total, pending, resolved, overstay, fraud};
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