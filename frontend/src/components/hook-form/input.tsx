import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormMessage } from '../ui/form';
import { Label } from '../ui/label';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  title?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  title,
  type = 'text',
  name,
  ...props
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('space-y-2', className)}>
          {title && <Label htmlFor={name}>{title}</Label>}
          <input
            id={name}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-white dark:bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...field}
            {...props}
          />
          <FormMessage name={name} />
        </div>
      )}
    />
  );
};

export { Input };
