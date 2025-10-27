import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';

import { cn } from '@/lib/utils';
import { FormMessage } from '../ui/form';
import { Label } from '../ui/label';

export interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'defaultValue'
  > {
  name: string;
  title?: string;
  defaultValue?: string | number | null;
}

const Phone: React.FC<PhoneInputProps> = ({
  className,
  name,
  title,
  defaultValue,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? ''}
      render={({ field: { onChange, value, ref } }) => (
        <div className={cn('space-y-2', className)}>
          {title && <Label htmlFor={name}>{title}</Label>}
          <PatternFormat
            format="+998 (##) ### ## ##"
            id={name}
            mask=" "
            type="tel"
            getInputRef={ref}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-white dark:bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            )}
            onValueChange={(vals) => onChange(vals.value)}
            value={value}
            {...props}
          />
          {/* <FormMessage name={name} /> */}
        </div>
      )}
    />
  );
};

export { Phone };
