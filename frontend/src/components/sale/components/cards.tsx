import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { MeasureType } from '@/interfaces/raw-material/raw-materials';
import { formatQuantity } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCartItem } from '@/store/slices/cartSlice';
import { Package, Plus } from 'lucide-react';
import { CartCounter } from './cartCounter';

// UI item from UniversalSale (product ONLY)
type SaleItem = {
  id: string;
  kind: 'product';
  name: string;
  price: number; // UZS
  priceUzs?: number; // backward-compat
  amount: number; // totalBatchAmount
  warehouseName: string;
  measure?: MeasureType; // optional
  imageUrl?: string;
};

// --- View model for card ---
type CardVM = {
  id: string;
  name: string;
  priceUZS: number; // UZS
  measure?: MeasureType;
  amount: number;
  warehouseName?: string;
  imageUrl?: string;
};

function toCardData(i: SaleItem): CardVM {
  return {
    id: String(i.id),
    name: i.name,
    priceUZS: Number(i.price ?? i.priceUzs ?? 0),
    measure: i.measure,
    amount: Number(i.amount ?? 0),
    warehouseName: i.warehouseName ?? '',
    imageUrl: i.imageUrl ?? undefined,
  };
}

const EachCard = ({
  i,
  isMobile = false,
}: {
  i: SaleItem;
  isMobile?: boolean;
}) => {
  const vm = toCardData(i);
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const cartItem = cartItems.find((item) => String(item.id) === vm.id);
  const quantityInCart = cartItem?.q ?? 0;

  return (
    <Card
      className={`w-full ${
        isMobile ? '' : 'max-w-[260px] md:max-w-[280px] hover:scale-[1.02]'
      } rounded-xl border-2 transition-all duration-200 bg-background/80 backdrop-blur-sm ${
        quantityInCart > 0 ? 'border-[#23C45E] shadow-md' : 'border-border/50'
      } hover:shadow-lg`}
    >
      <CardContent className={isMobile ? 'p-4' : 'p-5'}>
        <div className={isMobile ? 'flex items-start gap-4' : ''}>
          {/* IMAGE */}
          <div
            className={
              isMobile
                ? 'w-20 h-20 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border/50 overflow-hidden'
                : 'w-full h-[160px] bg-muted rounded-xl flex items-center justify-center mb-4 border border-border/50 overflow-hidden'
            }
          >
            {vm.imageUrl ? (
              <img
                src={vm.imageUrl}
                alt={vm.name}
                className={
                  isMobile
                    ? 'w-full h-full object-cover rounded-xl'
                    : 'w-full h-full object-cover'
                }
              />
            ) : (
              <Package
                className={
                  isMobile
                    ? 'w-10 h-10 text-muted-foreground'
                    : 'w-16 h-16 text-muted-foreground'
                }
              />
            )}
          </div>

          {/* INFO */}
          <div className={isMobile ? 'flex-1 min-w-0 space-y-3' : 'space-y-4'}>
            <CardTitle className="text-base font-semibold line-clamp-2 leading-tight text-foreground">
              {vm.name}
            </CardTitle>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span
                  className={
                    isMobile
                      ? 'font-bold text-lg text-green-600'
                      : 'font-bold text-xl text-green-600'
                  }
                >
                  {formatQuantity(vm.priceUZS)} so'm
                </span>
                <span className="text-xs text-muted-foreground">Narx</span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <CardDescription
                  className={`${
                    isMobile ? 'h-7' : 'h-8'
                  } bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 flex items-center text-sm font-medium gap-1`}
                >
                  {formatQuantity(vm.amount)}{' '}
                  <span className="text-[10px]">
                    {vm.measure ? vm.measure : ''}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* ACTION */}
            {quantityInCart > 0 ? (
              <CartCounter id={vm.id} quantity={vm.amount} isSmall={isMobile} />
            ) : (
              <Button
                disabled={vm.amount <= 0}
                size="sm"
                className={`w-full ${
                  isMobile ? 'h-10' : 'h-11'
                } text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${
                  vm.amount <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  dispatch(updateCartItem({ id: vm.id, quantity: 1 }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Savatga qo'shish
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Cards({
  product,
  isMobile = false,
}: {
  product: Array<SaleItem>;
  isMobile?: boolean;
}) {
  return (
    <div
      className={`grid ${
        isMobile
          ? 'grid-cols-1 w-full gap-4'
          : 'grid-cols-[repeat(auto-fill,_minmax(260px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-6'
      } pt-6 pb-6`}
    >
      {product?.length ? (
        product.map((i) => (
          <EachCard isMobile={isMobile} key={String(i.id)} i={i} />
        ))
      ) : (
        <h2 className="text-center col-span-2">Mahsulotlar mavjud emas</h2>
      )}
    </div>
  );
}
