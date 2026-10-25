import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { AvailableField, COLUMN_LIMITS } from '../types/fieldSelection';
import SearchBar from './SearchBar';
import ColumnSelection from './ColumnSelection';

// Responsive column limits based on screen width
const getMaxColumns = (width: number): number => {
  if (width < 768) return COLUMN_LIMITS.mobile;     // Mobile
  if (width < 1024) return COLUMN_LIMITS.md;       // Tablet
  return COLUMN_LIMITS.lg;                          // Desktop
};

// Get breakpoint label for display
const getBreakpointLabel = (width: number): string => {
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
};

// Custom hook for responsive max columns
const useResponsiveColumns = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxColumns = getMaxColumns(width);
  const breakpointLabel = getBreakpointLabel(width);

  return { maxColumns, breakpointLabel, width };
};

interface SimpleSearchControlsProps {
  selectedFields: AvailableField[];
  onFieldsChange: (fields: AvailableField[]) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
}

export const SimpleSearchControls: React.FC<SimpleSearchControlsProps> = ({
  selectedFields,
  onFieldsChange,
  globalFilter,
  onGlobalFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempSelectedFields, setTempSelectedFields] = useState<AvailableField[]>(selectedFields);
  const { maxColumns, breakpointLabel } = useResponsiveColumns();

  // Update temp fields when props change
  useEffect(() => {
    setTempSelectedFields(selectedFields);
  }, [selectedFields]);

  const handleFieldToggle = (fieldKey: AvailableField) => {
    if (fieldKey === 'domain_name') return; // Can't uncheck domain_name

    setTempSelectedFields(prev => {
      const isSelected = prev.indexOf(fieldKey) >= 0;
      
      if (isSelected) {
        return prev.filter(f => f !== fieldKey);
      } else {
        // Check if we're at the limit
        if (prev.length >= maxColumns) {
          return prev; // Don't add if at limit
        }
        return [...prev, fieldKey];
      }
    });
  };

  const handleApply = () => {
    // Ensure domain_name is always included and first
    const finalFields: AvailableField[] = tempSelectedFields.includes('domain_name') 
      ? tempSelectedFields 
      : ['domain_name', ...tempSelectedFields];
    
    onFieldsChange(finalFields);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempSelectedFields(selectedFields);
    setIsExpanded(false);
  };

  const handleReset = () => {
    const defaultFields: AvailableField[] = ['domain_name', 'status_tags', 'dom_last_seen'];
    // Ensure we don't exceed max columns on smaller screens
    setTempSelectedFields(defaultFields.slice(0, maxColumns));
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar - Hidden (not implemented yet) */}
      {/* <div 
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        <SearchBar
          value={globalFilter}
          onChange={onGlobalFilterChange}
          placeholder="Search domains across all fields..."
        />
      </div> */}

      {/* Column Selection - Collapsible */}
      <div className="w-full">
        {/* Trigger Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--card-foreground)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card)';
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">Column Selection</span>
            <span 
              className="text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-foreground)'
              }}
            >
              {selectedFields.length} of {maxColumns} columns
            </span>
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          ) : (
            <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          )}
        </button>

        {/* Collapsible Content - Column Selection Only */}
        {isExpanded && (
          <div 
            className="mt-2 p-4 rounded-lg space-y-4"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)'
            }}
          >
            {/* Column Selection Section */}
            <ColumnSelection
              tempSelectedFields={tempSelectedFields}
              onFieldToggle={handleFieldToggle}
              maxColumns={maxColumns}
              breakpointLabel={breakpointLabel}
            />

            {/* Actions */}
            <div 
              className="flex items-center justify-between pt-4"
              style={{
                borderTop: '1px solid var(--border)'
              }}
            >
              <button
                onClick={handleReset}
                className="text-sm transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted-foreground)';
                }}
              >
                Reset to Default
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm rounded-md transition-colors"
                  style={{
                    color: 'var(--muted-foreground)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
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
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSearchControls;
