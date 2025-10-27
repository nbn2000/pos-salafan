import type { InputHTMLAttributes } from 'react';
import { NumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Input } from '@/components/ui/input';

type BaseProps = Omit<
  NumericFormatProps<InputHTMLAttributes<HTMLInputElement>>,
  'value' | 'defaultValue' | 'customInput' | 'onValueChange'
>;

interface CurrencyInputProps<TFieldValues extends FieldValues>
  extends BaseProps {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  onValueChange?: (value: string) => void;
}

export function CurrencyInput<TFieldValues extends FieldValues>({
  name,
  control,
  onValueChange,
  thousandSeparator = ' ',
  decimalSeparator = '.',
  allowNegative = false,
  ...props
}: CurrencyInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <NumericFormat
          {...props}
          value={field.value ?? ''}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          allowNegative={allowNegative}
          onValueChange={(vals) => {
            field.onChange(vals.value);
            onValueChange?.(vals.value);
          }}
          getInputRef={field.ref}
          onBlur={(event) => {
            field.onBlur();
            props.onBlur?.(event);
          }}
          customInput={Input}
        />
      )}
    />
  );
}
