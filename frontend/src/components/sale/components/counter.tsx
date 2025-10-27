import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Counter = React.memo(function Counter({
  value,
  onChange,
  min = 1,
  max = 999999,
  size = 'md',
  disabled = false,
}: CounterProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoize size classes to prevent recalculation on every render
  const sizeClasses = useMemo(
    () => ({
      sm: {
        container: 'gap-1 p-0 h-10 items-center',
        button: 'w-7 h-10 p-0 rounded-md',
        input: 'w-10 h-8 text-sm',
        icon: 'w-5 h-5',
      },
      md: {
        container: 'gap-2 p-1.5',
        button: 'w-8 h-10 p-0 rounded-md',
        input: 'w-12 h-8 text-sm',
        icon: 'w-5 h-5',
      },
      lg: {
        container: 'gap-3 p-2',
        button: 'w-10 h-10 p-0 rounded-md',
        input: 'w-16 h-8 text-base',
        icon: 'w-6 h-6',
      },
    }),
    []
  );

  const classes = sizeClasses[size];

  // Reset input value when value prop changes and we're not editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue('');
    }
  }, [value, isEditing]);

  // Optimized event handlers with useCallback
  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
    setIsEditing(false);
    inputRef.current?.blur();
  }, [disabled, min, value, onChange]);

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
    setIsEditing(false);
    inputRef.current?.blur();
  }, [disabled, max, value, onChange]);

  // Separate handlers for keyboard events that don't blur the input
  const handleKeyboardDecrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
    setIsEditing(false);
  }, [disabled, min, value, onChange]);

  const handleKeyboardIncrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
    setIsEditing(false);
  }, [disabled, max, value, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty string without changing the value immediately
      if (newValue === '') {
        setInputValue('');
        return;
      }

      // Only allow numbers
      const numericValue = newValue.replace(/\D/g, '');
      setInputValue(numericValue);

      // Update on every keystroke only if there's a valid number
      const numValue = parseInt(numericValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onChange(clampedValue);
      }
    },
    [min, max, onChange]
  );

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);

    if (inputValue === '') {
      // If input is empty, keep the current value instead of setting to min
      setInputValue('');
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setInputValue('');
  }, [inputValue, min, max, onChange]);

  // Separate handler for Enter key that preserves current value
  const handleEnterKey = useCallback(() => {
    setIsEditing(false);

    if (inputValue === '') {
      // If input is empty, keep the current value instead of setting to min
      setInputValue('');
      inputRef.current?.blur();
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setInputValue('');
    inputRef.current?.blur();
  }, [inputValue, min, max, onChange]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(value.toString());
    // Select all text when focused
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleEnterKey();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleKeyboardIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleKeyboardDecrement();
      }
    },
    [handleEnterKey, handleKeyboardIncrement, handleKeyboardDecrement]
  );

  // Memoize button disabled states
  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  return (
    <div
      className={`flex w-full justify-center items-center bg-muted rounded-md ${classes.container} ${disabled ? 'opacity-50' : ''}`}
    >
      <Button
        variant="ghost"
        size="sm"
        className={`${classes.button} hover:bg-background/80 border border-transparent hover:border-border transition-all p-0`}
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
      >
        <Minus className={classes.icon} />
      </Button>

      <div className="flex items-center px-0">
        <div className="w-px h-6 bg-border/50"></div>
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={isEditing ? inputValue : value.toString()}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${classes.input} text-center border-0 bg-transparent p-0 focus:ring-0 focus:outline-none font-semibold`}
        />
        <div className="w-px h-6 bg-border/50"></div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={`${classes.button} hover:bg-background/80 border border-transparent hover:border-border transition-all !p-0`}
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
      >
        <Plus className={classes.icon} />
      </Button>
    </div>
  );
});
