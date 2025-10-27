import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { log } from 'console';

export function SearchInput({
  search,
  placeholder,
}: {
  search?: string;
  placeholder?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRender = useRef(true);

  const [text, setText] = useState(search ?? '');
  const [isSearching, setIsSearching] = useState(false);

  console.log(search);

  // Sync with external search prop changes (only on initial load)
  useEffect(() => {
    if (initialRender.current) {
      setText(search ?? '');
      initialRender.current = false;
    }
  }, [search]);

  // Manual search function
  const handleSearch = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    setIsSearching(true);
    
    if (!text.trim()) {
      searchParams.delete('search');
    } else {
      searchParams.set('search', text.trim());
    }
    
    // Reset to page 1 when searching
    searchParams.set('page', '1');

    const newSearch = searchParams.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    navigate(newUrl, { replace: true });
    setTimeout(() => setIsSearching(false), 300);
  }, [text, navigate]);

  // Clear search function
  const handleClear = useCallback(() => {
    setText('');
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('search');
    // Reset to page 1 when clearing search
    searchParams.set('page', '1');
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [navigate]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="relative flex items-center gap-2 md:w-[200px] lg:w-[320px] w-full ">
      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        type="search"
        placeholder={placeholder || 'Qidirish...'}
        className="w-full rounded-lg bg-background pl-8 pr-10 dark:caret-black caret-white"
        style={{ caretColor: 'auto' }}
      />
      
      {/* Clear button */}
      {text && !isSearching && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      {/* Search button inside input */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={isSearching}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-md"
      >
        {isSearching ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Search className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
