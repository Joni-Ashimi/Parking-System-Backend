import {DataSource, DeepPartial} from 'typeorm';
import * as bcrypt from 'bcrypt';

import {User} from '../entity/User';
import {UserType} from '../def/enums/UserType';
import {UserVerificationStatus} from '../def/enums/UserVerificationStatus';
import {Gender} from '../def/enums/UserGender';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
    const repo = dataSource.getRepository(User);

    const hashPassword = async (pw: string) => bcrypt.hash(pw, 10);

    const users: DeepPartial<User>[] = [
        {
            name: 'Alice Martini',
            phoneNumber: '+355690000001',
            gender: Gender.FEMALE,
            email: 'alice@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.ADMIN,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
            lastPasswordResetAt: new Date(),
            lastLoginAt: new Date(),
            tokenVersion: 0,
        },
        {
            name: 'Bob Tirana',
            phoneNumber: '+355690000002',
            gender: Gender.MALE,
            email: 'bob@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
            lastPasswordResetAt: undefined,
            lastLoginAt: new Date(),
            tokenVersion: 0,
        },
        {
            name: 'Clara Duka',
            phoneNumber: '+355690000003',
            gender: Gender.FEMALE,
            email: 'clara@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
            lastPasswordResetAt: undefined,
            lastLoginAt: undefined,
            tokenVersion: 0,
        },
        {
            name: 'Guest User',
            phoneNumber: '+355690000004',
            gender: Gender.MALE,
            email: 'denis@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.PENDING,
            profileImageUrl: null,
            lastPasswordResetAt: undefined,
            lastLoginAt: undefined,
            tokenVersion: 0,
        },
        {
            name: 'Era Leka',
            phoneNumber: '+355690000005',
            gender: Gender.FEMALE,
            email: 'era@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.REGISTERED,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
            lastPasswordResetAt: new Date(),
            lastLoginAt: new Date(),
            tokenVersion: 1,
        },
        {
            name: 'Fatos Hoxha',
            phoneNumber: '+355690000006',
            gender: Gender.MALE,
            email: 'fatos@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.BANNED,
            profileImageUrl: null,
            lastPasswordResetAt: undefined,
            lastLoginAt: undefined,
            tokenVersion: 0,
        },
        {
            name: 'Genta Lush',
            phoneNumber: '+355690000007',
            gender: Gender.MALE,
            email: 'genta@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.GUEST,
            verificationStatus: UserVerificationStatus.BANNED,
            profileImageUrl: null,
            lastPasswordResetAt: undefined,
            lastLoginAt: undefined,
            tokenVersion: 0,
        },
        {
            name: 'Hana Dervishi',
            phoneNumber: '+355690000008',
            gender: Gender.FEMALE,
            email: 'hana@example.com',
            password: await hashPassword('Password1!'),
            type: UserType.ADMIN,
            verificationStatus: UserVerificationStatus.VERIFIED,
            profileImageUrl: null,
            lastPasswordResetAt: new Date(),
            lastLoginAt: new Date(),
            tokenVersion: 0,
        },
    ];

    const saved = await repo.save(repo.create(users));

    console.log(`✅ Seeded ${saved.length} users.`);
    return saved;
}