'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-between items-center px-2',
        caption_label: 'text-sm font-semibold text-foreground',
        nav: 'flex items-center gap-2',
        nav_button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10'
        ),
        nav_button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10'
        ),
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'flex-1 rounded-md text-[0.7rem] uppercase text-muted-foreground',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative flex-1 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has(.day-range-end)]:rounded-r-md [&:has(.day-range-start)]:rounded-l-md',
          '[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected].day-outside)]:bg-transparent',
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 rounded-full p-0 font-normal text-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-0'
        ),
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'text-primary font-semibold',
        day_outside: 'text-muted-foreground/40 opacity-50',
        day_disabled: 'text-muted-foreground/50 opacity-50',
        day_range_middle: 'bg-primary/10 text-primary',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
