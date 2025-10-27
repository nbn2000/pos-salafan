import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Filter, 
  RotateCcw, 
  Search,
  Hash,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  X,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordsFiltersProps {
  // Current filter values
  q: string;
  clientId: string;
  productId: string;
  sortBy: 'createdAt' | 'totalSoldPrice';
  sortDir: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
  
  // Callbacks
  onFiltersChange: (filters: {
    q?: string;
    clientId?: string;
    productId?: string;
    sortBy?: 'createdAt' | 'totalSoldPrice';
    sortDir?: 'ASC' | 'DESC';
    createdFrom?: string;
    createdTo?: string;
  }) => void;
  onClearFilters: () => void;
  
  // UI state
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  
  className?: string;
  isLoading?: boolean;
}

type TimePeriod = 'weekly' | 'monthly' | 'yearly' | 'custom';

const timePeriodOptions = [
  { 
    value: 'weekly' as TimePeriod, 
    label: 'Bu hafta', 
    icon: <CalendarDays className="h-4 w-4" />,
    description: 'Dushanba dan bugun gacha'
  },
  { 
    value: 'monthly' as TimePeriod, 
    label: 'Bu oy', 
    icon: <Calendar className="h-4 w-4" />,
    description: 'Oy boshidan bugun gacha'
  },
  { 
    value: 'yearly' as TimePeriod, 
    label: 'Bu yil', 
    icon: <CalendarRange className="h-4 w-4" />,
    description: 'Yil boshidan bugun gacha'
  },
  { 
    value: 'custom' as TimePeriod, 
    label: 'Boshqa davr', 
    icon: <Clock className="h-4 w-4" />,
    description: 'O\'zingiz tanlang'
  },
];

