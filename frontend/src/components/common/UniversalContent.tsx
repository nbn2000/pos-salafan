import React from 'react';
import { Package } from 'lucide-react';
import { PaginationDemo } from '../paginations/pagination';

interface UniversalContentProps {
  isLoading: boolean;
  data: any[];
  children: React.ReactNode;
  totalPages?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  showPagination?: boolean;
  loadingText?: string;
  loadingSubtext?: string;
}

export function UniversalContent({
  isLoading,
  data,
  children,
  totalPages = 1,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDescription = "Qidiruv natijalariga mos keladigan ma'lumot mavjud emas. Filtrlarni o'zgartiring yoki boshqa kalit so'zlar bilan qayta urinib ko'ring.",
  emptyIcon = <Package className="h-12 w-12 text-muted-foreground" />,
  showPagination = true,
  loadingText = "Ma'lumotlar yuklanmoqda...",
  loadingSubtext = 'Iltimos kuting',
}: UniversalContentProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary/30"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            {loadingText}
          </p>
          <p className="text-sm text-muted-foreground/70">{loadingSubtext}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center">
            {emptyIcon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm text-muted-foreground">?</span>
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h3 className="text-2xl font-bold">{emptyTitle}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
        {showPagination && totalPages > 1 && (
          <div className="flex-shrink-0 flex justify-center border-t border-border/50 bg-background/50 rounded-xl p-3 md:p-6 mt-3 md:mb-6 mb-16 bgyell">
            <PaginationDemo totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
