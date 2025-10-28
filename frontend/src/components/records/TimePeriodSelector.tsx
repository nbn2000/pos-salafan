import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Calendar, 
  CalendarDays,
  CalendarRange,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TimePeriod = 'weekly' | 'monthly' | 'yearly' | 'custom';

const timePeriodOptions = [
  { 
    value: 'weekly' as TimePeriod, 
    label: 'Bu hafta', 
    icon: <CalendarDays className="h-4 w-4" />
  },
  { 
    value: 'monthly' as TimePeriod, 
    label: 'Bu oy', 
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    value: 'yearly' as TimePeriod, 
    label: 'Bu yil', 
    icon: <CalendarRange className="h-4 w-4" />
  },
  { 
    value: 'custom' as TimePeriod, 
    label: 'Barchasi', 
    icon: <Clock className="h-4 w-4" />
  },
];

interface TimePeriodSelectorProps {
  createdFrom?: string;
  createdTo?: string;
  onDateRangeChange: (dates: { createdFrom?: string; createdTo?: string }) => void;
  isLoading?: boolean;
  className?: string;
}

export function TimePeriodSelector({
  createdFrom,
  createdTo,
  onDateRangeChange,
  isLoading = false,
  className
}: TimePeriodSelectorProps) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('custom');

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
      // "Barchasi" - clear all dates (no date filter)
      onDateRangeChange({
        createdFrom: undefined,
        createdTo: undefined
      });
      return;
    }
    
    const dates = getTimePeriodDates(period);
    if (dates) {
      onDateRangeChange({
        createdFrom: dates.from,
        createdTo: dates.to
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Compact Time Period Buttons */}
      {timePeriodOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedTimePeriod === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleTimePeriodChange(option.value)}
          disabled={isLoading}
          className={cn(
            "h-10 px-3 flex items-center gap-2 whitespace-nowrap",
            "transition-all duration-200",
            selectedTimePeriod === option.value 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {option.icon}
          <span className="text-sm font-medium">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
