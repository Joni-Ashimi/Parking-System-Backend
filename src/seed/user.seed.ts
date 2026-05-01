import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { UserType } from '../def/enums/UserType';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
    const repo = dataSource.getRepository(User);

    const hash = (pw: string) => bcrypt.hash(pw, 10);

    const users = repo.create([
        {
            name: 'Alice Martini',
            email: 'alice@example.com',
            password: await hash('Password1!'),
            type: UserType.ADMIN,
            isBanned: false,
        },
        {
            name: 'Bob Tirana',
            email: 'bob@example.com',
            password: await hash('Password1!'),
            type: UserType.REGISTERED,
            isBanned: false,
        },
        {
            name: 'Clara Duka',
            email: 'clara@example.com',
            password: await hash('Password1!'),
            type: UserType.REGISTERED,
            isBanned: false,
        },
        {
            name: 'Guest User',
            email: 'denis@example.com',
            password: await hash('Password1!'),
            type: UserType.GUEST,
            isBanned: false,
        },
        {
            name: 'Era Leka',
            email: 'era@example.com',
            password: await hash('Password1!'),
            type: UserType.REGISTERED,
            isBanned: false,
        },
        {
            name: 'Guest2',
            email: 'fatos@example.com',
            password: await hash('Password1!'),
            type: UserType.GUEST,
            isBanned: true,
        },
        {
            name: 'Guest',
            email: 'genta@example.com',
            password: await hash('Password1!'),
            type: UserType.GUEST,
            isBanned: false,
        },
        {
            name: 'Admin',
            email: 'hana@example.com',
            password: await hash('Password1!'),
            type: UserType.ADMIN,
            isBanned: false,
        },
    ]);

    const saved = await repo.save(users);
    console.log(`✅ Seeded ${saved.length} users.`);
    return saved;
}