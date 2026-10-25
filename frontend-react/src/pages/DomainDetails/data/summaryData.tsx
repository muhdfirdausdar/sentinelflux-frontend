import { createContext, useContext, useRef, useMemo, useEffect, ReactNode } from 'react';
import { useDomainSummary } from '../api/summary';
import { DomainDetailsSummary } from '@/types/graphql';
import { useDomainData } from './varData';
import { utcToLocalISO } from '@/utils/dateTime';

/**
 * Summary Data stored in ref (no re-renders)
 */
interface SummaryDataRef {
  summary: DomainDetailsSummary | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Summary Data Context Interface
 */
interface SummaryDataContextType {
  getSummary: (domainId?: number) => Promise<DomainDetailsSummary | null>;
  insertSummary: (domainId?: number) => Promise<DomainDetailsSummary | null>;
  clearSummary: () => void;
  isLoading: () => boolean;
  getError: () => string | null;
}

/**
 * Create Summary Data Context
 */
const SummaryDataContext = createContext<SummaryDataContextType | undefined>(undefined);

/**
 * Summary Data Provider Props
 */
interface SummaryDataProviderProps {
  children: ReactNode;
}

/**
 * Summary Data Provider Component
 * Manages domain summary data using useRef for page-level memory without re-renders
 * Automatically fetches data when not in cache
 * 
 * @example
 * <SummaryDataProvider>
 *   <YourComponents />
 * </SummaryDataProvider>
 */
export function SummaryDataProvider({ children }: SummaryDataProviderProps) {
  // Use ref to store data without triggering re-renders
  const summaryDataRef = useRef<SummaryDataRef>({
    summary: null,
    isLoading: false,
    error: null,
  });

  // Track ongoing fetch to prevent duplicate requests
  const fetchInProgressRef = useRef<Promise<DomainDetailsSummary | null> | null>(null);

  const { fetchSummary } = useDomainSummary();
  const { getDomainId, subscribeToChanges } = useDomainData();

  // Subscribe to domain ID changes and clear cache when it changes
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      // console.log('🗑️ Summary: Domain ID changed, clearing cache');
      summaryDataRef.current.summary = null;
      summaryDataRef.current.error = null;
      summaryDataRef.current.isLoading = false;
    });
    
    return unsubscribe;
  }, [subscribeToChanges]);

  // Memoize the context value (functions don't change, so no re-renders)
  const contextValue = useMemo<SummaryDataContextType>(() => ({
    /**
     * Get summary data
     * If data is not in cache, automatically fetches from API
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with summary data or null
     */
    getSummary: async (domainId?: number): Promise<DomainDetailsSummary | null> => {
      try {
        // If data already exists in cache, return it
        if (summaryDataRef.current.summary !== null) {
          // console.log('✅ Summary data from cache');
          return summaryDataRef.current.summary;
        }

        // If a fetch is already in progress, wait for it instead of starting a new one
        if (fetchInProgressRef.current) {
          // console.log('⏳ Summary fetch already in progress, waiting...');
          return await fetchInProgressRef.current;
        }

        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          summaryDataRef.current.error = errorMsg;
          return null;
        }

        // Data not in cache, fetch it
        // console.log('📡 Fetching summary data for domain ID:', targetDomainId);
        summaryDataRef.current.isLoading = true;
        summaryDataRef.current.error = null;

        // Store the fetch promise to prevent duplicate requests
        const fetchPromise = fetchSummary(targetDomainId);
        fetchInProgressRef.current = fetchPromise;

        const result = await fetchPromise;

        // Clear the in-progress ref
        fetchInProgressRef.current = null;

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: DomainDetailsSummary = {
            ...result,
            domFirstSeen: result.domFirstSeen ? utcToLocalISO(result.domFirstSeen) : result.domFirstSeen,
            domLastSeen: result.domLastSeen ? utcToLocalISO(result.domLastSeen) : result.domLastSeen,
            lastMalUpdated: result.lastMalUpdated ? utcToLocalISO(result.lastMalUpdated) : result.lastMalUpdated,
          };
          
          summaryDataRef.current.summary = processedResult;
          summaryDataRef.current.isLoading = false;
          summaryDataRef.current.error = null; // Clear any previous errors on success
          // console.log('✅ Summary data fetched, timestamps converted, and cached');
          return processedResult;
        } else {
          // Result is null - could be abort error or actual failure
          // Only log error if we don't have cached data and this isn't a redundant request
          if (!summaryDataRef.current.summary) {
            const errorMsg = `Failed to fetch summary data for domain ID: ${targetDomainId}`;
            console.warn('⚠️', errorMsg);
            summaryDataRef.current.error = errorMsg;
          }
          summaryDataRef.current.isLoading = false;
          return summaryDataRef.current.summary; // Return cached data if available
        }
      } catch (err) {
        // Clear the in-progress ref on error
        fetchInProgressRef.current = null;
        
        const errorMsg = `Error in getSummary: ${err}`;
        console.warn('⚠️', errorMsg, err);
        summaryDataRef.current.error = errorMsg;
        summaryDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Insert/Fetch summary data (always fetches fresh data)
     * Resets cache and fetches new data from API
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with summary data or null
     */
    insertSummary: async (domainId?: number): Promise<DomainDetailsSummary | null> => {
      try {
        // If a fetch is already in progress, wait for it
        if (fetchInProgressRef.current) {
          // console.log('⏳ Summary fetch already in progress, waiting...');
          return await fetchInProgressRef.current;
        }

        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          summaryDataRef.current.error = errorMsg;
          return null;
        }

        // console.log('🔄 Inserting/Fetching fresh summary data for domain ID:', targetDomainId);
        summaryDataRef.current.isLoading = true;
        summaryDataRef.current.error = null;
        
        // Always fetch fresh data - store promise to prevent duplicates
        const fetchPromise = fetchSummary(targetDomainId);
        fetchInProgressRef.current = fetchPromise;
        
        const result = await fetchPromise;

        // Clear the in-progress ref
        fetchInProgressRef.current = null;

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: DomainDetailsSummary = {
            ...result,
            domFirstSeen: result.domFirstSeen ? utcToLocalISO(result.domFirstSeen) : result.domFirstSeen,
            domLastSeen: result.domLastSeen ? utcToLocalISO(result.domLastSeen) : result.domLastSeen,
            lastMalUpdated: result.lastMalUpdated ? utcToLocalISO(result.lastMalUpdated) : result.lastMalUpdated,
          };
          
          // Reset and store new data
          summaryDataRef.current.summary = processedResult;
          summaryDataRef.current.isLoading = false;
          summaryDataRef.current.error = null;
          // console.log('✅ Summary data inserted/updated in cache');
          return processedResult;
        } else {
          const errorMsg = `Failed to insert summary data for domain ID: ${targetDomainId}`;
          console.warn('⚠️', errorMsg);
          summaryDataRef.current.error = errorMsg;
          summaryDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        // Clear the in-progress ref on error
        fetchInProgressRef.current = null;
        
        const errorMsg = `Error in insertSummary: ${err}`;
        console.warn('⚠️', errorMsg, err);
        summaryDataRef.current.error = errorMsg;
        summaryDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Clear cached summary data
     */
    clearSummary: () => {
      summaryDataRef.current.summary = null;
      summaryDataRef.current.error = null;
      summaryDataRef.current.isLoading = false;
      fetchInProgressRef.current = null;
      // console.log('🗑️ Summary data cache cleared');
    },

    /**
     * Check if data is currently loading
     * @returns Boolean indicating loading state
     */
    isLoading: () => {
      return summaryDataRef.current.isLoading;
    },

    /**
     * Get current error message if any
     * @returns Error message or null
     */
    getError: () => {
      // Only return error if we have no data
      if (summaryDataRef.current.summary) {
        return null; // We have data, so no error
      }
      return summaryDataRef.current.error;
    },
  }), [fetchSummary, getDomainId]); // Dependencies for API hooks

  return (
    <SummaryDataContext.Provider value={contextValue}>
      {children}
    </SummaryDataContext.Provider>
  );
}

