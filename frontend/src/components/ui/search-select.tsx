import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSelectOption {
  id: number | string;
  label: string;
  value: string;
}

interface SearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchSelectOption[];
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  debounceMs?: number;
  enableLocalFilter?: boolean; // New prop for local filtering optimization
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Tanlang',
  searchPlaceholder = 'Qidirish...',
  options,
  onSearchChange,
  searchValue = '',
  disabled = false,
  className,
  loading = false,
  debounceMs = 400,
  enableLocalFilter = false,
}) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [displaySearchValue, setDisplaySearchValue] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Use internal search value if onSearchChange is not provided
  const currentSearchValue = onSearchChange ? searchValue : internalSearchValue;
  
  // Debounce the search for backend calls
  const debouncedSearchValue = useDebounce(displaySearchValue, debounceMs);
  
  // Optimize filtering with useMemo - especially important when enableLocalFilter is true
  const filteredOptions = useMemo(() => {
    // If enableLocalFilter is true and we have external search, use local filtering
    if (enableLocalFilter && onSearchChange) {
      const searchTerm = localSearchTerm.toLowerCase();
      if (!searchTerm) return options;
      return options.filter(option => 
        option.label.toLowerCase().includes(searchTerm)
      );
    }
    
    // Otherwise use the existing logic
    if (onSearchChange) {
      return options;
    }
    
    return options.filter(option => 
      option.label.toLowerCase().includes(currentSearchValue.toLowerCase())
    );
  }, [options, enableLocalFilter, onSearchChange, localSearchTerm, currentSearchValue]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Determine dropdown direction on open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(320, filteredOptions.length * 40 + 60); // estimate
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setOpenDirection('up');
      } else {
        setOpenDirection('down');
      }
    }
  }, [isOpen, filteredOptions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onValueChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (displaySearchValue) {
          // First escape clears search, second escape closes dropdown
          handleSearchChange('');
        } else {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const selectedOption = options.find((option) => option.value === value);
  
  // Handle debounced search for external handlers (skip if local filtering)
  useEffect(() => {
    if (onSearchChange && !enableLocalFilter) {
      onSearchChange(debouncedSearchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue]); // Only run when debounced value changes, not when handlers change

  const handleSearchChange = useCallback((newValue: string) => {
    setDisplaySearchValue(newValue);
    
    // For local filtering
    if (enableLocalFilter) {
      setLocalSearchTerm(newValue);
    } else if (!onSearchChange) {
      // For internal search without external handler
      setInternalSearchValue(newValue);
    }
    // Note: External search is handled by the debounced useEffect above
  }, [enableLocalFilter, onSearchChange]);


  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between h-9"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="truncate text-left flex-1 min-w-0">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {loading ? (
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 right-0 z-50 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md',
            openDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'
          )}
        >
          <div className="p-2">
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={displaySearchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="mb-2 pr-8"
                disabled={loading}
              />
              {displaySearchValue && !loading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {loading && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-auto">
            {loading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Qidirilmoqda...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                {displaySearchValue.trim() ? 'Hech narsa topilmadi' : 'Ma\'lumot yo\'q'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    index === highlightedIndex &&
                      'bg-accent text-accent-foreground',
                    option.value === value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option.value);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHighlightedIndex(index);
                  }}
                >
                  <span className="truncate flex-1 min-w-0">{option.label}</span>
                  {option.value === value && (
                    <Check className="ml-2 h-4 w-4 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
