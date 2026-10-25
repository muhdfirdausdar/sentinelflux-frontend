import React, { useState, useEffect, useCallback } from 'react';
import { SortingState, PaginationState } from '@tanstack/react-table';
import { 
  getDomainData, 
  SearchParams, 
  SearchResults
} from './services/dataService';
import { DomainData } from './types/domain';
import TableControls from './components/TableControls';
import SearchBar from './components/SearchBar';
import { DataTable } from './components/DataTable';
import SearchDomainSkeleton from './components/SearchDomainSkeleton';
import { AvailableField } from './types/fieldSelection';
import { FilterState, DEFAULT_FILTER_STATE } from './types/filters';
import './styles/table-search.css';

const DEFAULT_SELECTED_FIELDS: AvailableField[] = ['domain_name', 'status_tags', 'dom_last_seen'];

interface TableSearchProps {
  initialSearch?: string;
}

const TableSearch: React.FC<TableSearchProps> = ({ initialSearch = '' }) => {
  // Field selection state
  const [selectedFields, setSelectedFields] = useState<AvailableField[]>(DEFAULT_SELECTED_FIELDS);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [data, setData] = useState<DomainData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [atData, setAtData] = useState(1);
  const [dataCount, setDataCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // Cursor history stack: stores the cursor used to fetch each visited page
  // We store richer entries so we can use the server-provided prev/next cursors
  type HistoryEntry = { cursor: string; prevCursor?: string | null; nextCursor?: string | null };
  const [cursorHistory, setCursorHistory] = useState<HistoryEntry[]>([{ cursor: '' }]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  // Local input for the search bar (so typing doesn't immediately trigger a search)
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Helper function to update all pagination state
  const updatePaginationState = (result: SearchResults) => {
    setData(result.data);
    setTotalData(result.totalData);
    setAtData(result.atData);
    setDataCount(result.dataCount);
    setNextCursor(result.nextCursor);
    // prevCursor is tracked but not used directly - it's available in result.prevCursor
    // current cursor value is tracked via cursorHistory/currentIndex
  };

  // Function to fetch data from API
  const fetchData = useCallback(async (params: Partial<SearchParams> = {}) => {
    setIsLoading(true);
    try {
      const searchParams: SearchParams = {
        selectedFields,
        pageSize: pagination.pageSize,
        cursor: params.cursor ?? '',
        sorting,
        globalFilter,
        filters,
        ...params
      };

      console.log('🔄 Fetching data with params:', searchParams);
      const result = await getDomainData(searchParams);
      updatePaginationState(result);

      console.log('✅ Data fetched successfully');
      return result;
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, pagination.pageSize, sorting, globalFilter, filters]);

  // Navigation handlers for cursor-based pagination
  const handleFirstPage = useCallback(async () => {
    console.log('🏠 Navigating to first page');
    // Reset history and go to first page
    setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);
    const res = await fetchData({ cursor: '', selectedFields, sorting, globalFilter, filters });
    // update entry 0 with returned cursors
    setCursorHistory((hist: HistoryEntry[]) => {
      const copy = [...hist];
      copy[0] = { cursor: '', prevCursor: res?.prevCursor ?? null, nextCursor: res?.nextCursor ?? null };
      return copy;
    });
  }, [fetchData, selectedFields, sorting, globalFilter, filters]);

  const handlePreviousPage = useCallback(async () => {
    // Use local history to navigate back reliably
    if (currentIndex <= 0) {
      console.log('⬅️ Already at first page (no history to go back)');
      return;
    }
    const newIndex = currentIndex - 1;
    const currentEntry = cursorHistory[currentIndex] as HistoryEntry | undefined;
    // Prefer server-provided prevCursor from the current page; fall back to history entry cursor
    const useCursor = currentEntry?.prevCursor ?? (cursorHistory[newIndex] as HistoryEntry)?.cursor ?? '';
    console.log('⬅️ Navigating to previous page using cursor:', useCursor, 'newIndex=', newIndex);
    // update history index BEFORE fetch so UI state matches requested page
    setCurrentIndex(newIndex);
    const res = await fetchData({ cursor: useCursor, direction: 'prev', selectedFields, sorting, globalFilter, filters });
    // After fetch, update the history entry at newIndex with returned cursors
    setCursorHistory((hist: HistoryEntry[]) => {
      const copy = hist.slice(0, Math.max(hist.length, newIndex + 1));
      copy[newIndex] = { cursor: useCursor, prevCursor: res?.prevCursor ?? null, nextCursor: res?.nextCursor ?? null };
      return copy;
    });
  }, [cursorHistory, currentIndex, fetchData, selectedFields, sorting, globalFilter, filters]);

  const handleNextPage = useCallback(async () => {
    // If we have forward history (user navigated back previously), use it first
    if (currentIndex < cursorHistory.length - 1) {
      const forwardEntry = cursorHistory[currentIndex + 1] as HistoryEntry | undefined;
      const forwardCursor = forwardEntry?.cursor ?? '';
      console.log('➡️ Navigating forward using history cursor:', forwardCursor);
      // advance index
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const res = await fetchData({ cursor: forwardCursor, direction: 'next', selectedFields, sorting, globalFilter, filters });
      // update entry with returned cursors
      setCursorHistory((hist: HistoryEntry[]) => {
        const copy = [...hist];
        copy[newIndex] = { cursor: forwardCursor, prevCursor: res?.prevCursor ?? null, nextCursor: res?.nextCursor ?? null };
        return copy;
      });
      return;
    }

    if (!nextCursor) {
      console.log('➡️ No next cursor available');
      return;
    }

    const newCursor = nextCursor;
    console.log('➡️ Navigating to next page with cursor:', newCursor);
    // push the cursor used to reach new page into history and advance index
    const newIndex = currentIndex + 1;
    setCursorHistory((hist: HistoryEntry[]) => {
      const base = hist.slice(0, currentIndex + 1);
      base.push({ cursor: newCursor });
      return base;
    });
    setCurrentIndex(newIndex);
    const res = await fetchData({ cursor: newCursor, direction: 'next', selectedFields, sorting, globalFilter, filters });
    // update the newly pushed entry with returned cursors
    setCursorHistory((hist: HistoryEntry[]) => {
      const copy = [...hist];
      copy[newIndex] = { cursor: newCursor, prevCursor: res?.prevCursor ?? null, nextCursor: res?.nextCursor ?? null };
      return copy;
    });
  }, [nextCursor, currentIndex, fetchData, selectedFields, sorting, globalFilter, filters]);

  // Calculate pagination state
  const canGoToFirstPage = Boolean(cursorHistory && currentIndex > 0);
  const canGoToPreviousPage = currentIndex > 0; // use local history for prev availability
  // Allow Next if server provided nextCursor OR we have forward history entries
  const canGoToNextPage = Boolean(nextCursor) || (currentIndex < cursorHistory.length - 1);

  // Initial data load - only run once on mount
  useEffect(() => {
    let mounted = true;
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const searchParams: SearchParams = {
          selectedFields: DEFAULT_SELECTED_FIELDS,
          pageSize: 10,
          cursor: '',
          sorting: [],
          globalFilter: '',
          filters: DEFAULT_FILTER_STATE
        };
        const result = await getDomainData(searchParams);
        if (mounted) {
          updatePaginationState(result);
        }
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialData();
    return () => { mounted = false; };
  }, []); // Empty dependency array - only run once on mount

  // Handle field changes
  const handleFieldsChange = useCallback(async (newFields: AvailableField[]) => {
    console.log('📋 Column selection changed:', newFields);
    // Check if fields actually changed
    if (JSON.stringify(newFields) === JSON.stringify(selectedFields)) {
      console.log('📋 No column changes detected, skipping fetch');
      return;
    }
    
    setSelectedFields(newFields);
    // reset cursor history when fields change
    setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);

    setIsLoading(true);
    try {
      // Create fresh search params to avoid stale closure
      const searchParams: SearchParams = {
        selectedFields: newFields,
        pageSize: pagination.pageSize,
        cursor: '',
        sorting,
        globalFilter,
        filters
      };
      const result = await getDomainData(searchParams);
      updatePaginationState(result);
      console.log('✅ Columns updated successfully');
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, pagination.pageSize, sorting, globalFilter, filters]);

  // Handle sorting changes
  const handleSortingChange = useCallback(async (newSorting: SortingState) => {
    console.log('🔄 Server-side sort triggered:', newSorting);
    setSorting(newSorting);
    const searchParams: SearchParams = {
      selectedFields,
      pageSize: pagination.pageSize,
      cursor: '',
      sorting: newSorting,
      globalFilter,
      filters
    };
    
    console.log('📡 Making server request with new sorting:', searchParams);
  // reset cursor history when sort changes
  setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);

    setIsLoading(true);
    try {
      const result = await getDomainData(searchParams);
      updatePaginationState(result);
      console.log('✅ Server-side sort completed, data updated');
    } catch (error) {
      console.error('❌ Error fetching sorted data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, pagination.pageSize, globalFilter, filters]);

  // Handle pagination changes
  const handlePaginationChange = useCallback(async (newPagination: PaginationState) => {
    setPagination(newPagination);
    // For cursor-based pagination, we might need to track cursors differently
    // For now, let's reset to beginning if page size changes
    if (newPagination.pageSize !== pagination.pageSize) {
      const searchParams: SearchParams = {
        selectedFields,
        pageSize: newPagination.pageSize,
        cursor: '',
        sorting,
        globalFilter,
        filters
      };
  // reset cursor history when page size changes
  setCursorHistory([{ cursor: '' }]);
      setCurrentIndex(0);

      setIsLoading(true);
      try {
        const result = await getDomainData(searchParams);
        updatePaginationState(result);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedFields, pagination.pageSize, sorting, globalFilter, filters]);

  // Handle global filter changes
  const handleGlobalFilterChange = useCallback(async (newFilter: string) => {
    setGlobalFilter(newFilter);
    const searchParams: SearchParams = {
      selectedFields,
      pageSize: pagination.pageSize,
      cursor: '',
      sorting,
      globalFilter: newFilter,
      filters
    };
  // reset cursor history when filter changes
  setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);

    setIsLoading(true);
    try {
      const result = await getDomainData(searchParams);
      updatePaginationState(result);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, pagination.pageSize, sorting, filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback(async (newFilters: FilterState) => {
    console.log('🔍 Applying new filters:', newFilters);
    // Check if filters actually changed
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
      console.log('🔍 No filter changes detected, skipping fetch');
      return;
    }
    
    setFilters(newFilters);
    // reset cursor history when filters change
    setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);

    setIsLoading(true);
    try {
      const searchParams: SearchParams = {
        selectedFields,
        pageSize: pagination.pageSize,
        cursor: '',
        sorting,
        globalFilter,
        filters: newFilters
      };
      const result = await getDomainData(searchParams);
      updatePaginationState(result);
      console.log('✅ Filters applied successfully');
    } catch (error) {
      console.error('❌ Error applying filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, pagination.pageSize, sorting, globalFilter, filters]);

  // Handle batch changes (fields + filters together)
  const handleBatchChange = useCallback(async (newFields: AvailableField[], newFilters: FilterState) => {
    console.log('🔄 Applying batch changes - fields and filters together');
    // Check if anything actually changed
    const fieldsChanged = JSON.stringify(newFields) !== JSON.stringify(selectedFields);
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);
    
    if (!fieldsChanged && !filtersChanged) {
      console.log('🔄 No changes detected, skipping fetch');
      return;
    }
    
    // Update both states
    setSelectedFields(newFields);
    setFilters(newFilters);
    // reset cursor history
    setCursorHistory([{ cursor: '' }]);
    setCurrentIndex(0);

    setIsLoading(true);
    try {
      const searchParams: SearchParams = {
        selectedFields: newFields,
        pageSize: pagination.pageSize,
        cursor: '',
        sorting,
        globalFilter,
        filters: newFilters
      };
      const result = await getDomainData(searchParams);
      updatePaginationState(result);
      console.log('✅ Batch changes applied successfully');
    } catch (error) {
      console.error('❌ Error applying batch changes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFields, filters, pagination.pageSize, sorting, globalFilter]);

  // Keep local input in sync with applied globalFilter when it changes externally
  React.useEffect(() => {
    setSearchInput(globalFilter);
  }, [globalFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Search bar above column controls */}
      <div
        className="w-full p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => {
            // Apply search when user triggers it (button or Enter)
            handleGlobalFilterChange(val);
          }}
        />
      </div>
      
      {/* Combined Table Controls (Filters + Column Selection) */}
      <TableControls
        selectedFields={selectedFields}
        onFieldsChange={handleFieldsChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onBatchChange={handleBatchChange}
      />

      {/* Table or Loading Skeleton */}
      {isLoading ? (
        <SearchDomainSkeleton rows={pagination.pageSize} />
      ) : (
        <DataTable 
          data={data}
          selectedFields={selectedFields}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          totalData={totalData}
          atData={atData}
          dataCount={dataCount}
          nextCursor={nextCursor || undefined}
          currentCursor={cursorHistory[currentIndex]?.cursor || ''}
          onFirstPage={handleFirstPage}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          canGoToFirstPage={canGoToFirstPage}
          canGoToPreviousPage={canGoToPreviousPage}
          canGoToNextPage={canGoToNextPage}
        />
      )}
    </div>
  );
};

export default TableSearch;