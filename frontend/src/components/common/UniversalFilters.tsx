import React from 'react';
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SearchSelect } from '../ui/search-select';

import { Button } from '../ui/button';
import { Filter, X, Calendar, Search, ArrowUpDown, Package } from 'lucide-react';
import { Label } from '../ui/label';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface UniversalFiltersProps {
  filters?: {
    showFilterIcon?: boolean;
    showFilter: boolean;
    onShowFilterChange?: (show: boolean) => void;
    onClearFilters?: () => void;
    price?: {
      minPrice?: number | '';
      maxPrice?: number | '';
      onMinPriceChange?: (value: number | '') => void;
      onMaxPriceChange?: (value: number | '') => void;
      showPriceFilter?: boolean;
    };
    sort?: {
      sortOrder?: 'az' | 'za' | '';
      onSortOrderChange?: (value: 'az' | 'za' | '') => void;
      showSortFilter?: boolean;
    };

    dateRange?: {
      startDate: string;
      endDate: string;
      onStartDateChange: (date: string) => void;
      onEndDateChange: (date: string) => void;
    };
    category?: {
      value: string;
      onValueChange: (value: string) => void;
      options: Array<{ id: string; label: string; value: string }>;
      searchValue: string;
      onSearchChange: (value: string) => void;
      placeholder?: string;
      searchPlaceholder?: string;
    };
    period?: {
      value: 'all' | 'yearly' | 'monthly' | 'daily';
      onValueChange: (value: 'all' | 'yearly' | 'monthly' | 'daily') => void;
      options?: Array<{ id: string; label: string; value: string }>;
    };
    paymentType?: {
      value: string;
      onValueChange: (value: string) => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    deleted?: {
      value: string;
      onValueChange: (value: string) => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    actionType?: {
      value: string;
      onValueChange: (value: string) => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    // Sale-specific filters
    searchField?: {
      value: string;
      onValueChange: (value: string) => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    sortField?: {
      value: string;
      onValueChange: (value: string) => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    sortOrder?: {
      value: 'ASC' | 'DESC';
      onValueChange: (value: 'ASC' | 'DESC') => void;
      options?: Array<{ id: string; label: string; value: string }>;
      placeholder?: string;
    };
    includeBatches?: {
      value: boolean;
      onValueChange: (value: boolean) => void;
      label?: string;
    };
    customFilters?: React.ReactNode;
  };
  isMobileCompact?: boolean; // Mobile compact versiya uchun
}

// Filter container wrapper component for consistent styling
const FilterContainer = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`space-y-2 ${className}`}>{children}</div>;

// Standard filter label component
const FilterLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-medium text-muted-foreground block">
    {children}
  </label>
);

// Standard button group component for period filters
const ButtonGroup = ({
  options,
  value,
  onValueChange,
  className = '',
}: {
  options: Array<{ id: string; label: string; value: string }>;
  value: string;
  onValueChange: (value: any) => void;
  className?: string;
}) => (
  <div className={`flex gap-2 flex-wrap ${className}`}>
    {options.map((option) => {
      const isActive = value === option.value;
      return (
        <Button
          key={option.id}
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => onValueChange(option.value)}
          className={`h-9 md:h-10 min-w-[80px] md:min-w-[100px] transition-all duration-200 ${
            isActive
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-background/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30'
          }`}
        >
          {option.label}
        </Button>
      );
    })}
  </div>
);

// Standard select component
const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  className = '',
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ id: string; label: string; value: string }>;
  className?: string;
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger
      className={`h-9 bg-background/80 backdrop-blur-sm border-border/50 transition-colors ${className}`}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.id} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// Standard input component
const FilterInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
}: {
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <Input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`h-9 bg-background/80 backdrop-blur-sm border-border/50 transition-colors ${className}`}
  />
);