export function RecordsFilters({
  q,
  clientId,
  productId,
  sortBy,
  sortDir,
  createdFrom,
  createdTo,
  onFiltersChange,
  onClearFilters,
  showFilters,
  onShowFiltersChange,
  className,
  isLoading = false
}: RecordsFiltersProps) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('custom');
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate time periods
  const getTimePeriodDates = (period: TimePeriod): { from: string; to: string } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'weekly': {
        // Get Monday of current week
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        
        return {
          from: monday.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      }
      case 'monthly': {
        // Get first day of current month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return {
          from: firstDay.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      }
      case 'yearly': {
        // Get first day of current year
        const firstDay = new Date(today.getFullYear(), 0, 1);
        
        return {
          from: firstDay.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        };
      }
      default:
        return null;
    }
  };

  // Detect current time period based on dates
  useEffect(() => {
    if (!createdFrom || !createdTo) {
      setSelectedTimePeriod('custom');
      return;
    }

    const weeklyDates = getTimePeriodDates('weekly');
    const monthlyDates = getTimePeriodDates('monthly');
    const yearlyDates = getTimePeriodDates('yearly');

    if (weeklyDates && createdFrom === weeklyDates.from && createdTo === weeklyDates.to) {
      setSelectedTimePeriod('weekly');
    } else if (monthlyDates && createdFrom === monthlyDates.from && createdTo === monthlyDates.to) {
      setSelectedTimePeriod('monthly');
    } else if (yearlyDates && createdFrom === yearlyDates.from && createdTo === yearlyDates.to) {
      setSelectedTimePeriod('yearly');
    } else {
      setSelectedTimePeriod('custom');
    }
  }, [createdFrom, createdTo]);

  const handleTimePeriodChange = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
    
    if (period === 'custom') {
      // Don't change dates, let user set them manually
      return;
    }
    
    const dates = getTimePeriodDates(period);
    if (dates) {
      onFiltersChange({
        createdFrom: dates.from,
        createdTo: dates.to
      });
    }
  };

  const hasActiveFilters = !!(q || clientId || productId || createdFrom || createdTo);
  const activeFiltersCount = [q, clientId, productId, createdFrom, createdTo].filter(Boolean).length;

  const getDateRangeText = () => {
    if (createdFrom && createdTo) {
      return `${new Date(createdFrom).toLocaleDateString('uz-UZ')} - ${new Date(createdTo).toLocaleDateString('uz-UZ')}`;
    }
    if (createdFrom) {
      return `${new Date(createdFrom).toLocaleDateString('uz-UZ')} dan`;
    }
    if (createdTo) {
      return `${new Date(createdTo).toLocaleDateString('uz-UZ')} gacha`;
    }
    return null;
  };

  if (!showFilters) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-full bg-primary/10"
              >
                <Filter className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-lg font-semibold">Qidiruv va Filtrlar</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Sotuvlar ro'yxatini filtrlash va qidirish
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Badge variant="secondary" className="px-2 py-1">
                    {activeFiltersCount} faol filtr
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-2"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Summary */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Faol filtrlar:</span>
                
                {q && (
                  <Badge variant="outline" className="text-xs">
                    <Search className="h-3 w-3 mr-1" />
                    "{q}"
                  </Badge>
                )}
                
                {getDateRangeText() && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {getDateRangeText()}
                  </Badge>
                )}
                
                {clientId && (
                  <Badge variant="outline" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    Mijoz ID
                  </Badge>
                )}
                
                {productId && (
                  <Badge variant="outline" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    Mahsulot ID
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-6">
                {/* Search Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Umumiy qidiruv
                  </Label>
                  <Input
                    placeholder="Mijoz nomi, mahsulot nomi yoki izoh bo'yicha qidiring..."
                    value={q}
                    onChange={(e) => onFiltersChange({ q: e.target.value })}
                    className="h-10"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Masalan: "Sardor", "Hola", "nimadur" kabi so'zlar bilan qidiring
                  </p>
                </div>

                <Separator />

                {/* Time Period Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Vaqt davri
                  </Label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timePeriodOptions.map((option) => (
                      <motion.div
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedTimePeriod === option.value ? "default" : "outline"}
                          onClick={() => handleTimePeriodChange(option.value)}
                          disabled={isLoading}
                          className={cn(
                            "w-full h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200",
                            selectedTimePeriod === option.value && "shadow-md"
                          )}
                        >
                          {option.icon}
                          <div className="text-center">
                            <div className="font-medium text-xs">{option.label}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {option.description}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Custom Date Range */}
                  {selectedTimePeriod === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Boshlanish sanasi
                        </Label>
                        <DatePicker
                          value={createdFrom || null}
                          onChange={(value) => onFiltersChange({ createdFrom: value || undefined })}
                          placeholder="Boshlanish sanasini tanlang"
                          disabled={isLoading}
                          maxDate={createdTo ? new Date(createdTo) : undefined}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Tugash sanasi
                        </Label>
                        <DatePicker
                          value={createdTo || null}
                          onChange={(value) => onFiltersChange({ createdTo: value || undefined })}
                          placeholder="Tugash sanasini tanlang"
                          disabled={isLoading}
                          minDate={createdFrom ? new Date(createdFrom) : undefined}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* ID Filters Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    Aniq ID bo'yicha filtr
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Mijoz ID
                      </Label>
                      <Input
                        placeholder="433cadec-7fd6-487a-bfda-b957be6c696c"
                        value={clientId}
                        onChange={(e) => onFiltersChange({ clientId: e.target.value })}
                        className="font-mono text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Mahsulot ID
                      </Label>
                      <Input
                        placeholder="857f839e-84ca-46d1-bc45-ef1984e137e2"
                        value={productId}
                        onChange={(e) => onFiltersChange({ productId: e.target.value })}
                        className="font-mono text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sorting Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Saralash
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Saralash maydoni
                      </Label>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => onFiltersChange({ sortBy: value as 'createdAt' | 'totalSoldPrice' })}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Yaratilgan sana
                            </div>
                          </SelectItem>
                          <SelectItem value="totalSoldPrice">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Jami narx
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Saralash yo'nalishi
                      </Label>
                      <Select
                        value={sortDir}
                        onValueChange={(value) => onFiltersChange({ sortDir: value as 'ASC' | 'DESC' })}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DESC">
                            <div className="flex items-center gap-2">
                              ⬇️ Yuqoridan pastga (Yangi → Eski / Katta → Kichik)
                            </div>
                          </SelectItem>
                          <SelectItem value="ASC">
                            <div className="flex items-center gap-2">
                              ⬆️ Pastdan yuqoriga (Eski → Yangi / Kichik → Katta)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {hasActiveFilters ? (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                      >
                        <CheckCircle className="h-3 w-3" />
                        {activeFiltersCount} ta filtr faol
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Hech qanday filtr yo'q
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearFilters}
                      disabled={!hasActiveFilters || isLoading}
                      className="flex items-center gap-2"
                    >
                      <X className="h-3 w-3" />
                      Tozalash
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onShowFiltersChange(false)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Qo'llash
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
