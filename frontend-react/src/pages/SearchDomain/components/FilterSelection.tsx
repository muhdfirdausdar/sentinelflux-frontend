import React from 'react';
import {
  FilterState,
  MALICIOUS_FILTER_OPTIONS,
  FLUX_TYPE_FILTER_OPTIONS,
  DOMAIN_STATUS_FILTER_OPTIONS
} from '../types/filters';

interface FilterSelectionProps {
  tempFilters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string) => void;
}

const FilterSelection: React.FC<FilterSelectionProps> = ({
  tempFilters,
  onFilterChange
}) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm" style={{ color: 'var(--card-foreground)' }}>
          Advanced Filters
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Refine your search results by filtering domains based on security status, flux patterns, and activity state.
        </p>
      </div>

      {/* Filter Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Malicious Status Filter */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
              Malicious Status
            </span>
            <span className="block text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Filter by security threat classification
            </span>
          </label>
          <select
            value={tempFilters.malicious}
            onChange={(e) => onFilterChange('malicious', e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm focus:ring-2 focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)'
            }}
          >
            {MALICIOUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Show description of selected option */}
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {MALICIOUS_FILTER_OPTIONS.find(opt => opt.value === tempFilters.malicious)?.description}
          </p>
        </div>

        {/* Fast Flux Type Filter */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
              Fast Flux Type
            </span>
            <span className="block text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Filter by fast flux pattern detection
            </span>
          </label>
          <select
            value={tempFilters.fluxType}
            onChange={(e) => onFilterChange('fluxType', e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm focus:ring-2 focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)'
            }}
          >
            {FLUX_TYPE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {FLUX_TYPE_FILTER_OPTIONS.find(opt => opt.value === tempFilters.fluxType)?.description}
          </p>
        </div>

        {/* Domain Status Filter */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
              Domain Status
            </span>
            <span className="block text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Filter by domain activity state
            </span>
          </label>
          <select
            value={tempFilters.domainStatus}
            onChange={(e) => onFilterChange('domainStatus', e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm focus:ring-2 focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)'
            }}
          >
            {DOMAIN_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {DOMAIN_STATUS_FILTER_OPTIONS.find(opt => opt.value === tempFilters.domainStatus)?.description}
          </p>
        </div>

      </div>

      {/* Active Filters Summary */}
      {(tempFilters.malicious !== 'all' || tempFilters.fluxType !== 'all' || tempFilters.domainStatus !== 'all') && (
        <div 
          className="p-3 rounded-md"
          style={{
            backgroundColor: 'var(--accent)',
            border: '1px solid var(--border)'
          }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-foreground)' }}>
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {tempFilters.malicious !== 'all' && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Malicious: {MALICIOUS_FILTER_OPTIONS.find(opt => opt.value === tempFilters.malicious)?.label}
              </span>
            )}
            {tempFilters.fluxType !== 'all' && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Flux: {FLUX_TYPE_FILTER_OPTIONS.find(opt => opt.value === tempFilters.fluxType)?.label}
              </span>
            )}
            {tempFilters.domainStatus !== 'all' && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Status: {DOMAIN_STATUS_FILTER_OPTIONS.find(opt => opt.value === tempFilters.domainStatus)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSelection;
