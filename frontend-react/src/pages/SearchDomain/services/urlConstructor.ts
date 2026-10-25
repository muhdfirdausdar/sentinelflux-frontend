import { AvailableField } from '../types/fieldSelection';
import { SortingState } from '@tanstack/react-table';
import { API_BASE_URL } from '../../../constants';

/**
 * URL Constructor for Domain Search API
 * 
 * Available Filter Parameters:
 * ===========================
 * 
 * MALICIOUS FILTERS (domain_ip_malicious table):
 * ----------------------------------------------
 * Is malicious:
 *   filters.is_malicious=true
 *   filters.is_malicious=false
 *   filters.is_malicious.neq=true
 * 
 * Examples:
 *   http://localhost:5252/search?filters.is_malicious=true
 *   http://localhost:5252/search?filters.is_malicious=false
 *   http://localhost:5252/search?filters.is_malicious.neq=true
 * 
 * 
 * FAST FLUX FILTERS (fast_flux_analysis table):
 * ---------------------------------------------
 * Flux type (latest record only):
 *   filters.flux_type=single
 *   filters.flux_type=double
 *   filters.flux_type=name
 *   filters.flux_type=unknown
 *   filters.flux_type.neq=unknown
 * 
 * Examples:
 *   http://localhost:5252/search?filters.flux_type=single
 *   http://localhost:5252/search?filters.flux_type=double
 *   http://localhost:5252/search?filters.flux_type=name
 *   http://localhost:5252/search?filters.flux_type=unknown
 *   http://localhost:5252/search?filters.flux_type.neq=unknown
 * 
 * Domain status:
 *   filters.status=active
 *   filters.status=inactive
 *   filters.status.neq=unknown
 * 
 * Examples:
 *   http://localhost:5252/search?filters.status=active
 *   http://localhost:5252/search?filters.status=inactive
 *   http://localhost:5252/search?filters.status.neq=unknown
 * 
 * 
 * COMBINED FILTERS:
 * ----------------
 * Multiple filters can be combined in a single request:
 *   http://localhost:5252/search?filters.is_malicious=true&filters.flux_type=double&filters.status=active
 */

// Raw API field names (what the backend expects)
export type ApiField = 
  | 'domain_name'
  | 'dom_status'        // Raw API field
  | 'is_malicious'      // Raw API field  
  | 'flux_type'         // Raw API field
  | 'is_unrated'        // Raw API field
  | 'dom_last_seen'
  | 'num_ips'
  | 'num_ns'
  | 'domip_avg_ttl'
  | 'domip_lowest_ttl'
  | 'domip_highest_ttl'
  | 'domip_highest_ttl_time'
  | 'domip_last_seen'
  | 'domip_lowest_ttl_time'
  | 'domns_avg_ttl'
  | 'domns_lowest_ttl'
  | 'domns_highest_ttl'
  | 'domns_highest_ttl_time'
  | 'domns_last_seen'
  | 'domns_lowest_ttl_time'
  | 'source_name';

// Interface for API parameters
export interface ApiSearchParams {
  fields?: AvailableField[] | ApiField[];
  limit?: number;
  cursor?: string;
  direction?: 'next' | 'prev';
  sort?: SortingState;
  filters?: {
    // Domain status filters
    dom_status?: string;
    'dom_status.neq'?: string;
    
    // Malicious filters (domain_ip_malicious table)
    is_malicious?: boolean;
    'is_malicious.neq'?: boolean;
    
    // Fast flux filters (fast_flux_analysis table)
    flux_type?: string;          // values: 'single', 'double', 'name', 'unknown'
    'flux_type.neq'?: string;
    
    // Domain status (from fast_flux_analysis table)
    status?: string;             // values: 'active', 'inactive'
    'status.neq'?: string;
    
    // Source filters
    source_name?: string;
    
    // Add more filter types as needed
  };
  search?: string;
}

// Interface for URL construction options
export interface UrlConstructorOptions {
  baseUrl?: string;
  endpoint?: string;
}

/**
 * URL Constructor for Domain Search API
 * Builds URLs based on field selection, sorting, and filtering parameters
 */
export class DomainSearchUrlConstructor {
  private baseUrl: string;
  private endpoint: string;

  constructor(options: UrlConstructorOptions = {}) {
    // Use constants instead of environment variables
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.endpoint = options.endpoint || '/search';
  }

