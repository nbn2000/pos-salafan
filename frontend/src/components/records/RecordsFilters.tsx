import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  X
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
  const [isExpanded, setIsExpanded] = useState(false);


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