export function UniversalFilters({
  filters,
  isMobileCompact = false,
}: UniversalFiltersProps) {
  // Agar filters undefined bo'lsa, null qaytar
  if (!filters) {
    return null;
  }

  const defaultPaymentTypeOptions = [
    { id: 'all', label: 'Barchasi', value: 'all' },
    { id: 'uzs', label: 'Naqd', value: 'uzs' },
    { id: 'card', label: 'Karta', value: 'card' },
    { id: 'debt', label: 'Qarz', value: 'debt' },
  ];

  const defaultActionTypeOptions = [
    { id: 'all', label: 'Barchasi', value: 'all' },
    { id: 'add', label: "Qo'shish", value: 'add' },
    { id: 'adjust', label: 'Moslashtirish', value: 'adjust' },
    { id: 'restock', label: "Qayta to'ldirish", value: 'restock' },
    { id: 'delete', label: "O'chirish", value: 'delete' },
  ];

  const defaultPeriodOptions = [
    { id: 'all', label: 'Barchasi', value: 'all' },
    { id: 'yearly', label: 'Yillik', value: 'yearly' },
    { id: 'monthly', label: 'Oylik', value: 'monthly' },
    { id: 'daily', label: 'Kunlik', value: 'daily' },
  ];

  const defaultDeletedOptions = [
    { id: 'all', label: 'Barchasi', value: 'all' },
    { id: 'active', label: 'Faol', value: 'active' },
    { id: 'deleted', label: "O'chirilgan", value: 'deleted' },
  ];

  const defaultSearchFieldOptions = [
    { id: 'name', label: 'Mahsulot nomi', value: 'name' },
  ];

  const defaultSortFieldOptions = [
    { id: 'createdAt', label: 'Yaratilgan sana', value: 'createdAt' },
    { id: 'name', label: 'Nomi', value: 'name' },
    { id: 'totalAmount', label: 'Umumiy miqdor', value: 'totalAmount' },
  ];

  const defaultSortOrderOptions = [
    { id: 'DESC', label: 'Kamayish', value: 'DESC' },
    { id: 'ASC', label: "O'sish", value: 'ASC' },
  ];

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.period && filters.period.value !== 'all') ||
      (filters.paymentType &&
        filters.paymentType.value !== 'all' &&
        filters.paymentType.value !== '') ||
      (filters.actionType &&
        filters.actionType.value !== 'all' &&
        filters.actionType.value !== '') ||
      (filters.category && filters.category.value !== '') ||
      (filters.dateRange &&
        (filters.dateRange.startDate || filters.dateRange.endDate)) ||
      (filters.price && (filters.price.minPrice || filters.price.maxPrice)) ||
      (filters.sort && filters.sort.sortOrder !== '')
    );
  };

  // Mobile compact versiya - faqat filter button
  if (isMobileCompact) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => filters.onShowFilterChange?.(!filters.showFilter)}
        className="h-8 md:h-10 px-3 md:px-4 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group"
      >
        <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:text-primary transition-colors" />
      </Button>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Custom filters rendered outside collapsible */}
      {filters.customFilters && (
        <div className="space-y-3 md:space-y-4">{filters.customFilters}</div>
      )}

      {filters.showFilter && (
        <div className="mt-3 md:mt-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-3 md:p-5 lg:p-6 bg-muted/20 rounded-lg border border-border/50">
            {/* Period Filter */}
            {filters.period && (
              <FilterContainer className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <FilterLabel>Davr bo'yicha</FilterLabel>
                <ButtonGroup
                  options={filters.period.options || defaultPeriodOptions}
                  value={filters.period.value}
                  onValueChange={filters.period.onValueChange}
                />
              </FilterContainer>
            )}

            {/* Payment Type Filter */}
            {filters.paymentType && (
              <FilterContainer>
                <FilterLabel>To'lov turi</FilterLabel>
                <FilterSelect
                  value={filters.paymentType.value}
                  onValueChange={filters.paymentType.onValueChange}
                  placeholder={filters.paymentType.placeholder || "To'lov turi"}
                  options={
                    filters.paymentType.options || defaultPaymentTypeOptions
                  }
                />
              </FilterContainer>
            )}

            {/* Deleted Filter */}
            {filters.deleted && (
              <FilterContainer className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <FilterLabel>O'chirilgan</FilterLabel>
                <ButtonGroup
                  options={filters.deleted.options || defaultDeletedOptions}
                  value={filters.deleted.value}
                  onValueChange={filters.deleted.onValueChange}
                />
              </FilterContainer>
            )}

            {/* Action Type Filter */}
            {filters.actionType && (
              <FilterContainer>
                <FilterLabel>Amal turi</FilterLabel>
                <FilterSelect
                  value={filters.actionType.value}
                  onValueChange={filters.actionType.onValueChange}
                  placeholder={filters.actionType.placeholder || 'Amal turi'}
                  options={
                    filters.actionType.options || defaultActionTypeOptions
                  }
                />
              </FilterContainer>
            )}

            {/* Category Filter */}
            {filters.category && (
              <FilterContainer>
                <FilterLabel>Kategoriya</FilterLabel>
                <SearchSelect
                  value={filters.category.value}
                  onValueChange={filters.category.onValueChange}
                  placeholder={
                    filters.category.placeholder || "Kategoriya bo'yicha"
                  }
                  searchPlaceholder={
                    filters.category.searchPlaceholder || 'Kategoriya qidirish'
                  }
                  options={filters.category.options}
                  onSearchChange={filters.category.onSearchChange}
                  searchValue={filters.category.searchValue}
                  className="h-8 md:h-9 bg-background/80"
                />
              </FilterContainer>
            )}

            {/* Search Field Filter */}
            {filters.searchField && (
              <FilterContainer>
                <FilterLabel>Qidirish maydoni</FilterLabel>
                <FilterSelect
                  value={filters.searchField.value}
                  onValueChange={filters.searchField.onValueChange}
                  placeholder={filters.searchField.placeholder || 'Qidirish maydonini tanlang'}
                  options={filters.searchField.options || defaultSearchFieldOptions}
                />
              </FilterContainer>
            )}

            {/* Sort Field Filter */}
            {filters.sortField && (
              <FilterContainer>
                <FilterLabel>Saralash maydoni</FilterLabel>
                <FilterSelect
                  value={filters.sortField.value}
                  onValueChange={filters.sortField.onValueChange}
                  placeholder={filters.sortField.placeholder || 'Saralash maydonini tanlang'}
                  options={filters.sortField.options || defaultSortFieldOptions}
                />
              </FilterContainer>
            )}

            {/* Sort Order Filter */}
            {filters.sortOrder && (
              <FilterContainer>
                <FilterLabel>Saralash tartibi</FilterLabel>
                <FilterSelect
                  value={filters.sortOrder.value}
                  onValueChange={(value) => filters.sortOrder!.onValueChange(value as 'ASC' | 'DESC')}
                  placeholder={filters.sortOrder.placeholder || 'Saralash tartibini tanlang'}
                  options={filters.sortOrder.options || defaultSortOrderOptions}
                />
              </FilterContainer>
            )}

            {/* Include Batches Toggle */}
            {filters.includeBatches && (
              <FilterContainer>
                <div className="flex items-center justify-between">
                  <FilterLabel>{filters.includeBatches.label || "Partiya ma'lumotlarini ko'rsatish"}</FilterLabel>
                  <Button
                    type="button"
                    variant={filters.includeBatches.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => filters.includeBatches!.onValueChange(!filters.includeBatches!.value)}
                    className="h-8 px-3"
                  >
                    {filters.includeBatches.value ? "Yoqilgan" : "O'chirilgan"}
                  </Button>
                </div>
              </FilterContainer>
            )}

            {/* Date Range Filter */}
            {filters.dateRange && (
              <FilterContainer className="md:col-span-2">
                <FilterLabel>Sana oralig'i</FilterLabel>
                <div className="grid grid-cols-2 gap-2">
                  <DatePicker
                    value={filters.dateRange.startDate || null}
                    onChange={(val) =>
                      filters.dateRange!.onStartDateChange(val ?? '')
                    }
                    placeholder="Boshlanish sana"
                    buttonClassName="h-8 md:h-9 w-full"
                    clearButtonClassName="h-8 w-8 md:h-9 md:w-9"
                  />
                  <DatePicker
                    value={filters.dateRange.endDate || null}
                    onChange={(val) =>
                      filters.dateRange!.onEndDateChange(val ?? '')
                    }
                    placeholder="Tugash sana"
                    buttonClassName="h-8 md:h-9 w-full"
                    clearButtonClassName="h-8 w-8 md:h-9 md:w-9"
                  />
                </div>
              </FilterContainer>
            )}

            {/* Price Filter */}
            {filters.price && (
              <FilterContainer className="md:col-span-2">
                <FilterLabel>Narx oralig'i</FilterLabel>
                <div className="grid grid-cols-2 gap-2">
                  <FilterInput
                    type="number"
                    placeholder="Min narx"
                    value={filters.price.minPrice}
                    onChange={(e) =>
                      filters.price?.onMinPriceChange?.(
                        Number(e.target.value) || ''
                      )
                    }
                    className="h-8 md:h-9"
                  />
                  <FilterInput
                    type="number"
                    placeholder="Max narx"
                    value={filters.price.maxPrice}
                    onChange={(e) =>
                      filters.price?.onMaxPriceChange?.(
                        Number(e.target.value) || ''
                      )
                    }
                    className="h-8 md:h-9"
                  />
                </div>
              </FilterContainer>
            )}

            {filters.sort && (
              <FilterContainer>
                <FilterLabel>Saralash</FilterLabel>
                <FilterSelect
                  value={filters.sort.sortOrder || ''}
                  onValueChange={(value) =>
                    filters.sort?.onSortOrderChange?.(value as 'az' | 'za' | '')
                  }
                  placeholder="Saralash turini tanlang"
                  options={[
                    { id: 'az', label: 'A → Z', value: 'az' },
                    { id: 'za', label: 'Z → A', value: 'za' },
                  ]}
                  className="h-8 md:h-9"
                />
              </FilterContainer>
            )}
          </div>

          {/* Clear Filters Button */}
          {filters.onClearFilters && hasActiveFilters() && (
            <div className="flex justify-end pt-3 md:pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={filters.onClearFilters}
                className="flex items-center gap-1.5 md:gap-2 h-8 md:h-9 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-colors"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Filtrni tozalash</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
