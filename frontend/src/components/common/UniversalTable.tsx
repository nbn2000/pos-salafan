import React, { useState, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { date, formatQuantity, formatPhoneNumber } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Hash,
  User,
  Box,
  Calendar,
  Phone,
  AtSign,
  ShoppingCart,
  CreditCard,
  Clock,
  Activity,
  TrendingUp,
  Calculator,
  Minus,
  ArrowUpDown,
  MessageSquare,
  Plus,
  Edit,
  Truck,
  Store,
} from 'lucide-react';
import { PaginationDemo } from '../paginations/pagination';

// Generic table column interface
interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  icon?: ReactNode;
  render?: (item: T) => ReactNode;
  hidden?: boolean;
  width?: string;
  responsive?: 'sm' | 'md' | 'lg' | 'xl'; // Bootstrap-style responsive breakpoints
}

// Universal table props interface
interface UniversalTableProps<T> {
  data: T[];
  total_pages?: number;
  isLoading: boolean;
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  navigateToDetail?: (item: T) => string; // URL generator function
  dropdownComponent?: React.ComponentType<{
    item: T;
    onRowClick: (e: React.MouseEvent) => void;
  }>;
  detailDialogComponent?: React.ComponentType<{
    onClose: () => void;
    open: boolean;
    item: T | null;
  }>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  skeletonComponent?: React.ComponentType<{ number: number }>;
  rowClassName?: (item: T) => string;
  enableHoverEffect?: boolean;
  isUsd?: boolean;
  currentPage?: number;
  pageSize?: number;
}

