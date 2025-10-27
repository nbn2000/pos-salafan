import { ArrowRight, Package, ShoppingCart, X, Calendar, Filter } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { UniversalContent, UniversalPage } from '../common';
import Cards from './components/cards';
import Detail from './components/detail';

import { useAppSelector } from '@/store/hooks';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

import { useDebounce } from '@/hooks/useDebounce';

// ⚠️ New: use SALE browse API (no raw materials)
import { useGetSaleItemsQuery } from '@/api/sales';
import type { MeasureType } from '@/interfaces/raw-material/raw-materials';

// ——— Normalizatsiya qilingan UI item (faqat PRODUCT) ———
type UISaleItem = {
  id: string;
  kind: 'product';
  name: string;
  price: number; // UZS (sell price)
  priceUzs?: number; // backward-compat
  amount: number; // total available amount
  measure?: MeasureType; // (unknown here) optional
  warehouseName: string; // kept for compatibility with Cards props
  imageUrl?: string;
};

export function UniversalSale() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const debounceSearch = useDebounce(search, 500);

  // Backend filters
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('name');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [includeBatches, setIncludeBatches] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState(false);
  
  // Client-side filters (kept for backward compatibility)
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const minSwipeDistance = 80;

  // ✅ SALE catalog with all backend filters
  const { data: saleData, isLoading: saleLoading } = useGetSaleItemsQuery({
    search: debounceSearch || undefined,
    page: currentPage,
    take: 8,
    searchField,
    sortField,
    sortOrder,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    includeBatches,
  });

  // Savat
  const cartItems = useAppSelector((s) => s.cart.items);
  const totalQuantity = cartItems.reduce((s, i) => s + i.q, 0);
  const isSelected = totalQuantity > 0;

  // ✓ SALE → UISaleItem[]
  const productItems: UISaleItem[] = useMemo(() => {
    const list = saleData?.results ?? [];
    const baseUrl = import.meta.env.VITE_BASE_URL?.replace('/api/', '') || '';
    return list.map((i) => {
      const price = Number(i.shouldSellPrice ?? 0);
      const firstImage = i.images && i.images.length > 0 
        ? `${baseUrl}/${i.images[0].url.replace(/^uploads[\\\/]/, 'uploads/')}`
        : undefined;
      return {
        id: i.id,
        kind: 'product',
        name: i.name,
        price,
        priceUzs: price,
        amount: Number(i.totalAmount ?? 0),
        // measure is unknown in /sale response; leave undefined
        measure: undefined,
        warehouseName: '',
        imageUrl: firstImage,
      };
    });
  }, [saleData]);

  // Client-side price filtering (kept for additional filtering)
  const saleItems: UISaleItem[] = useMemo(() => {
    let merged = [...productItems];

    // Apply client-side price filters if specified
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || 0);
    if (min) merged = merged.filter((i) => i.price >= min);
    if (max) merged = merged.filter((i) => i.price <= max);

    return merged;
  }, [productItems, minPrice, maxPrice]);

  const totalPages = saleData?.totalPages ?? 1;
  const isLoading = saleLoading;

  // Mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isTransitioning) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    const distance = touchEnd - touchStart;
    const isLeft = distance < -minSwipeDistance;
    const isRight = distance > minSwipeDistance;
    if (isLeft && activeTab === 'products') setActiveTab('cart');
    else if (isRight && activeTab === 'cart') setActiveTab('products');
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile top tabs */}
      <div className="md:hidden fixed top-2.5 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-lg">
          <div className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="font-medium text-xs">Vitrina</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer relative transition ${
                activeTab === 'cart'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('cart')}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="font-medium text-xs">Savat</span>
              {totalQuantity > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                >
                  {totalQuantity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-1 h-full ">
        <div className="flex-1 h-full min-w-0">
          <UniversalPage
            header={{
              title: 'Sotuv',
              description: 'Mahsulotlardan tanlang',
              icon: <ShoppingCart className="w-5 h-5 text-primary" />,
              search: { value: search, placeholder: 'Qidirish...' },
            }}
            filters={{
              showFilterIcon: true,
              showFilter,
              onShowFilterChange: setShowFilter,
              dateRange: {
                startDate: createdFrom,
                endDate: createdTo,
                onStartDateChange: setCreatedFrom,
                onEndDateChange: setCreatedTo,
              },
              searchField: {
                value: searchField,
                onValueChange: setSearchField,
                placeholder: 'Qidirish maydonini tanlang',
              },
              sortField: {
                value: sortField,
                onValueChange: setSortField,
                placeholder: 'Saralash maydonini tanlang',
              },
              sortOrder: {
                value: sortOrder,
                onValueChange: setSortOrder,
                placeholder: 'Saralash tartibini tanlang',
              },
              includeBatches: {
                value: includeBatches,
                onValueChange: setIncludeBatches,
                label: "Partiya ma'lumotlarini ko'rsatish",
              },
              price: {
                minPrice: minPrice ? Number(minPrice) : '',
                maxPrice: maxPrice ? Number(maxPrice) : '',
                onMinPriceChange: (value) => setMinPrice(value ? String(value) : ''),
                onMaxPriceChange: (value) => setMaxPrice(value ? String(value) : ''),
                showPriceFilter: true,
              },
            }}
            showBreadcrumb
          >
            <UniversalContent
              isLoading={isLoading}
              data={saleItems}
              totalPages={totalPages}
              emptyTitle="Hech narsa topilmadi"
              emptyDescription="Qidiruvga mos mahsulot yo‘q."
              emptyIcon={
                <Package className="h-12 w-12 text-muted-foreground" />
              }
              loadingText="Vitrina yuklanmoqda..."
            >
              <Cards product={saleItems} />
            </UniversalContent>
          </UniversalPage>
        </div>

        {isSelected && (
          <div className="w-[420px] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-1rem)] z-40">
            <Card className="bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg h-full min-h-0">
              <Detail items={saleItems} />
            </Card>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden h-full flex flex-col bg-gradient-to-br from-background to-muted/20 min-h-0">
        <div
          className="flex-1 relative overflow-hidden"
          ref={swipeContainerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Products */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              activeTab === 'products'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0'
            }`}
          >
            <div className="h-full">
              <UniversalPage
                header={{
                  title: 'Sotuv',
                  description: 'Mahsulotlardan tanlang',
                  icon: <ShoppingCart className="w-5 h-5 text-primary" />,
                  search: { value: search, placeholder: 'Qidirish...' },
                }}
                filters={{
                  showFilterIcon: true,
                  showFilter,
                  onShowFilterChange: setShowFilter,
                  dateRange: {
                    startDate: createdFrom,
                    endDate: createdTo,
                    onStartDateChange: setCreatedFrom,
                    onEndDateChange: setCreatedTo,
                  },
                  searchField: {
                    value: searchField,
                    onValueChange: setSearchField,
                    placeholder: 'Qidirish maydonini tanlang',
                  },
                  sortField: {
                    value: sortField,
                    onValueChange: setSortField,
                    placeholder: 'Saralash maydonini tanlang',
                  },
                  sortOrder: {
                    value: sortOrder,
                    onValueChange: setSortOrder,
                    placeholder: 'Saralash tartibini tanlang',
                  },
                  includeBatches: {
                    value: includeBatches,
                    onValueChange: setIncludeBatches,
                    label: "Partiya ma'lumotlarini ko'rsatish",
                  },
                  price: {
                    minPrice: minPrice ? Number(minPrice) : '',
                    maxPrice: maxPrice ? Number(maxPrice) : '',
                    onMinPriceChange: (value) => setMinPrice(value ? String(value) : ''),
                    onMaxPriceChange: (value) => setMaxPrice(value ? String(value) : ''),
                    showPriceFilter: true,
                  },
                }}
              >
                <UniversalContent
                  isLoading={isLoading}
                  data={saleItems}
                  totalPages={totalPages}
                  emptyTitle="Hech narsa topilmadi"
                  emptyDescription="Qidiruvga mos mahsulot yo‘q."
                  emptyIcon={
                    <Package className="h-12 w-12 text-muted-foreground" />
                  }
                  loadingText="Vitrina yuklanmoqda..."
                >
                  <Cards product={saleItems} isMobile />
                </UniversalContent>
              </UniversalPage>

            </div>
          </div>

          {/* Cart */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              activeTab === 'cart'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
            }`}
          >
            <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/10">
              {isSelected ? (
                <div className="h-full overflow-auto p-3">
                  <Detail items={saleItems} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full flex items-center justify-center shadow-lg">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-muted/80 rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground font-medium">
                        0
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <h3 className="text-xl font-bold">Savat bo'sh</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Savatda hali mahsulot yo'q. Vitrinaga qaytib, kerakli
                      mahsulotlarni qo'shing.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('products')}
                    className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    size="lg"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Vitrinaga qaytish
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating checkout */}
        {isSelected && activeTab === 'products' && (
          <div className="fixed bottom-0 left-1/2 w-[90%] -translate-x-1/2 z-30 p-3">
            <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-2xl">
              <Button
                onClick={() => setActiveTab('cart')}
                className="w-full h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg text-sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sotuvni yakunlash
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
