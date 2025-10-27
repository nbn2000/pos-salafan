// src/seed/seed-20-suppliers.ts
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../app.module';
import { DataSource, Repository } from 'typeorm';
import { Supplier } from '../party/supplier/entities/supplier.entity';

async function seed20Suppliers(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const ds = app.get<DataSource>(DataSource);
    await ds.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    const suppliersRepo: Repository<Supplier> = ds.getRepository(Supplier);

    // Realistic supplier names + phones (unique among active rows)
    const entries: Array<{ name: string; phone: string }> = [
      { name: 'Orient Plast LLC', phone: '+998907001001' },
      { name: 'Zarafshan Metals', phone: '+998911234789' },
      { name: 'MegaChem Supply', phone: '+998935551199' },
      { name: 'Uz PolyTrade', phone: '+998909001122' },
      { name: 'Golden Grain Co', phone: '+998931220011' },
      { name: 'SamOil Supply', phone: '+998944440777' },
      { name: 'Asia Paper Mills', phone: '+998951230045' },
      { name: 'Turon Logistics', phone: '+998936661999' },
      { name: 'Silk Road Textiles', phone: '+998977771010' },
      { name: 'Nukus Plastics', phone: '+998935557799' },
      { name: 'Bukhara Ceram Trade', phone: '+998909909919' },
      { name: 'Jizzakh Machine Parts', phone: '+998935009901' },
      { name: 'Khiva Agro Supply', phone: '+998913334466' },
      { name: 'Qarshi Cement Depot', phone: '+998939393919' },
      { name: 'Guliston PharmaTrade', phone: '+998936969619' },
      { name: 'Chirchiq Steel Works', phone: '+998934567891' },
      { name: 'Yangiyul Paper Trade', phone: '+998914561235' },
      { name: 'Bekabad Metal Group', phone: '+998951234322' },
      { name: 'Angren Mining Supply', phone: '+998905551123' },
      { name: 'Urgench PolyPack LLC', phone: '+998901112234' },
    ];

    for (const { name, phone } of entries) {
      const existing = await suppliersRepo.findOne({ where: { phone } });
      if (existing) {
        if (existing.name !== name || existing.isActive === false) {
          existing.name = name;
          existing.isActive = true;
          await suppliersRepo.save(existing);
          console.log(`Updated existing: ${name} (${phone})`);
        } else {
          console.log(`Skip existing: ${name} (${phone})`);
        }
        continue;
      }

      const s = suppliersRepo.create({ name, phone });
      await suppliersRepo.save(s);
      console.log(`Created: ${name} (${phone})`);
    }

    console.log('Done: seeded up to 20 suppliers (idempotent).');
  } catch (err) {
    console.error('Seeding 20 suppliers failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

seed20Suppliers().catch((err) => {
  console.error('Unexpected failure:', err);
  process.exit(1);
});

