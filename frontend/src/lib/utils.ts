import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  const pagination: (number | string)[] = [];
  const pageRange = 2;

  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pagination.push(1);

  if (currentPage > pageRange + 2) {
    pagination.push('...');
  }

  for (
    let i = Math.max(2, currentPage - pageRange);
    i <= Math.min(totalPages - 1, currentPage + pageRange);
    i++
  ) {
    pagination.push(i);
  }

  if (currentPage < totalPages - pageRange - 1) {
    pagination.push('...');
  }

  pagination.push(totalPages);

  return pagination;
};

export function getFilteredArray(
  length: number,
  excludeItems: number[],
  array: number[]
) {
  if (!Array.isArray(array)) {
    throw new Error('Third argument must be an array');
  }
  if (!Array.isArray(excludeItems)) {
    throw new Error('Second argument must be an array of items to exclude');
  }
  if (typeof length !== 'number' || length < 0) {
    throw new Error('First argument must be a non-negative number');
  }

  const filtered = array.filter((item: number) => !excludeItems.includes(item));

  return filtered.slice(0, length);
}

export const shuffleArray = (arr: number[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const currentTime = () => {
  const now = new Date().getTime();
  const twentyFiveMinutesInMilliseconds = 25 * 60 * 1000;
  return now + twentyFiveMinutesInMilliseconds;
};

export const getSecondsDifference = (givenTimeMs: number) => {
  if (typeof givenTimeMs !== 'number' || isNaN(givenTimeMs)) {
    throw new Error(
      'Invalid input. Please provide a valid number for milliseconds.'
    );
  }

  const now = Date.now();
  const differenceMs = givenTimeMs - now;
  const differenceInMinutes = differenceMs / (60 * 1000);

  return Math.trunc(differenceInMinutes);
};

export const langConvert = (lang: 'kr' | 'lt' | 'ru') => {
  switch (lang) {
    case 'kr':
      return 'kir';
    case 'lt':
      return 'lat';
    case 'ru':
      return 'ru';
    default:
      return 'lat';
  }
};

export const date = (e: string): string => {
  const givenDate = new Date(e);
  if (isNaN(givenDate.getTime())) {
    return e;
  }

  const day = String(givenDate.getDate()).padStart(2, '0');
  const month = String(givenDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = givenDate.getFullYear();

  return `${day}-${month}-${year}`;
};

export const generateSKU = (name: string): string => {
  const base = name.toUpperCase().replace(/\s+/g, '-').slice(0, 8);
  const timestamp = Date.now().toString().slice(-5);
  return `${base}-${timestamp}`;
};

export const transPayType = (type: string) => {
  switch (type) {
    case 'uzs':
      return 'Naqd';
    case 'credit':
      return 'Kredit';
    case 'deferred':
      return 'Qarz';
    default:
      return 'N/A';
  }
};

export const transInventoryType = (type: string) => {
  switch (type) {
    case 'add':
      return "Qo'shish";
    case 'adjust':
      return "O'zgartirish";
    case 'remove':
      return "O'chirish";
    case 'restock':
      return "Qayta to'ldirish";
    default:
      return 'N/A';
  }
};
// Path translations for breadcrumbs
export const transPath = (path: string) => {
  switch (path) {
    case 'products':
      return 'Mahsulotlar';
    case 'suppliers':
      return 'Yetkazib beruvchilar';
    case 'sales':
      return 'Sotuvlar';
    case 'records':
      return 'Sotilgan Mahsulotlar';
    case 'merchants':
      return 'Sotuvchilar';
    case 'debtor':
      return 'Qarzdorlar';
    case 'inventory-logs':
      return 'Kirdi-chiqdi';
    case 'merchant-debts':
      return 'Sotuvchi qarzlari';
    case 'income':
      return 'Daromad';
    case 'orders':
      return 'Buyurtmalar';
    case 'favorites':
      return 'Sevimli';
    case 'analytics':
      return 'Tahlil';
    case 'point-of-sale':
      return 'Sotuv nuqtasi';
    case 'profile':
      return 'Profil';
    case 'login':
      return 'Kirish';
    case 'register':
      return "Ro'yxatdan o'tish";
    case 'technologies':
      return 'Texnologiyalar';
    case 'apidocs':
      return 'API Hujjatlari';
    case 'sale':
      return 'Sotuv';
    case 'suppliers-by-products':
      return 'Yetkazib beruvchilar mahsulotlari';
    case 'suppliers-by-merchant-debts':
      return 'Haqdor yetkazib beruvchilar';
    case 'settings':
      return 'Sozlamalar';
    case 'partners':
      return 'hamkorlar';
    case 'raw-materials':
      return 'Xomashyolar';
    case 'customers':
      return 'mijozlar';
    default:
      return path;
  }
};

// Breadcrumb konfiguratsiyasi - faqat maxsus holatlar uchun
export const SPECIAL_ROUTES_CONFIG = {
  'suppliers-by-merchant-debts': {
    baseName: 'Haqdor yetkazib beruvchilar',
    segments: [
      {
        name: 'Qarzlarim',
        condition: (segments: string[]) =>
          segments.length >= 2 && !isNaN(Number(segments[1])),
      },
      {
        name: 'Partiya qarzlari',
        condition: (segments: string[]) =>
          segments.length >= 3 && !isNaN(Number(segments[2])),
      },
    ],
  },
  'suppliers-by-products': {
    baseName: 'Yetkazib beruvchilar',
    segments: [
      {
        name: 'Mahsulotlar',
        condition: (segments: string[]) =>
          segments.length >= 2 && !isNaN(Number(segments[1])),
      },
      {
        name: 'Partiyalar',
        condition: (segments: string[]) =>
          segments.length >= 3 && !isNaN(Number(segments[2])),
      },
    ],
  },
  records: {
    baseName: 'Sotilgan Mahsulotlar',
    segments: [
      {
        name: "Sotuv ma'lumotlari",
        condition: (segments: string[]) =>
          segments.length >= 2 && !isNaN(Number(segments[1])),
      },
    ],
  },
  merchants: {
    baseName: 'Sotuvchilar',
    segments: [
      {
        name: "Sotuvchi ma'lumotlari",
        condition: (segments: string[]) => segments.length >= 2 && segments[1],
      },
      {
        name: "Sotuv ma'lumotlari",
        condition: (segments: string[]) =>
          segments.length >= 3 && !isNaN(Number(segments[2])),
      },
    ],
  },
  income: {
    baseName: 'Daromad',
    segments: [
      {
        name: "Sotuv ma'lumotlari",
        condition: (segments: string[]) =>
          segments.length >= 2 && !isNaN(Number(segments[1])),
      },
    ],
  },
  debtor: {
    baseName: 'Qarzdorlar',
    segments: [
      {
        name: "Qarzdor ma'lumotlari",
        condition: (segments: string[]) =>
          segments.length >= 2 && !isNaN(Number(segments[1])),
      },
    ],
  },
  'raw-materials': {
    baseName: 'Xomashyolar',
    segments: [
      {
        name: 'Partiyalar',
        condition: (segments: string[]) =>
          segments.length >= 2 && segments[1] && segments[1].includes('-'),
      },
    ],
  },
} as const;

export const getCustomBreadcrumbName = (
  path: string,
  index: number,
  pathSegments: string[]
) => {
  // If it's a number (ID) or UUID, don't show it in breadcrumb
  if (!isNaN(Number(path)) || path.includes('-')) {
    return null;
  }

  return transPath(path);
};

export const buildBreadcrumbItems = (pathname: string) => {
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');
  const breadcrumbItems = [];

  // Always add "Asosiy" as first item
  breadcrumbItems.push({
    path: '/',
    name: 'Asosiy',
    isLast: false,
    isLink: true,
  });

  // Check for special routes first
  const specialRoute = Object.keys(SPECIAL_ROUTES_CONFIG).find((route) =>
    pathname.includes(`/${route}`)
  );

  if (specialRoute) {
    const config =
      SPECIAL_ROUTES_CONFIG[specialRoute as keyof typeof SPECIAL_ROUTES_CONFIG];
    const segments = pathname.split('/').filter((s) => s !== '');

    // Add base route breadcrumb
    breadcrumbItems.push({
      path: `/${specialRoute}`,
      name: config.baseName,
      isLast: segments.length === 1,
      isLink: segments.length > 1,
    });

    // Add additional segments based on conditions
    let addedSegments = 0;
    config.segments.forEach((segment, index) => {
      if (segment.condition(segments)) {
        const currentPath = `/${segments.slice(0, index + 2).join('/')}`;
        addedSegments++;

        // Check if this is the last segment that will be added
        const remainingSegments = config.segments.slice(index + 1);
        const hasMoreSegments = remainingSegments.some((s) =>
          s.condition(segments)
        );

        breadcrumbItems.push({
          path: currentPath,
          name: segment.name,
          isLast: !hasMoreSegments,
          isLink: hasMoreSegments,
        });
      }
    });
  } else {
    // Process each segment for other routes
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const currentPath = `/${pathSegments.slice(0, i + 1).join('/')}`;
      const isLast = i === pathSegments.length - 1;

      // Get custom name for this segment
      const customName = getCustomBreadcrumbName(segment, i, pathSegments);

      // Skip if customName is null
      if (customName === null) {
        continue;
      }

      breadcrumbItems.push({
        path: currentPath,
        name: customName,
        isLast,
        isLink: !isLast,
      });
    }
  }

  // If no breadcrumb items (except Asosiy), remove Asosiy too
  if (breadcrumbItems.length === 1) {
    breadcrumbItems[0] = {
      path: '/',
      name: 'Asosiy',
      isLast: true,
      isLink: false,
    };
  }

  return breadcrumbItems;
};

export function formatPhoneNumber(phone: string): string {
  if (!phone?.startsWith('+998') || phone.length !== 13) {
    return phone;
  }

  const part1 = phone.slice(0, 4);
  const part2 = phone.slice(4, 6);
  const part3 = phone.slice(6, 9);
  const part4 = phone.slice(9, 11);
  const part5 = phone.slice(11, 13);

  return `${part1} ${part2} ${part3} ${part4} ${part5}`;
}

// "1 234,56", "1,234.56", "1234.56", "1_234" va hok. kirishlarni qabul qiladi
export function formatQuantity(value: number | string): string {
  const num = toNumber(value);
  if (!Number.isFinite(num)) return '0';

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const [intPart, fracPart] = abs.toString().split('.');

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + (fracPart ? `${formattedInt}.${fracPart}` : formattedInt);
}

// String → Number normalizatsiya
function toNumber(input: number | string): number {
  if (typeof input === 'number') return input;

  let s = input.trim();
  if (!s) return NaN;

  // oxirgi nuqta yoki vergulni decimal separator deb olamiz
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  const decIdx = Math.max(lastComma, lastDot);

  let intPart = decIdx >= 0 ? s.slice(0, decIdx) : s;
  let fracPart = decIdx >= 0 ? s.slice(decIdx + 1) : '';

  // integer qismidan faqat raqam va minusni qoldiramiz (bo‘shliq, , . _ va h.k. olib tashlanadi)
  intPart = intPart.replace(/[^\d-]/g, '');
  // kasr qismidan faqat raqamlarni qoldiramiz
  fracPart = fracPart.replace(/[^\d]/g, '');

  const normalized = fracPart ? `${intPart}.${fracPart}` : intPart;
  return Number(normalized);
}