  /**
   * Convert frontend field names to API field names
   * Maps UI fields like 'status_tags' to actual API fields
   */
  private mapToApiFields(fields: AvailableField[]): ApiField[] {
    const apiFields: ApiField[] = [];
    
    fields.forEach(field => {
      switch (field) {
        case 'status_tags':
          // Map status_tags to its component fields
          apiFields.push('dom_status', 'is_malicious', 'flux_type', 'is_unrated');
          break;
        case 'domain_name':
        case 'dom_last_seen':
        case 'num_ips':
        case 'num_ns':
        case 'domip_avg_ttl':
        case 'domip_lowest_ttl':
        case 'domip_highest_ttl':
        case 'domip_last_seen':
        case 'domns_avg_ttl':
        case 'domns_lowest_ttl':
        case 'domns_highest_ttl':
        case 'domns_last_seen':
        case 'source_name':
          // Direct mapping for fields that exist in both types
          apiFields.push(field as ApiField);
          break;
        default:
          console.warn(`Unknown field: ${field}`);
      }
    });

    // Remove duplicates
    return [...new Set(apiFields)];
  }

  /**
   * Construct the complete search URL with parameters
   */
  buildSearchUrl(params: ApiSearchParams): string {
    const url = new URL(`${this.baseUrl}${this.endpoint}`);
    
    // Add limit parameter
    if (params.limit !== undefined) {
      url.searchParams.set('limit', params.limit.toString());
    }

    // Add cursor parameter for pagination
    if (params.cursor !== undefined) {
      url.searchParams.set('cursor', params.cursor);
    }

    // Add direction parameter for pagination (only for next/prev, not for first page)
    if (params.direction !== undefined) {
      url.searchParams.set('direction', params.direction);
    }

    // Add fields parameter
    if (params.fields && params.fields.length > 0) {
      let fieldsToUse: string[];
      
      // Always try to map if we detect AvailableField types (which include 'status_tags')
      const hasStatusTags = params.fields.some(field => field === 'status_tags');
      
      if (hasStatusTags) {
        // Frontend fields that need mapping
        fieldsToUse = this.mapToApiFields(params.fields as AvailableField[]);
      } else {
        // Raw API fields, use as-is
        fieldsToUse = params.fields as string[];
      }
      
      url.searchParams.set('fields', fieldsToUse.join(','));
    }

    // Add sorting parameter (default to -dom_last_seen if no sort specified)
    if (params.sort && params.sort.length > 0) {
      const sortParams = params.sort.map(sortItem => {
        const prefix = sortItem.desc ? '-' : '';
        return `${prefix}${sortItem.id}`;
      });
      url.searchParams.set('sort', sortParams.join(','));
    } else {
      // Default sort: dom_last_seen descending
      url.searchParams.set('sort', '-dom_last_seen');
    }

    // Add filter parameters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(`filters.${key}`, value.toString());
        }
      });
    }

    // Add search parameter
    if (params.search && params.search.trim()) {
      url.searchParams.set('search', params.search.trim());
    }

    return url.toString();
  }

  /**
   * Build URL specifically for field selection changes
   */
  buildFieldSelectionUrl(
    selectedFields: AvailableField[],
    additionalParams?: Omit<ApiSearchParams, 'fields'>
  ): string {
    return this.buildSearchUrl({
      fields: selectedFields,
      ...additionalParams
    });
  }

  /**
   * Build URL specifically for sorting changes
   */
  buildSortingUrl(
    sorting: SortingState,
    additionalParams?: Omit<ApiSearchParams, 'sort'>
  ): string {
    return this.buildSearchUrl({
      sort: sorting,
      ...additionalParams
    });
  }

  /**
   * Build URL for cursor-based pagination
   */
  buildPaginationUrl(
    cursor: string,
    pageSize: number,
    additionalParams?: Omit<ApiSearchParams, 'limit' | 'cursor'>
  ): string {
    return this.buildSearchUrl({
      limit: pageSize,
      cursor: cursor,
      ...additionalParams
    });
  }

  /**
   * Get the base URL for debugging
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the endpoint for debugging
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Test URL construction with sample data
   */
  testUrlConstruction(): void {
    console.log('🔧 Testing Domain Search URL Constructor');
    console.log('=====================================');
    
    // Test 1: Basic field selection with frontend fields
    const testFields: AvailableField[] = [
      'domain_name',
      'status_tags',  // This will map to dom_status, is_malicious, flux_type
      'dom_last_seen',
      'num_ips',
      'source_name'
    ];
    
    const basicUrl = this.buildFieldSelectionUrl(testFields, { limit: 10 });
    console.log('✅ Basic Field Selection URL (Frontend Fields):');
    console.log(basicUrl);
    console.log('');

    // Test 2: With sorting
    const sortingParams: SortingState = [
      { id: 'dom_last_seen', desc: true },
      { id: 'domain_name', desc: false }
    ];
    
    const sortedUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 5,
      sort: sortingParams
    });
    console.log('✅ With Sorting URL:');
    console.log(sortedUrl);
    console.log('');

    // Test 3: With basic filters
    const filteredUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 5,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        dom_status: 'active',
        is_malicious: true
      }
    });
    console.log('✅ With Basic Filters URL:');
    console.log(filteredUrl);
    console.log('');

    // Test 3a: Malicious filters examples
    const maliciousFiltersUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        is_malicious: true
      }
    });
    console.log('✅ Malicious Filter (is_malicious=true):');
    console.log(maliciousFiltersUrl);
    console.log('');

    // Test 3b: Malicious filters with neq operator
    const notMaliciousFiltersUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        'is_malicious.neq': true
      }
    });
    console.log('✅ Not Malicious Filter (is_malicious.neq=true):');
    console.log(notMaliciousFiltersUrl);
    console.log('');

    // Test 3c: Fast Flux type filters
    const singleFluxUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        flux_type: 'single'
      }
    });
    console.log('✅ Single Flux Filter (flux_type=single):');
    console.log(singleFluxUrl);
    console.log('');

    // Test 3d: Multiple flux types or negation
    const notUnknownFluxUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        'flux_type.neq': 'unknown'
      }
    });
    console.log('✅ Not Unknown Flux Filter (flux_type.neq=unknown):');
    console.log(notUnknownFluxUrl);
    console.log('');

    // Test 3e: Domain status filters
    const activeStatusUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        status: 'active'
      }
    });
    console.log('✅ Active Status Filter (status=active):');
    console.log(activeStatusUrl);
    console.log('');

    // Test 3f: Combined filters example
    const combinedFiltersUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        is_malicious: true,
        flux_type: 'double',
        status: 'active'
      }
    });
    console.log('✅ Combined Filters (malicious + double flux + active):');
    console.log(combinedFiltersUrl);
    console.log('');

    // Test 4: Complex example with raw API fields (matching your specification)
    const complexApiFields: ApiField[] = [
      'dom_last_seen',
      'dom_status', 
      'domain_name',
      'domip_avg_ttl',
      'domip_highest_ttl',
      'domip_last_seen',
      'domip_lowest_ttl',
      'domns_avg_ttl',
      'domns_highest_ttl',
      'domns_last_seen',
      'domns_lowest_ttl',
      'flux_type',
      'is_malicious',
      'num_ips',
      'num_ns',
      'source_name'
    ];

    const complexUrl = this.buildSearchUrl({
      fields: complexApiFields,
      limit: 5,
      sort: [{ id: 'dom_last_seen', desc: true }],
      filters: {
        dom_status: 'active',
        is_malicious: true
      }
    });
    console.log('✅ Complex Example (Your Specification - Raw API Fields):');
    console.log(complexUrl);
    console.log('');

    // Test 5: Frontend field mapping demonstration
    const frontendFields: AvailableField[] = [
      'domain_name',
      'status_tags',      // Will expand to: dom_status, is_malicious, flux_type
      'dom_last_seen',
      'num_ips',
      'num_ns'
    ];

    const mappedUrl = this.buildSearchUrl({
      fields: frontendFields,
      limit: 10,
      sort: [{ id: 'dom_last_seen', desc: true }]
    });
    console.log('✅ Frontend Field Mapping Demo:');
    console.log('Input fields: domain_name, status_tags, dom_last_seen, num_ips, num_ns');
    console.log('Mapped to API: domain_name, dom_status, is_malicious, flux_type, dom_last_seen, num_ips, num_ns');
    console.log(mappedUrl);
    console.log('');

    // Test 6: Cursor-based pagination
    const paginationUrl = this.buildPaginationUrl('next_cursor_token_123', 10, {
      fields: testFields,
      sort: sortingParams
    });
    console.log('✅ Pagination URL (Next page with cursor):');
    console.log(paginationUrl);
    console.log('');

    // Test 7: Search functionality
    const searchUrl = this.buildSearchUrl({
      fields: testFields,
      limit: 20,
      search: 'malicious domain',
      sort: [{ id: 'dom_last_seen', desc: true }]
    });
    console.log('✅ Search URL:');
    console.log(searchUrl);
    console.log('');

    console.log('🎯 URL Constructor Testing Complete!');
  }
}

// Export singleton instance
export const urlConstructor = new DomainSearchUrlConstructor();

// Export helper functions for convenience
export const buildDomainSearchUrl = (params: ApiSearchParams): string => {
  return urlConstructor.buildSearchUrl(params);
};

export const buildFieldSelectionUrl = (
  selectedFields: AvailableField[],
  additionalParams?: Omit<ApiSearchParams, 'fields'>
): string => {
  return urlConstructor.buildFieldSelectionUrl(selectedFields, additionalParams);
};

export const buildSortingUrl = (
  sorting: SortingState,
  additionalParams?: Omit<ApiSearchParams, 'sort'>
): string => {
  return urlConstructor.buildSortingUrl(sorting, additionalParams);
};

// Export the class for custom instances
export default DomainSearchUrlConstructor;
