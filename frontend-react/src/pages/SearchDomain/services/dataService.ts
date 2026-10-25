import { AvailableField } from '../types/fieldSelection';
import { buildDomainSearchUrl } from './urlConstructor';
import { ApiSearchParams } from './urlConstructor';
import { SortingState } from '@tanstack/react-table';
import { DomainData } from '../types/domain';
import { FilterState, convertFiltersToApiParams } from '../types/filters';
import apiClient from '../../../services/apiClient';

// Interface for API search parameters
export interface SearchParams {
  selectedFields: AvailableField[];
  pageSize: number;
  cursor?: string;
  direction?: 'next' | 'prev';
  sorting?: SortingState;
  globalFilter?: string;
  filters?: FilterState;
}

// API Response interface matching the backend structure
interface ApiResponse {
  status: string;
  remark: string;
  data: {
    page_data: Record<string, Omit<DomainData, 'id'>> | Array<Record<string, any>> | Record<string, never>;
    data_count?: number;
    total_data?: number;
    at_data?: number;
    next_cursor: string | null;
    prev_cursor?: string | null;
  };
}

// Interface for search results
export interface SearchResults {
  data: DomainData[];
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number;
  totalData: number;
  atData: number;
  dataCount: number;
}

// Real API data fetching function
export const fetchDomainData = async (params: SearchParams): Promise<SearchResults> => {
  try {
    // console.log('🚀 Fetching real domain data with params:', params);
    
    // Convert filter state to API parameters
    const apiFilters = params.filters ? convertFiltersToApiParams(params.filters) : undefined;
    
    // Build the API URL
    const apiParams: ApiSearchParams = {
      fields: params.selectedFields,
      limit: params.pageSize,
      cursor: params.cursor,
      direction: params.direction,
      sort: params.sorting,
      search: params.globalFilter,
      filters: apiFilters
    };
    
    const url = buildDomainSearchUrl(apiParams);
    // console.log('📡 API URL:', url);
    // console.log('🔍 Applied filters:', apiFilters);
    
    // Make the API request
    const response = await apiClient.request(url);
    const apiResponse: ApiResponse = await response.json();
    
    // console.log('✅ API Response:', apiResponse);
    
    // Transform API response to our format
    // Backend returns page_data as either an object (with data) or empty object (no data)
    // We need to handle both cases
    let domainData: DomainData[] = [];
    
    const pageData = apiResponse.data.page_data;
    
    // Check if page_data is an array or object
    if (Array.isArray(pageData)) {
      // If it's an array, map it directly
      domainData = pageData.map((item: any) => ({
        id: item.id,
        ...item
      }));
    } else if (pageData && typeof pageData === 'object' && Object.keys(pageData).length > 0) {
      // If it's an object with keys, convert to array
      domainData = Object.entries(pageData).map(([id, data]) => ({
        id,
        ...data
      })) as DomainData[];
    }
    // If it's an empty object {}, domainData remains []
    
    return {
      data: domainData,
      nextCursor: apiResponse.data.next_cursor || null,
      prevCursor: apiResponse.data.prev_cursor || null,
      totalCount: apiResponse.data.data_count || 0,
      totalData: apiResponse.data.total_data || 0,
      atData: apiResponse.data.at_data || 0,
      dataCount: apiResponse.data.data_count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching domain data:', error);
    throw error;
  }
};

// Real API data function - no fallback to mock data
export const getDomainData = async (params: SearchParams): Promise<SearchResults> => {
  // Only use real API data
  return await fetchDomainData(params);
};
