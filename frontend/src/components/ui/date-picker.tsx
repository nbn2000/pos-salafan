'use client';

import * as React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { Matcher } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  clearButtonClassName?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sanani tanlang',
  className,
  buttonClassName,
  clearButtonClassName,
  disabled = false,
  minDate,
  maxDate,
  clearable = true,
  open: openProp,
  onOpenChange,
}: DatePickerProps) {
  const parsedValue = React.useMemo(() => {
    if (!value) return undefined;
    const direct = new Date(value);
    if (isValid(direct)) return direct;
    const iso = parseISO(value);
    return isValid(iso) ? iso : undefined;
  }, [value]);

  const disabledDays = React.useMemo<Matcher | Matcher[] | undefined>(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    if (matchers.length === 0) return undefined;
    if (matchers.length === 1) return matchers[0];
    return matchers;
  }, [minDate, maxDate]);

  const handleSelect = (date?: Date) => {
    if (!date || !isValid(date)) {
      onChange?.(null);
      return;
    }
    onChange?.(format(date, 'yyyy-MM-dd'));
  };

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? !!openProp : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  React.useEffect(() => {
    if (disabled) {
      handleOpenChange(false);
    }
  }, [disabled]);

  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-9 bg-background/80 border-border/50',
              !parsedValue && 'text-muted-foreground',
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {parsedValue ? format(parsedValue, 'dd.MM.yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedValue}
              onSelect={handleSelect}
              disabled={disabledDays}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>
      {clearable && value && !disabled && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onChange?.(null)}
          className={cn(
            'h-8 w-8 text-muted-foreground hover:text-destructive',
            clearButtonClassName
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
