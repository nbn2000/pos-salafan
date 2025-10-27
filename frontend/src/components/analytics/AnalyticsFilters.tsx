import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Filter, 
  RotateCcw, 
  TrendingUp, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupBy, GetStatisticsArgs } from '@/api/analytics';

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: GetStatisticsArgs) => void;
  initialFilters?: GetStatisticsArgs;
  className?: string;
  isLoading?: boolean;
}

const groupByOptions = [
  { value: 'day' as GroupBy, label: 'Kunlik', icon: <Calendar className="h-4 w-4" /> },
  { value: 'week' as GroupBy, label: 'Haftalik', icon: <Clock className="h-4 w-4" /> },
  { value: 'month' as GroupBy, label: 'Oylik', icon: <TrendingUp className="h-4 w-4" /> },
];


export function AnalyticsFilters({ 
  onFiltersChange, 
  initialFilters = {}, 
  className,
  isLoading = false 
}: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<GetStatisticsArgs>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if filters have active values
  useEffect(() => {
    const active = !!(
      filters.createdFrom || 
      filters.createdTo || 
      filters.groupBy
    );
    setHasActiveFilters(active);
  }, [filters]);

  const handleFilterChange = (key: keyof GetStatisticsArgs, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: GetStatisticsArgs = {};
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getDateRangeText = () => {
    if (filters.createdFrom && filters.createdTo) {
      return `${new Date(filters.createdFrom).toLocaleDateString('uz-UZ')} - ${new Date(filters.createdTo).toLocaleDateString('uz-UZ')}`;
    }
    if (filters.createdFrom) {
      return `${new Date(filters.createdFrom).toLocaleDateString('uz-UZ')} dan`;
    }
    if (filters.createdTo) {
      return `${new Date(filters.createdTo).toLocaleDateString('uz-UZ')} gacha`;
    }
    return null;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
                <CardTitle className="text-lg font-semibold">Analitika Filtrlari</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ma'lumotlarni filtrlash va guruhlash
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
                    onClick={handleReset}
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
                
                {getDateRangeText() && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {getDateRangeText()}
                  </Badge>
                )}
                
                {filters.groupBy && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {groupByOptions.find(opt => opt.value === filters.groupBy)?.label}
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
                {/* Date Range Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Sana Oralig'i</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Boshlanish sanasi
                      </label>
                      <DatePicker
                        value={filters.createdFrom || null}
                        onChange={(value) => handleFilterChange('createdFrom', value)}
                        placeholder="Boshlanish sanasini tanlang"
                        disabled={isLoading}
                        maxDate={filters.createdTo ? new Date(filters.createdTo) : undefined}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Tugash sanasi
                      </label>
                      <DatePicker
                        value={filters.createdTo || null}
                        onChange={(value) => handleFilterChange('createdTo', value)}
                        placeholder="Tugash sanasini tanlang"
                        disabled={isLoading}
                        minDate={filters.createdFrom ? new Date(filters.createdFrom) : undefined}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Group By Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Guruhlash</h3>
                  </div>
                  
                  <Select
                    value={filters.groupBy || ''}
                    onValueChange={(value) => handleFilterChange('groupBy', value as GroupBy)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Guruhlash turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupByOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isLoading || !hasActiveFilters}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Tozalash
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