/**
 * Custom hook to access Summary Data Context
 * 
 * @example
 * const { getSummary, insertSummary, clearSummary } = useSummaryData();
 * 
 * // Get summary (auto-fetches if not cached)
 * const summary = await getSummary(); // Uses domain ID from varData
 * const summary = await getSummary(5); // Uses specific domain ID
 * 
 * // Insert/Refresh summary (always fetches fresh)
 * const summary = await insertSummary(5);
 * 
 * // Clear cache
 * clearSummary();
 */
export function useSummaryData(): SummaryDataContextType {
  const context = useContext(SummaryDataContext);
  
  if (context === undefined) {
    throw new Error('useSummaryData must be used within a SummaryDataProvider');
  }
  
  return context;
}

/**
 * Sample usage in components:
 * 
 * // Basic usage with varData domain ID
 * const { getSummary } = useSummaryData();
 * const summary = await getSummary();
 * console.log(summary?.domainName); // "example.com"
 * 
 * // Force refresh
 * const { insertSummary } = useSummaryData();
 * const freshSummary = await insertSummary();
 * 
 * // With specific domain ID
 * const summary = await getSummary(5);
 * 
 * // Check loading/error state
 * const { isLoading, getError } = useSummaryData();
 * if (isLoading()) console.log("Loading...");
 * if (getError()) console.log("Error:", getError());
 */
