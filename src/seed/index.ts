import { AppDataSource } from '../datasource';
import { DataSource } from 'typeorm';
import { Card } from '../entity/Card';
import { Vehicle } from 'src/entity/Vehicle';
import { User } from '../entity/User';
import { SpotCategory } from 'src/entity/SpotCategory';
import { PricingRule } from '../entity/PricingRule';
import { ParkingLot } from 'src/entity/ParkingLot';
import { Feedback } from 'src/entity/Feedback';
import { PasswordReset } from 'src/entity/PasswordReset';
import { ParkingSpot } from '../entity/ParkingSpot';
import { Violation } from '../entity/Violation';
import { ParkingSession } from 'src/entity/ParkingSession';
import { UserType } from '../def/enums/UserType';
import { Gender } from '../def/enums/UserGender';
import { UserVerificationStatus } from '../def/enums/UserVerificationStatus';
import { ParkingSpotTypeCode } from '../def/enums/ParkingSpotType';
import { VehicleType } from '../def/enums/VehicleType';
import { ParkingSpotStatus } from '../def/enums/ParkingSpotStatus';
import { ViolationType } from '../def/enums/ViolationType';
import { ViolationStatus } from '../def/enums/ViolationStatus';
import { ParkingSessionStatus } from '../def/enums/ParkingSessionStatus';
import { TransactionStatus } from '../def/enums/TransactionStatus';
import { Transaction } from '../entity/Transaction';

