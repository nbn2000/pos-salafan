/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
// src/seed/seed-raw-materials-api.ts
import axios, { AxiosInstance } from 'axios';

type Supplier = { id: string; name: string; phone: string };

type CreateRawPayload = {
  name: string;
  type: 'KG' | 'UNIT';
  minAmount: number;
  supplierId: string;
  batch: { amount: number; buyPrice: number };
  paid?: number;
};

function env(name: string, def?: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : def;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  const baseURL = env('API_BASE_URL', 'http://localhost:5000');
  const username = env('SEED_USER', 'admin')!;
  const password = env('SEED_PASS', 'admin123')!;

  const api = axios.create({ baseURL });

  // 1) Login and get Bearer token
  const token = await login(api, username, password);
  const authApi = attachAuth(api, token);

  // 2) Ensure we have suppliers
  let suppliers = await fetchSuppliers(authApi, 1, 50);
  if (suppliers.length === 0) {
    console.log('No suppliers found. Creating a few sample suppliers...');
    const seedSuppliers: Omit<Supplier, 'id'>[] = [
      { name: 'Orient Plast LLC', phone: '+998907001001' },
      { name: 'MegaChem Supply', phone: '+998935551199' },
      { name: 'Turon Logistics', phone: '+998936661999' },
      { name: 'Nukus Plastics', phone: '+998935557799' },
      { name: 'Khiva Agro Supply', phone: '+998913334466' },
    ];
    for (const s of seedSuppliers) {
      try {
        await authApi.post('/api/supplier', s);
      } catch (e) {
        console.log('e', e);
        // ignore conflicts on repeated runs
      }
    }
    suppliers = await fetchSuppliers(authApi, 1, 50);
    if (suppliers.length === 0) {
      throw new Error(
        'Suppliers still empty after attempted creation. Seed suppliers first.',
      );
    }
  }

  // 3) Build 15 raw materials: 5 fully paid, 5 unpaid, 5 half-paid
  type Spec = {
    name: string;
    type: 'KG' | 'UNIT';
    amount: number;
    buyPrice: number;
    minAmount?: number;
  };

  const paid100: Spec[] = [
    {
      name: 'Polypropylene Pellets',
      type: 'KG',
      amount: 1200,
      buyPrice: 21000,
    },
    { name: 'Granulated Sugar', type: 'KG', amount: 800, buyPrice: 10000 },
    { name: 'Cement M-400', type: 'KG', amount: 5000, buyPrice: 1500 },
    { name: 'Copper Wire (spool)', type: 'UNIT', amount: 30, buyPrice: 850000 },
    {
      name: 'Glass Bottles 1L (pack of 20)',
      type: 'UNIT',
      amount: 100,
      buyPrice: 70000,
    },
  ];

  const paid0: Spec[] = [
    { name: 'PVC Granules', type: 'KG', amount: 1500, buyPrice: 19000 },
    { name: 'Wheat Flour 50kg', type: 'KG', amount: 2500, buyPrice: 8000 },
    {
      name: 'Sunflower Oil (tin)',
      type: 'UNIT',
      amount: 200,
      buyPrice: 230000,
    },
    {
      name: 'Aluminum Sheets 1mm',
      type: 'UNIT',
      amount: 300,
      buyPrice: 120000,
    },
    { name: 'Industrial Salt', type: 'KG', amount: 1000, buyPrice: 3000 },
  ];

  const paid50: Spec[] = [
    {
      name: 'Polycarbonate Sheets',
      type: 'UNIT',
      amount: 150,
      buyPrice: 180000,
    },
    { name: 'HDPE Resin', type: 'KG', amount: 1100, buyPrice: 20000 },
    {
      name: 'Stainless Steel Rods',
      type: 'UNIT',
      amount: 400,
      buyPrice: 95000,
    },
    {
      name: 'Latex Gloves (box of 100)',
      type: 'UNIT',
      amount: 250,
      buyPrice: 40000,
    },
    { name: 'Citric Acid', type: 'KG', amount: 600, buyPrice: 12000 },
  ];

  const batches: Array<{ spec: Spec; paidPct: 0 | 50 | 100 }> = [
    ...paid100.map((spec) => ({ spec, paidPct: 100 as const })),
    ...paid0.map((spec) => ({ spec, paidPct: 0 as const })),
    ...paid50.map((spec) => ({ spec, paidPct: 50 as const })),
  ];

  // 4) Create via API; skip if a material with exact name already exists
  let created = 0;
  for (let i = 0; i < batches.length; i++) {
    const { spec, paidPct } = batches[i];
    const supplierId = pick(suppliers, i).id;
    const minAmount =
      spec.minAmount ?? Math.max(1, Math.floor(spec.amount * 0.1));
    const total = spec.amount * spec.buyPrice;
    const paid =
      paidPct === 100 ? total : paidPct === 50 ? Math.round(total / 2) : 0;

    const already = await findRawByName(authApi, spec.name);
    if (already) {
      console.log(`Skip existing raw: ${spec.name}`);
      continue;
    }

    const payload: CreateRawPayload = {
      name: spec.name,
      type: spec.type,
      minAmount,
      supplierId,
      batch: { amount: spec.amount, buyPrice: spec.buyPrice },
      paid,
    };

    try {
      const res = await authApi.post('/api/raw-material', payload);
      const id = res.data?.id ?? '(no id)';
      console.log(
        `Created raw: ${spec.name} [${spec.type}] amount=${spec.amount}, price=${spec.buyPrice}, paidPct=${paidPct}% -> id=${id}`,
      );
      created++;
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error(
        `Failed to create ${spec.name} (status=${status}):`,
        data ?? err.message,
      );
    }
  }

  console.log(`Done. Created ${created} raw materials via API.`);
}

async function login(
  api: AxiosInstance,
  username: string,
  password: string,
): Promise<string> {
  try {
    const { data } = await api.post('/api/auth/login', { username, password });
    const token = data?.auth?.access_token as string | undefined;
    if (!token) throw new Error('No access_token in login response');
    return token;
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    throw new Error(
      `Login failed for ${username} (status=${status}): ${JSON.stringify(data ?? err.message)}`,
    );
  }
}

function attachAuth(api: AxiosInstance, token: string): AxiosInstance {
  const inst = axios.create({ baseURL: api.defaults.baseURL });
  inst.interceptors.request.use((cfg) => {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any)['Authorization'] = `Bearer ${token}`;
    return cfg;
  });
  return inst;
}

async function fetchSuppliers(
  api: AxiosInstance,
  page = 1,
  take = 50,
): Promise<Supplier[]> {
  const { data } = await api.get('/api/supplier', { params: { page, take } });
  const results = (data?.results ?? []) as Supplier[];
  return results;
}

async function findRawByName(
  api: AxiosInstance,
  name: string,
): Promise<boolean> {
  const { data } = await api.get('/api/raw-material', {
    params: { search: name, searchField: 'name', take: 1 },
  });
  const results = (data?.results ?? []) as Array<{ name: string }>;
  return results.some((r) => r?.name === name);
}

main().catch((e) => {
  console.error('Seeding raw materials via API failed:', e);
  process.exit(1);
});

