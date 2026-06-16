import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from "../entity/User";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async getUserContextString(userId: string): Promise<string> {
        try {
            if (!userId) return 'No authenticated user profile context available.';

            const user = await this.userRepository.findOne({
                where: {id: userId},
                relations: ['vehicles'],
            });

            if (!user) return 'User account context was provided but not found in the database.';
            const vehicleList = user.vehicles?.length > 0
                ? user.vehicles.map(v => `- License Plate: ${v.plateNumber || 'N/A'}, Model: ${v.type || 'Unknown'}`).join('\n')
                : 'No vehicles registered to this profile.';

            return `
[AUTHENTICATED USER CONTEXT PROFILE]
- User ID: ${user.id}
- Full Name: ${user.name}
- Email: ${user.email || 'N/A'}
- Phone Number: ${user.phoneNumber}
- Account Type: ${user.type}
- Verification Status: ${user.verificationStatus}
- Account Created At: ${user.createdAt}

[REGISTERED VEHICLES]:
${vehicleList}
`;
        } catch (error) {
            console.error('Error compiling database context for chat:', error);
            return 'Database error occurred while fetching user profile variables.';
        }
    }
}