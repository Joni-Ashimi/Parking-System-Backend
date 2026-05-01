import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { UserType } from '../def/enums/UserType';
import { UserVerificationStatus } from '../def/enums/UserVerificationStatus';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
    const repo = dataSource.getRepository(User);

    const hashPassword = async (pw: string) => bcrypt.hash(pw, 10);

    const users = [
        {
            name: 'Alice Martini',
            email: 'alice@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.ADMIN,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
        },
        {
            name: 'Bob Tirana',
            email: 'bob@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
        },
        {
            name: 'Clara Duka',
            email: 'clara@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
        },
        {
            name: 'Guest User',
            email: 'denis@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
        },
        {
            name: 'Era Leka',
            email: 'era@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
        },
        {
            name: 'Fatos Hoxha',
            email: 'fatos@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.BANNED,
            profileImageUrl: null,
        },
        {
            name: 'Genta Lush',
            email: 'genta@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.BANNED,
            profileImageUrl: null,
        },
        {
            name: 'Hana Dervishi',
            email: 'hana@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.ADMIN,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
        },
    ];

    const saved = await repo.save(repo.create(users))

    console.log(`✅ Seeded ${saved.length} users.`);
    return saved;
}