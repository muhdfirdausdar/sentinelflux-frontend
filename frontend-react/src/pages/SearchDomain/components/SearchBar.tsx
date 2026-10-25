import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { sanitizeDomainSearch } from '../../../utils/inputSanitizer';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search domains across all fields..."
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      try {
        sanitizeDomainSearch(value);
        setError(null);
        onSearch(value);
      } catch (err: any) {
        setError(err?.message || 'Invalid search term');
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <h3 className="font-medium text-sm" style={{ color: 'var(--card-foreground)' }}>
        Search
      </h3>

      {/* Search Input with responsive controls: input wrapper ensures icon centers relative to input height */}

      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setError(null);
                onChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-10 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* Controls: stack vertically on small screens, align horizontally on sm+ */}
          <div className="mt-2 sm:mt-0 sm:ml-3 flex w-full sm:w-auto flex-col sm:flex-row gap-2">
            {value && (
              <button
                onClick={() => {
                  setError(null);
                  onChange('');
                }}
                className="w-full sm:w-auto px-2 py-1 text-sm rounded-md transition-colors text-center"
                style={{
                  color: 'var(--muted-foreground)',
                  border: '1px solid transparent',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--card)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted-foreground)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => {
                if (!onSearch) return;
                try {
                  sanitizeDomainSearch(value);
                  setError(null);
                  onSearch(value);
                } catch (err: any) {
                  setError(err?.message || 'Invalid search term');
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--button)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button)';
              }}
              aria-label="Execute search"
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Search</span>
            </button>
          </div>
        </div>
        {/* show validation error */}
        {error && (
          <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