async function resetDatabase(dataSource: DataSource) {
  console.log('🧨 Clearing database...');

  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repo = dataSource.getRepository(entity.name);
    await repo.query(
      `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
    );
  }

  console.log('✅ Database cleared');
}

async function seedAll(dataSource: DataSource) {
  console.log('\n🌱 SEED START\n');

  const userRepository = dataSource.getRepository(User);
  const vehicleRepository = dataSource.getRepository(Vehicle);
  const cardRepository = dataSource.getRepository(Card);
  const spotCategoryRepository = dataSource.getRepository(SpotCategory);
  const pricingRuleRepository = dataSource.getRepository(PricingRule);
  const parkingLotRepository = dataSource.getRepository(ParkingLot);
  const parkingSpotRepository = dataSource.getRepository(ParkingSpot);
  const passwordResetRepository = dataSource.getRepository(PasswordReset);
  const feedbackRepository = dataSource.getRepository(Feedback);
  const violationRepository = dataSource.getRepository(Violation);
  const parkingSessionRepository = dataSource.getRepository(ParkingSession);
  const transactionRepository = dataSource.getRepository(Transaction);

  // 1. Independent Parent Entities (Level 0)
  const users = await userRepository.save([
    userRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174001',
      type: UserType.GUEST,
      name: 'John Doe',
      phoneNumber: '+355681111111',
      gender: Gender.MALE,
      email: 'john.doe@example.com',
      password: 'hashed_password_1',
      verificationStatus: UserVerificationStatus.VERIFIED,
    }),
    userRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174002',
      type: UserType.GUEST,
      name: 'Jane Smith',
      phoneNumber: '+355682222222',
      gender: Gender.FEMALE,
      email: 'jane.smith@example.com',
      password: 'hashed_password_2',
      verificationStatus: UserVerificationStatus.VERIFIED,
    }),
    userRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174003',
      type: UserType.GUEST,
      name: 'Alex Johnson',
      phoneNumber: '+355683333333',
      gender: Gender.MALE,
      email: 'alex.johnson@example.com',
      password: 'hashed_password_3',
      verificationStatus: UserVerificationStatus.PENDING,
    }),
  ]);

  const categories = await spotCategoryRepository.save([
    spotCategoryRepository.create({
      id: '223e4567-e89b-12d3-a456-426614174001',
      code: ParkingSpotTypeCode.STANDARD,
      name: 'Standard Spot',
      size: 'Medium',
      baseHourlyRate: 100.0,
      baseDailyRate: 800.0,
    }),
    spotCategoryRepository.create({
      id: '223e4567-e89b-12d3-a456-426614174007',
      code: ParkingSpotTypeCode.ACCESSIBLE,
      name: 'VIP Spot',
      size: 'Large',
      baseHourlyRate: 250.0,
      baseDailyRate: 2000.0,
    }),
  ]);

  const lots = await parkingLotRepository.save([
    parkingLotRepository.create({
      id: '323e4567-e89b-12d3-a456-426614174001',
      name: 'Central Parking',
      location: 'Downtown Tirana',
      capacity: 50,
    }),
    parkingLotRepository.create({
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Mall Underground',
      location: 'Ring Center',
      capacity: 100,
    }),
  ]);

  // 2. First-Level Dependent Entities (Level 1)
  const vehicles = await vehicleRepository.save([
    vehicleRepository.create({
      id: '423e4567-e89b-12d3-a456-426614174001',
      plateNumber: 'AA123BB',
      type: VehicleType.CAR,
      isDefault: true,
      user: users[0],
    }),
    vehicleRepository.create({
      id: '423e4567-e89b-12d3-a456-426614174002',
      plateNumber: 'BB456CC',
      type: VehicleType.TRUCK,
      isDefault: false,
      user: users[0],
    }),
    vehicleRepository.create({
      id: '423e4567-e89b-12d3-a456-426614174003',
      plateNumber: 'CC789DD',
      type: VehicleType.MOTORCYCLE,
      isDefault: true,
      user: users[1],
    }),
  ]);

  await cardRepository.save([
    cardRepository.create({
      id: '523e4567-e89b-12d3-a456-426614174001',
      pokCardId: '7d8a9c1e-3b2a-4f5e-9c1a-2b3c4d5e6f7a',
      hiddenNumber: '**** **** **** 1234',
      isDefault: true,
      user: users[0],
    }),
    cardRepository.create({
      id: '523e4567-e89b-12d3-a456-426614174002',
      pokCardId: '8e9b0d2f-4c3b-5a6f-8d2b-3c4d5e6f7a8b',
      hiddenNumber: '**** **** **** 5678',
      isDefault: true,
      user: users[1],
    }),
  ]);

  await pricingRuleRepository.save([
    pricingRuleRepository.create({
      id: '623e4567-e89b-12d3-a456-426614174001',
      name: 'Weekend Surcharge Standard',
      adjustmentType: 'SURCHARGE',
      value: 15.0,
      dayOfWeek: 6,
      spotCategory: categories[0],
    }),
    pricingRuleRepository.create({
      id: '623e4567-e89b-12d3-a456-426614174002',
      name: 'VIP Evening Discount',
      adjustmentType: 'DISCOUNT',
      value: 10.0,
      startHour: 18,
      endHour: 22,
      spotCategory: categories[1],
    }),
  ]);

  const spots = await parkingSpotRepository.save([
    parkingSpotRepository.create({
      id: '723e4567-e89b-12d3-a456-426614174001',
      spotNumber: 'S-01',
      floor: 1,
      status: ParkingSpotStatus.OCCUPIED,
      type: categories[0],
      lot: lots[0],
    }),
    parkingSpotRepository.create({
      id: '723e4567-e89b-12d3-a456-426614174002',
      spotNumber: 'S-02',
      floor: 1,
      status: ParkingSpotStatus.AVAILABLE,
      type: categories[0],
      lot: lots[0],
    }),
    parkingSpotRepository.create({
      id: '723e4567-e89b-12d3-a456-426614174003',
      spotNumber: 'VIP-01',
      floor: 2,
      status: ParkingSpotStatus.AVAILABLE,
      type: categories[1],
      lot: lots[1],
    }),
  ]);

  await passwordResetRepository.save([
    passwordResetRepository.create({
      id: '823e4567-e89b-12d3-a456-426614174001',
      codeHash: 'sample_hash_code_1',
      expiresAt: new Date(Date.now() + 3600000),
      user: users[0],
    }),
  ]);

  await feedbackRepository.save([
    feedbackRepository.create({
      id: '923e4567-e89b-12d3-a456-426614174001',
      subject: 'App Feedback',
      category: 'General',
      message: 'Great app experience!',
      status: 'pending',
      user: users[0],
    }),
    feedbackRepository.create({
      id: '923e4567-e89b-12d3-a456-426614174002',
      subject: 'Payment Issue',
      category: 'Billing',
      message: 'Had trouble linking my card initially.',
      status: 'resolved',
      user: users[1],
    }),
  ]);

  await violationRepository.save([
    violationRepository.create({
      id: 'a23e4567-e89b-12d3-a456-426614174001',
      type: ViolationType.OVERSTAY,
      description: 'Exceeded paid parking time by 30 minutes.',
      penaltyAmount: 500.0,
      status: ViolationStatus.PENDING,
      user: users[0],
    }),
  ]);

  // 3. Second-Level Dependent Entities (Level 2)
  const sessions = await parkingSessionRepository.save([
    parkingSessionRepository.create({
      id: 'b23e4567-e89b-12d3-a456-426614174001',
      vehicle: vehicles[0],
      spot: spots[0],
      entryTime: new Date(Date.now() - 3600000),
      status: ParkingSessionStatus.ACTIVE,
      price: 200.0,
      user: users[0],
    }),
    parkingSessionRepository.create({
      id: 'b23e4567-e89b-12d3-a456-426614174002',
      vehicle: vehicles[2],
      spot: spots[2],
      entryTime: new Date(Date.now() - 7200000),
      exitTime: new Date(Date.now() - 3600000),
      status: ParkingSessionStatus.COMPLETED,
      price: 250.0,
      user: users[1],
    }),
  ]);

  await transactionRepository.save([
    {
      id: 'c23e4567-e89b-12d3-a456-426614174001',
      sdkOrderId: 'ORDER-123456',
      status: TransactionStatus.PENDING,
      paymentCurrency: 'ALL',
      originalAmount: 200.0,
      finalAmount: 200.0,
      parkingSession: sessions[0],
    } as Transaction,
    {
      id: 'c23e4567-e89b-12d3-a456-426614174002',
      sdkOrderId: 'ORDER-789012',
      status: TransactionStatus.SUCCESS,
      paymentCurrency: 'EUR',
      originalAmount: 2.5,
      finalAmount: 2.5,
      parkingSession: sessions[1],
      paymentConfirmedAt: new Date(Date.now() - 3600000),
    } as Transaction,
  ]);

  console.log('\n🎉 SEED COMPLETE\n');
}

async function main() {
  const mode = process.argv[2]; // "reset", "seed", or run both by default

  await AppDataSource.initialize();

  if (mode === 'reset') {
    await resetDatabase(AppDataSource);
  } else if (mode === 'seed') {
    await seedAll(AppDataSource);
  } else {
    await resetDatabase(AppDataSource);
    await seedAll(AppDataSource);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
