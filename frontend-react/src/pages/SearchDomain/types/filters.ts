/**
 * Filter Types for Domain Search
 * Defines the structure and available options for filtering domain data
 */

// Malicious status filter options
export type MaliciousFilter = 'all' | 'malicious' | 'benign';

// Fast flux type filter options
export type FluxTypeFilter = 'all' | 'single' | 'double' | 'name' | 'unknown' | 'has_flux';

// Domain status filter options
export type DomainStatusFilter = 'all' | 'active' | 'inactive';

// Main filter state interface
export interface FilterState {
  malicious: MaliciousFilter;
  fluxType: FluxTypeFilter;
  domainStatus: DomainStatusFilter;
}

// Default filter state (all filters set to show all results)
export const DEFAULT_FILTER_STATE: FilterState = {
  malicious: 'all',
  fluxType: 'all',
  domainStatus: 'all'
};

// Filter option definitions for UI display
export interface FilterOption<T = string> {
  value: T;
  label: string;
  description?: string;
}

// Available malicious filter options
export const MALICIOUS_FILTER_OPTIONS: FilterOption<MaliciousFilter>[] = [
  { value: 'all', label: 'All Domains', description: 'Show all domains regardless of malicious status' },
  { value: 'malicious', label: 'Malicious Only', description: 'Show only domains marked as malicious' },
  { value: 'benign', label: 'Benign Only', description: 'Show only domains marked as benign' }
];

// Available flux type filter options
export const FLUX_TYPE_FILTER_OPTIONS: FilterOption<FluxTypeFilter>[] = [
  { value: 'all', label: 'All Types', description: 'Show all domains regardless of flux type' },
  { value: 'single', label: 'Single Flux', description: 'Show domains with single fast flux pattern' },
  { value: 'double', label: 'Double Flux', description: 'Show domains with double fast flux pattern' },
  { value: 'name', label: 'Name Flux', description: 'Show domains with name server flux pattern' },
  { value: 'unknown', label: 'Unknown/No Flux', description: 'Show domains with unknown or no flux pattern' },
  { value: 'has_flux', label: 'Any Flux (Exclude Unknown)', description: 'Show domains with any known flux pattern' }
];

// Available domain status filter options
export const DOMAIN_STATUS_FILTER_OPTIONS: FilterOption<DomainStatusFilter>[] = [
  { value: 'all', label: 'All Statuses', description: 'Show all domains regardless of status' },
  { value: 'active', label: 'Active Only', description: 'Show only active domains' },
  { value: 'inactive', label: 'Inactive Only', description: 'Show only inactive domains' }
];

/**
 * Convert filter state to API filter parameters
 * Maps UI filter state to the format expected by the API
 */
export const convertFiltersToApiParams = (filters: FilterState): Record<string, any> => {
  const apiFilters: Record<string, any> = {};

  // Handle malicious filter
  if (filters.malicious !== 'all') {
    if (filters.malicious === 'malicious') {
      apiFilters.is_malicious = true;
    } else if (filters.malicious === 'benign') {
      apiFilters.is_malicious = false;
    }
  }

  // Handle flux type filter
  if (filters.fluxType !== 'all') {
    if (filters.fluxType === 'has_flux') {
      // Show any flux except unknown (use neq operator)
      apiFilters['flux_type.neq'] = 'unknown';
    } else {
      apiFilters.flux_type = filters.fluxType;
    }
  }

  // Handle domain status filter
  if (filters.domainStatus !== 'all') {
    apiFilters.status = filters.domainStatus;
  }

  return apiFilters;
};

/**
 * Check if any filters are active (not set to 'all')
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return filters.malicious !== 'all' || 
         filters.fluxType !== 'all' || 
         filters.domainStatus !== 'all';
};

/**
 * Count the number of active filters
 */
export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;
  if (filters.malicious !== 'all') count++;
  if (filters.fluxType !== 'all') count++;
  if (filters.domainStatus !== 'all') count++;
  return count;
};
