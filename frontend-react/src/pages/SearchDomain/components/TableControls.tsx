import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SlidersHorizontalIcon } from 'lucide-react';
import { AvailableField, COLUMN_LIMITS } from '../types/fieldSelection';
import { FilterState, DEFAULT_FILTER_STATE, countActiveFilters } from '../types/filters';
import ColumnSelection from './ColumnSelection';
import FilterSelection from './FilterSelection';

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

interface TableControlsProps {
  selectedFields: AvailableField[];
  onFieldsChange: (fields: AvailableField[]) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onBatchChange?: (fields: AvailableField[], filters: FilterState) => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  selectedFields,
  onFieldsChange,
  filters,
  onFiltersChange,
  onBatchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempSelectedFields, setTempSelectedFields] = useState<AvailableField[]>(selectedFields);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const { maxColumns, breakpointLabel } = useResponsiveColumns();

  // Update temp states when props change
  useEffect(() => {
    setTempSelectedFields(selectedFields);
  }, [selectedFields]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

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

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApply = () => {
    console.log('🔄 Applying table controls');
    
    // Apply column changes
    const finalFields: AvailableField[] = tempSelectedFields.includes('domain_name') 
      ? tempSelectedFields 
      : ['domain_name', ...tempSelectedFields];
    
    console.log('📋 Applying columns:', finalFields);
    console.log('🔍 Applying filters:', tempFilters);
    
    // Check if both changed or just one
    const fieldsChanged = JSON.stringify(finalFields) !== JSON.stringify(selectedFields);
    const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify(filters);
    
    if (fieldsChanged && filtersChanged) {
      // Both changed: use batch handler if available to avoid double fetch
      if (onBatchChange) {
        console.log('🔄 Using batch update for both fields and filters');
        onBatchChange(finalFields, tempFilters);
      } else {
        // Fallback: apply separately
        onFieldsChange(finalFields);
        setTimeout(() => onFiltersChange(tempFilters), 0);
      }
    } else if (fieldsChanged) {
      // Only fields changed
      onFieldsChange(finalFields);
    } else if (filtersChanged) {
      // Only filters changed
      onFiltersChange(tempFilters);
    }
    // If nothing changed, don't trigger any updates
    
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempSelectedFields(selectedFields);
    setTempFilters(filters);
    setIsExpanded(false);
  };

  const handleReset = () => {
    // Reset columns to default
    const defaultFields: AvailableField[] = ['domain_name', 'status_tags', 'dom_last_seen'];
    setTempSelectedFields(defaultFields.slice(0, maxColumns));
    
    // Reset filters to default
    setTempFilters(DEFAULT_FILTER_STATE);
  };

  const activeFiltersCount = countActiveFilters(filters);
  const tempActiveFiltersCount = countActiveFilters(tempFilters);

  return (
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
          <SlidersHorizontalIcon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          <span className="font-medium">Table Controls</span>
          <div className="flex items-center gap-2">
            <span 
              className="text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                border: '1px solid var(--border)'
              }}
            >
              {selectedFields.length} of {maxColumns} columns
            </span>
            {activeFiltersCount > 0 && (
              <span 
                className="text-sm px-2 py-1 rounded font-semibold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: '1px solid var(--primary)'
                }}
              >
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        )}
      </button>

      {/* Description below the button */}
      {!isExpanded && (
        <p 
          className="text-sm mt-2 px-1"
          style={{ 
            color: 'var(--muted-foreground)',
            lineHeight: '1.5'
          }}
        >
          Click the table controls button above to customize table columns and apply advanced filters
        </p>
      )}

      {/* Collapsible Content */}
      {isExpanded && (
        <div 
          className="mt-2 p-4 rounded-lg space-y-6"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Filter Section */}
          <div className="space-y-4">
            <div 
              className="flex items-center gap-2 pb-2"
              style={{
                borderBottom: '2px solid var(--border)'
              }}
            >
              <h3 className="font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>
                Advanced Filters
              </h3>
              {tempActiveFiltersCount > 0 && (
                <span 
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  {tempActiveFiltersCount} active
                </span>
              )}
            </div>
            <FilterSelection
              tempFilters={tempFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Divider */}
          <div 
            style={{
              borderTop: '2px solid var(--border)',
              margin: '1.5rem 0'
            }}
          />

          {/* Column Selection Section */}
          <div className="space-y-4">
            <div 
              className="flex items-center gap-2 pb-2"
              style={{
                borderBottom: '2px solid var(--border)'
              }}
            >
              <h3 className="font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>
                Column Selection
              </h3>
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  border: '1px solid var(--border)'
                }}
              >
                {tempSelectedFields.length} of {maxColumns}
              </span>
            </div>
            <ColumnSelection
              tempSelectedFields={tempSelectedFields}
              onFieldToggle={handleFieldToggle}
              maxColumns={maxColumns}
              breakpointLabel={breakpointLabel}
            />
          </div>

          {/* Actions */}
          <div 
            className="flex items-center justify-between pt-4"
            style={{
              borderTop: '2px solid var(--border)'
            }}
          >
            <button
              onClick={handleReset}
              className="text-sm transition-colors font-medium"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted-foreground)';
              }}
            >
              Reset All to Default
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-md transition-colors font-medium"
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
                className="px-4 py-2 text-sm rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableControls;
