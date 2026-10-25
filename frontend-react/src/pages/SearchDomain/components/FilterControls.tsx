import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from 'lucide-react';
import { FilterState, DEFAULT_FILTER_STATE, countActiveFilters, convertFiltersToApiParams } from '../types/filters';
import FilterSelection from './FilterSelection';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Update temp filters when props change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApply = () => {
    console.log('🔍 Applying filters:', tempFilters);
    console.log('📋 API params:', convertFiltersToApiParams(tempFilters));
    onFiltersChange(tempFilters);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempFilters(filters);
    setIsExpanded(false);
  };

  const handleReset = () => {
    console.log('🔄 Resetting filters to default');
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
          <FilterIcon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          <span className="font-medium">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span 
              className="text-sm px-2 py-1 rounded font-semibold"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: '1px solid var(--primary)'
              }}
            >
              {activeFiltersCount} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div 
          className="mt-2 p-4 rounded-lg space-y-4"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Filter Selection Section */}
          <FilterSelection
            tempFilters={tempFilters}
            onFilterChange={handleFilterChange}
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
              Reset Filters
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
                className="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
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
                Apply Filters
                {tempActiveFiltersCount > 0 && ` (${tempActiveFiltersCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