// Default renderers for common data types
const createDefaultRenderers = <T,>(
  isUsd: boolean = false
): Record<string, (item: T) => ReactNode> => ({
  // ID renderers
  id: (item: any) => (
    <div className="flex items-center gap-2">
      <Hash className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium text-sm">#{item.id}</span>
    </div>
  ),

  // Name renderers
  name: (item: any) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
        <Package className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="font-medium text-sm">{item.name}</div>
        {item.category && (
          <div className="text-xs text-muted-foreground">
            {item.category.name}
          </div>
        )}
      </div>
    </div>
  ),

  full_name: (item: any) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="text-primary text-sm font-semibold">
          {item.full_name?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
      <span className="font-medium">{item.full_name}</span>
    </div>
  ),

  username: (item: any) => (
    <div className="flex items-center gap-2">
      <AtSign className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{item.username}</span>
    </div>
  ),

  // SKU renderer
  sku: (item: any) => (
    <div className="flex items-center gap-2">
      <Hash className="h-3 w-3 text-muted-foreground" />
      <span className="font-mono text-sm">{item.sku}</span>
    </div>
  ),

  // Product type renderer
  product_type: (item: any) => (
    <Badge
      variant={item.product_type === 'PIECE' ? 'default' : 'secondary'}
      className="text-xs"
    >
      {item.product_type === 'PIECE' ? 'Dona' : 'KG'}
    </Badge>
  ),

  // Supplier renderer
  supplier: (item: any) => (
    <div className="flex items-center gap-2">
      <User className="h-3 w-3 text-muted-foreground" />
      <span className="text-sm">
        {item.supplier?.full_name || 'Tanlanmagan'}
      </span>
    </div>
  ),

  // Quantity renderers
  total_quantity: (item: any) => (
    <div className="flex items-center gap-2">
      <Box className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium text-sm">
        {formatQuantity(item.total_quantity) ?? '-'}
      </span>
    </div>
  ),

  quantity: (item: any) => (
    <div className="flex items-center gap-2">
      <Box className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium text-sm">
        {formatQuantity(item.quantity) ?? '-'}
      </span>
    </div>
  ),

  // Price renderers
  sold_price: (item: any) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-green-600">
        {formatQuantity(item.sold_price)} so'm
      </span>
    </div>
  ),

  buy_price: (item: any) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-blue-600">
        {formatQuantity(item.buy_price)} {item.currency ?? "so'm"}
      </span>
    </div>
  ),

  total_amount: (item: any) => (
    <div className="flex items-center gap-2">
      <Calculator className="h-3 w-3 text-green-600" />
      <span className="font-semibold text-sm text-green-600">
        {formatQuantity(item.total_amount || item.total_sold)} so'm
      </span>
    </div>
  ),

  total_price: (item: any) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-green-600">
        {formatQuantity(item.buy_price * item.amount)} {item.currency}
      </span>
    </div>
  ),

  total_paid: (item: any) => (
    <div className="flex items-center gap-2">
      <CreditCard className="h-3 w-3 text-green-600" />
      <span className="font-semibold text-sm text-green-600">
        {formatQuantity(item.total_paid || 0)} so'm
      </span>
    </div>
  ),

  remained: (item: any) => {
    const totalAmount = item.total_sold || item.total_amount || 0;
    const totalPaid = item.total_paid || 0;
    const remained = totalAmount - totalPaid;
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-orange-600" />
        <span className="font-semibold text-sm text-orange-600">
          {formatQuantity(remained)} so'm
        </span>
      </div>
    );
  },

  // Phone number renderer
  phone_number: (item: any) => (
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">
        {formatPhoneNumber(item.phone_number)}
      </span>
    </div>
  ),

  // Debt renderer for nested debt object
  debt: (item: any) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-red-600">
        {item.debt} {isUsd ? '$' : "so'm"}
      </span>
    </div>
  ),
  credit: (item: any) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-green-600">
        {item.credit} {isUsd ? '$' : "so'm"}
      </span>
    </div>
  ),

  // Date renderers
  createdAt: (item: any) => (
    <div className="flex items-center gap-2">
      <Calendar className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {item.createdAt && date(item.createdAt)}
      </span>
    </div>
  ),

  updatedAt: (item: any) => (
    <div className="flex items-center gap-2">
      <Clock className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {date(item.updated_at)}
      </span>
    </div>
  ),

  date_joined: (item: any) => (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {date(item.date_joined)}
      </span>
    </div>
  ),

  // Exchange rate renderer
  exchange_rate: (item: any) => (
    <div className="flex items-center justify-center">
      {item.exchange_rate ? (
        <Badge variant="outline" className="text-xs">
          <ArrowUpDown className="h-3 w-3 mr-1" />
          {formatQuantity(item.exchange_rate)} so'm
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )}
    </div>
  ),

  // Action renderer
  action: (item: any) => {
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'Add':
          return <Plus className="h-3 w-3" />;
        case 'Delete':
          return <Minus className="h-3 w-3" />;
        case 'Adjust':
          return <Edit className="h-3 w-3" />;
        default:
          return <Package className="h-3 w-3" />;
      }
    };

    const getActionVariant = (action: string) => {
      switch (action) {
        case 'Add':
          return 'default';
        case 'Delete':
          return 'destructive';
        case 'Adjust':
          return 'secondary';
        default:
          return 'outline';
      }
    };

    const getActionText = (action: string) => {
      switch (action) {
        case 'Add':
          return "Qo'shildi";
        case 'Adjust':
          return "O'zgartirildi";
        case 'Delete':
          return "O'chirildi";
        case 'Restock':
          return "Qayta to'ldirildi";
        default:
          return action;
      }
    };

    return (
      <Badge
        variant={getActionVariant(item.action)}
        className="flex items-center gap-1"
      >
        {getActionIcon(item.action)}
        {getActionText(item.action)}
      </Badge>
    );
  },

  // Note renderer
  note: (item: any) => (
    <div className="max-w-[150px] md:max-w-[200px] truncate text-sm text-muted-foreground">
      {item.note || '-'}
    </div>
  ),

  // Author renderer
  author: (item: any) => (
    <div className="flex items-center gap-2">
      <User className="h-3 w-3 text-muted-foreground" />
      <span className="text-sm">{item.author || '-'}</span>
    </div>
  ),

  // Debtor renderer
  debtor: (item: any) => (
    <div className="flex items-center gap-2">
      <User className="h-3 w-3 text-muted-foreground" />
      <span className="text-sm">{item.debtor?.full_name || "Yo'q"}</span>
    </div>
  ),

  // Actions renderer
  actions: (item: any) => null, // Will be handled by dropdownComponent
});

// Helper function to get responsive classes
const getResponsiveClasses = (responsive?: 'sm' | 'md' | 'lg' | 'xl') => {
  switch (responsive) {
    case 'sm':
      return 'hidden sm:table-cell';
    case 'md':
      return 'hidden md:table-cell';
    case 'lg':
      return 'hidden lg:table-cell';
    case 'xl':
      return 'hidden xl:table-cell';
    default:
      return '';
  }
};

// 🔒 Helper: determine if a click is on an interactive element
const isInteractive = (el: HTMLElement | null) => {
  return Boolean(
    el?.closest(
      [
        'button',
        'a',
        'input',
        'textarea',
        'select',
        'summary',
        '[role="button"]',
        '[role="menuitem"]',
        '[role="link"]',
        '[data-ignore-row-click]',
      ].join(',')
    )
  );
};

