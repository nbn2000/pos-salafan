// src/seed/seed-20-clients.ts
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../app.module';
import { DataSource, Repository } from 'typeorm';
import { Client } from '../party/client/entities/client.entity';

async function seed20Clients(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const ds = app.get<DataSource>(DataSource);
    await ds.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    const clientsRepo: Repository<Client> = ds.getRepository(Client);

    // Realistic business names with unique phones
    const entries: Array<{ name: string; phone: string }> = [
      { name: 'Atlas Trading', phone: '+998901234567' },
      { name: 'Orzu Plast', phone: '+998911112233' },
      { name: 'SamTex Group', phone: '+998935551122' },
      { name: 'Navoi Energo', phone: '+998909876543' },
      { name: 'Andijan Logistics', phone: '+998931234321' },
      { name: 'Tashkent Foods', phone: '+998941234567' },
      { name: 'Fergana Chemicals', phone: '+998951112244' },
      { name: 'Namangan Textile', phone: '+998936661234' },
      { name: 'Samarkand Fruits', phone: '+998977770001' },
      { name: 'Nukus Oil', phone: '+998935557788' },
      { name: 'Bukhara Ceramics', phone: '+998909909909' },
      { name: 'Jizzakh Machinery', phone: '+998935009900' },
      { name: 'Khiva Agro', phone: '+998913334455' },
      { name: 'Qarshi Cement', phone: '+998939393939' },
      { name: 'Guliston Pharm', phone: '+998936969696' },
      { name: 'Chirchiq Steel', phone: '+998934567890' },
      { name: 'Yangiyul Paper', phone: '+998914561234' },
      { name: 'Bekabad Metall', phone: '+998951234321' },
      { name: 'Angren Mining', phone: '+998905551122' },
      { name: 'Urgench PolyPack', phone: '+998901112233' },
    ];

    for (const { name, phone } of entries) {
      const existing = await clientsRepo.findOne({ where: { phone } });
      if (existing) {
        if (existing.name !== name || existing.isActive === false) {
          existing.name = name;
          existing.isActive = true;
          await clientsRepo.save(existing);
          console.log(`Updated existing: ${name} (${phone})`);
        } else {
          console.log(`Skip existing: ${name} (${phone})`);
        }
        continue;
      }

      const c = clientsRepo.create({ name, phone });
      await clientsRepo.save(c);
      console.log(`Created: ${name} (${phone})`);
    }

    console.log('Done: seeded up to 20 clients (idempotent).');
  } catch (err) {
    console.error('Seeding 20 clients failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed20Clients().catch((err) => {
  console.error('Unexpected failure:', err);
  process.exit(1);
});
