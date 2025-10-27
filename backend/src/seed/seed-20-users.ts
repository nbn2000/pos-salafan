// src/seed/seed-20-users.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

async function seed20Users(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const ds = app.get<DataSource>(DataSource);
    const usersRepo: Repository<User> = ds.getRepository(User);

    // Use the same rounds as in UserBaseService
    const HASH_ROUNDS = 10;

    // Realistic usernames
    const usernames = [
      'ali.rahimov',
      'lola.nazarova',
      'javlon.ergashev',
      'dilshod.akhmedov',
      'nodira.yuldasheva',
      'oybek.karimov',
      'malika.ismatova',
      'jamshid.qodirov',
      'gulnora.tursunova',
      'behruz.saidov',
      'aziza.toxtaeva',
      'farhod.tadjiev',
      'sevara.mirzayeva',
      'islom.khalilov',
      'nilufar.nazarova',
      'asadbek.usmonov',
      'sardor.ergashev',
      'diyor.sharipov',
      'sohibjon.sobirov',
      'shahnoza.abdullaeva',
    ];

    const hashed = await bcrypt.hash('Changeme@123', HASH_ROUNDS);

    for (const username of usernames) {
      const existing = await usersRepo.findOne({ where: { username } });
      if (existing) {
        console.log(`Skip existing: ${username}`);
        continue;
      }
      const user = usersRepo.create({ username, password: hashed });
      await usersRepo.save(user);
      console.log(`Created: ${username}`);
    }

    console.log('Done: seeded up to 20 users (idempotent).');
  } catch (err) {
    console.error('Seeding 20 users failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed20Users().catch((err) => {
  console.error('Unexpected failure:', err);
  process.exit(1);
});
