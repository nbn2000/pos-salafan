// src/seed/run-seed.ts
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

type RowId = { id: string };

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const ds = app.get<DataSource>(DataSource);

  // Typed helpers
  const queryRows = async <T extends object>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> => ds.query(sql, params);

  const insertOne = async (
    sql: string,
    params: unknown[] = [],
  ): Promise<string> => {
    const rows = await queryRows<RowId>(sql, params);
    if (!rows.length || typeof rows[0].id !== 'string') {
      throw new Error('Expected an id from insertOne');
    }
    return rows[0].id;
  };

  const selectOneId = async (
    sql: string,
    params: unknown[] = [],
  ): Promise<string> => {
    const rows = await queryRows<RowId>(sql, params);
    if (!rows.length || typeof rows[0].id !== 'string') {
      throw new Error('Expected an id from selectOneId');
    }
    return rows[0].id;
  };

  await ds.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  await ds.transaction(async (q) => {
    // 2) Measurement conversions (identity)
    await q.query(`
      INSERT INTO "measurement_conversion" ("id","fromUnit","toUnit","multiplier","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),'KG','KG',1,true,now(),now()
      WHERE NOT EXISTS (SELECT 1 FROM "measurement_conversion" WHERE "fromUnit"='KG' AND "toUnit"='KG');

      INSERT INTO "measurement_conversion" ("id","fromUnit","toUnit","multiplier","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),'METER','METER',1,true,now(),now()
      WHERE NOT EXISTS (SELECT 1 FROM "measurement_conversion" WHERE "fromUnit"='METER' AND "toUnit"='METER');

      INSERT INTO "measurement_conversion" ("id","fromUnit","toUnit","multiplier","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),'LITRE','LITRE',1,true,now(),now()
      WHERE NOT EXISTS (SELECT 1 FROM "measurement_conversion" WHERE "fromUnit"='LITRE' AND "toUnit"='LITRE');
    `);

    // 3) Users
    const adminPass = await bcrypt.hash('admin123', 10);
    await q.query(
      `
      INSERT INTO "user" ("id","username","password","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(),'admin',$1,true,now(),now())
      ON CONFLICT ("username") DO NOTHING;
    `,
      [adminPass],
    );

    const workerPass = await bcrypt.hash('worker123', 10);
    await q.query(
      `
      INSERT INTO "user" ("id","username","password","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(),'worker',$1,true,now(),now())
      ON CONFLICT ("username") DO NOTHING;
    `,
      [workerPass],
    );

    const adminUserId = await selectOneId(
      `SELECT "id" FROM "user" WHERE "username" = $1 LIMIT 1`,
      ['admin'],
    );

    // 4) Clients
    const client1Id = await insertOne(`
      WITH up AS (
        INSERT INTO "client" ("id","name","phone","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(),'Ali Corp','+998900000001',true,now(),now())
        ON CONFLICT ("phone") DO UPDATE SET "name"='Ali Corp',"updatedAt"=now()
        RETURNING "id"
      ) SELECT "id" FROM up;
    `);

    await q.query(`
      INSERT INTO "client" ("id","name","phone","isActive","createdAt","updatedAt")
      VALUES
        (uuid_generate_v4(),'Diyor LLC','+998900000002',true,now(),now()),
        (uuid_generate_v4(),'Nodir Co','+998900000003',true,now(),now())
      ON CONFLICT ("phone") DO NOTHING;
    `);

    // 5) Suppliers
    const supp1Id = await insertOne(`
      WITH up AS (
        INSERT INTO "supplier" ("id","name","phone","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(),'Golibjon','+998946270565',true,now(),now())
        ON CONFLICT ("phone") DO UPDATE SET "name"='Golibjon',"updatedAt"=now()
        RETURNING "id"
      ) SELECT "id" FROM up;
    `);

    await q.query(`
      INSERT INTO "supplier" ("id","name","phone","isActive","createdAt","updatedAt")
      VALUES
        (uuid_generate_v4(),'Uktam','+998900000010',true,now(),now()),
        (uuid_generate_v4(),'Anvar','+998900000011',true,now(),now())
      ON CONFLICT ("phone") DO NOTHING;
    `);

    // 6) Workers + payments
    const worker1Id = await insertOne(`
      WITH ins AS (
        INSERT INTO "worker" ("id","name","salary","position","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(),'Jamshid', 4000000, 'worker', true, now(), now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `);

    await q.query(`
      INSERT INTO "worker" ("id","name","salary","position","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),'Lola', 4500000, 'packer', true, now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM "worker" WHERE "name"='Lola');

      INSERT INTO "worker" ("id","name","salary","position","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),'Ravshan', 5000000, 'assembler', true, now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM "worker" WHERE "name"='Ravshan');
    `);

    await q.query(
      `
      INSERT INTO "worker_payment" ("id","amount","workerId","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(), 1000000, $1, true, now(), now()
      WHERE NOT EXISTS (
        SELECT 1 FROM "worker_payment" WHERE "workerId"=$1 AND "amount"=1000000
      );

      INSERT INTO "worker_payment" ("id","amount","workerId","isActive","createdAt","updatedAt")
      SELECT uuid_generate_v4(),  800000, $1, true, now(), now()
      WHERE NOT EXISTS (
        SELECT 1 FROM "worker_payment" WHERE "workerId"=$1 AND "amount"=800000
      );
    `,
      [worker1Id],
    );

    // 7) Raw materials (+ images, + batches)
    const sugarId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "raw_material"
          ("id","name","type","isActive","createdAt","updatedAt")
        VALUES
          (uuid_generate_v4(),'Sugar', 'KG', $1, true, now(), now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    const milkId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "raw_material"
          ("id","name","type","isActive","createdAt","updatedAt")
        VALUES
          (uuid_generate_v4(),'Milk',  'LITRE', $1, true, now(), now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    const pipeId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "raw_material"
          ("id","name","type","isActive","createdAt","updatedAt")
        VALUES
          (uuid_generate_v4(),'PVC Pipe', 'METER', $1, true, now(), now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    // images removed

    const exRate = 12600;

    // 🔁 NEW columns for batch pricing
    await q.query(
      `
      INSERT INTO "raw_material_batch"
        ("id","rawMaterialId","amount","buyPrice","sellPrice","isActive","createdAt","updatedAt")
      VALUES
        (uuid_generate_v4(), $1,  500,  0.60,  0.90, $4, true, now(), now()),
        (uuid_generate_v4(), $2,  800,  0.20,  0.35, $4, true, now(), now()),
        (uuid_generate_v4(), $3, 1200,  0.40,  0.65, $4, true, now(), now());
    `,
      [sugarId, milkId, pipeId, exRate],
    );

    // 8) Product recipes removed

    // 9) Products + images
    const chocProdId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "product" ("id","name","type","minAmount","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(),'Chocolate Bar','KG',10,true,now(),now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    const tubeProdId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "product" ("id","name","type","minAmount","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(),'Plastic Tube','METER',10,true,now(),now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    // product images removed

    // 🔁 NEW product_batch pricing columns
    await q.query(
      `
      INSERT INTO "product_batch"
        ("id","productId","amount","cost","sellPrice","isActive","createdAt","updatedAt")
      VALUES
        (uuid_generate_v4(), $1, 300, 0.75, 1.20, true, now(), now()),
        (uuid_generate_v4(), $2, 200, 0.90, 1.50, true, now(), now());
    `,
      [chocProdId, tubeProdId],
    );

    // 10) Sample sale
    const txId = await insertOne(
      `
      WITH ins AS (
        INSERT INTO "transaction" 
          ("id","totalSoldPrice","comment","isActive","createdAt","updatedAt")
        VALUES (uuid_generate_v4(), 50, 'Seed transaction', true, now(), now())
        RETURNING "id"
      ) SELECT "id" FROM ins;
    `,
      [],
    );

    await q.query(
      `
      INSERT INTO "transaction_product"
        ("id","productId","transactionId","soldPrice","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(), $1, $2, 50, true, now(), now());
    `,
      [chocProdId, txId],
    );

    // 11) Debts & Payments (single-currency)
    // Client -> User (receivable)
    await q.query(
      `
      INSERT INTO "debt"
        ("id","amount","from","to","comment","transactionId","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(), 10, $1, $2, 'Seed debt for sample sale', $3, true, now(), now());
    `,
      [client1Id, adminUserId, txId],
    );

    // Partial payment from client
    await q.query(
      `
      INSERT INTO "payment"
        ("id","amount","from","to","comment","transactionId","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(), 5, $1, $2, 'Partial payment', $3, true, now(), now());
    `,
      [client1Id, adminUserId, txId],
    );

    // Supplier payable (per your earlier "supplier credit" logic: from = supplierId, to = userId)
    await q.query(
      `
      INSERT INTO "debt"
        ("id","amount","from","to","comment","isActive","createdAt","updatedAt")
      VALUES (uuid_generate_v4(), 1200000, $1, $2, 'Seed payable to supplier', true, now(), now());
    `,
      [supp1Id, adminUserId],
    );
  });

  await app.close();
  console.log('✅ Seed complete.');
}

run().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