export function UniversalTable<T extends Record<string, any>>({
  data,
  total_pages = 1,
  isLoading,
  columns,
  onRowClick,
  navigateToDetail,
  dropdownComponent: DropdownComponent,
  detailDialogComponent: DetailDialogComponent,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDescription = "Qidiruv natijalariga mos keladigan ma'lumot mavjud emas",
  emptyIcon = <Package className="h-8 w-8 text-muted-foreground" />,
  skeletonComponent: SkeletonComponent,
  rowClassName,
  enableHoverEffect = true,
  isUsd,
  currentPage = 1,
  pageSize = 6,
}: UniversalTableProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const navigate = useNavigate();

  const defaultRenderers = createDefaultRenderers<T>(isUsd);

  const handleRowClick = (event: React.MouseEvent, item: T) => {
    const target = event.target as HTMLElement;
    const current = event.currentTarget as HTMLElement;

    // ✅ Only react to primary button clicks that actually occurred inside this row
    if (event.defaultPrevented) return;
    if (event.button !== 0) return; // left-click only
    if (!current.contains(target)) return; // ignore events coming from portals/overlays
    if (isInteractive(target)) return; // ignore clicks on interactive controls

    // Proceed with row action
    event.stopPropagation();

    if (onRowClick) {
      onRowClick(item);
    } else if (navigateToDetail) {
      navigate(navigateToDetail(item));
    } else {
      setSelectedItem(item);
    }
  };

  const handleDialogClose = () => setSelectedItem(null);

  const getDefaultSkeletonRow = () => (
    <TableRow>
      {columns.map((_, index) => (
        <TableCell key={index} className="py-3 md:py-4 px-2 md:px-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="w-20 h-4 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <>
      <div className="w-full overflow-x-auto border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
        <Table className="min-w-[320px] sm:min-w-[600px] md:min-w-[800px] w-full">
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-muted/50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`py-3 md:py-4 px-2 md:px-3 font-semibold text-sm ${
                    column.hidden ? 'hidden md:table-cell' : ''
                  } ${column.responsive ? getResponsiveClasses(column.responsive) : ''} ${
                    column.width || ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.icon}
                    {column.header}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SkeletonComponent ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonComponent key={i} number={columns.length} />
                ))
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <React.Fragment key={i}>
                    {getDefaultSkeletonRow()}
                  </React.Fragment>
                ))
              )
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className={`
                    cursor-pointer transition-all duration-200 group border-b border-border/30
                    ${index % 2 === 0 ? 'bg-background/50' : 'bg-muted/10'}
                    ${enableHoverEffect ? 'hover:bg-primary/5 hover:shadow-sm' : ''}
                    ${rowClassName ? rowClassName(item) : ''}
                  `}
                  onClick={(e) => handleRowClick(e, item)}
                >
                  {columns.map((column, columnIndex) => (
                    <TableCell
                      key={columnIndex}
                      className={`py-3 md:py-4 px-2 md:px-3 ${
                        column.hidden ? 'hidden md:table-cell' : ''
                      } ${column.responsive ? getResponsiveClasses(column.responsive) : ''}`}
                    >
                      {column.render ? (
                        column.render(item)
                      ) : column.key === 'actions' && DropdownComponent ? (
                        <div className="flex items-center justify-start">
                          <DropdownComponent
                            item={item}
                            onRowClick={(e) => {
                              // prevent bubbling to the row
                              e.stopPropagation();
                            }}
                          />
                        </div>
                      ) : defaultRenderers[column.key as string] ? (
                        defaultRenderers[column.key as string](item)
                      ) : column.key === 'index' ? (
                        `# ${(currentPage - 1) * pageSize + index + 1}`
                      ) : (
                        item[column.key] || '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                        {emptyIcon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{emptyTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {emptyDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && total_pages > 1 && (
        <div
          className="w-full flex justify-center pt-6 border-t border-border/50 bg-background/50 rounded-xl p-3 md:p-6"
          style={{
            display: 'flex',
            visibility: 'visible',
            zIndex: 999,
            backgroundColor: 'var(--background)',
            marginTop: '1rem',
          }}
        >
          <PaginationDemo totalPages={Math.max(total_pages, 1)} />
        </div>
      )}

      {DetailDialogComponent && selectedItem && (
        <DetailDialogComponent
          onClose={handleDialogClose}
          open={!!selectedItem}
          item={selectedItem}
        />
      )}
    </>
  );
}
