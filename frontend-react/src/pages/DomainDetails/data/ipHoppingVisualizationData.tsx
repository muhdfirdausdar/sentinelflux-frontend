import { createContext, useContext, useRef, useMemo, useEffect, ReactNode } from 'react';
import { useIPHoppingVisualization } from '../api/ipHoppingVisualization';
import { IPHoppingVisualizationResult } from '@/types/graphql';
import { useDomainData } from './varData';
import { utcToLocalISO } from '@/utils/dateTime';

/**
 * IP Hopping Visualization Data stored in ref (no re-renders)
 * Key structure: `${domainId}_${daysBack}` for unique caching
 */
interface IPHoppingVisualizationDataRef {
  cache: Map<string, IPHoppingVisualizationResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * IP Hopping Visualization Data Context Interface
 */
interface IPHoppingVisualizationDataContextType {
  getIPHopping: (daysBack?: number, domainId?: number) => Promise<IPHoppingVisualizationResult | null>;
  insertIPHopping: (daysBack?: number, domainId?: number) => Promise<IPHoppingVisualizationResult | null>;
  clearIPHopping: () => void;
  isLoading: () => boolean;
  getError: () => string | null;
}

/**
 * Create IP Hopping Visualization Data Context
 */
const IPHoppingVisualizationDataContext = createContext<IPHoppingVisualizationDataContextType | undefined>(undefined);

/**
 * IP Hopping Visualization Data Provider Props
 */
interface IPHoppingVisualizationDataProviderProps {
  children: ReactNode;
}

/**
 * IP Hopping Visualization Data Provider Component
 * Manages IP hopping data with Map-based caching for multiple domainId/daysBack combinations
 * 
 * @example
 * <IPHoppingVisualizationDataProvider>
 *   <YourComponents />
 * </IPHoppingVisualizationDataProvider>
 */
export function IPHoppingVisualizationDataProvider({ children }: IPHoppingVisualizationDataProviderProps) {
  const ipHoppingDataRef = useRef<IPHoppingVisualizationDataRef>({
    cache: new Map(),
    isLoading: false,
    error: null,
  });

  const { fetchIPHopping } = useIPHoppingVisualization();
  const { getDomainId, subscribeToChanges } = useDomainData();

  // Subscribe to domain ID changes and clear cache
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      // console.log('🗑️ IP Hopping: Domain ID changed, clearing all cached entries');
      ipHoppingDataRef.current.cache.clear();
      ipHoppingDataRef.current.error = null;
      ipHoppingDataRef.current.isLoading = false;
    });
    return unsubscribe;
  }, [subscribeToChanges]);

  const contextValue = useMemo<IPHoppingVisualizationDataContextType>(() => ({
    /**
     * Get IP hopping visualization data
     * @param daysBack - Optional number of days to look back (defaults to 60)
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with IP hopping data or null
     */
    getIPHopping: async (daysBack: number = 60, domainId?: number): Promise<IPHoppingVisualizationResult | null> => {
      try {
        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          ipHoppingDataRef.current.error = errorMsg;
          return null;
        }

        // Use default daysBack if not provided
        const targetDaysBack = daysBack ?? 60;

        // Create cache key
        const cacheKey = `${targetDomainId}_${targetDaysBack}`;

        // Check cache
        if (ipHoppingDataRef.current.cache.has(cacheKey)) {
          // console.log(`✅ IP Hopping data from cache (domainId: ${targetDomainId}, daysBack: ${targetDaysBack})`);
          return ipHoppingDataRef.current.cache.get(cacheKey)!;
        }

        // Data not in cache, fetch it
        // console.log(`📡 Fetching IP Hopping for domainId: ${targetDomainId}, daysBack: ${targetDaysBack}`);
        ipHoppingDataRef.current.isLoading = true;
        ipHoppingDataRef.current.error = null;

        const result = await fetchIPHopping(targetDomainId, targetDaysBack);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: IPHoppingVisualizationResult = {
            domainId: result.domainId,
            timeGroups: result.timeGroups.map(group => ({
              ...group,
              timestamp: group.timestamp ? utcToLocalISO(group.timestamp) : group.timestamp,
              ips: group.ips // No timestamps in individual IPs
            }))
          };
          
          ipHoppingDataRef.current.cache.set(cacheKey, processedResult);
          ipHoppingDataRef.current.isLoading = false;
          // console.log('✅ IP Hopping data fetched, timestamps converted, and cached');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to fetch IP Hopping for domainId: ${targetDomainId}, daysBack: ${daysBack}`;
          console.error(errorMsg);
          ipHoppingDataRef.current.error = errorMsg;
          ipHoppingDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in getIPHopping: ${err}`;
        console.error(errorMsg, err);
        ipHoppingDataRef.current.error = errorMsg;
        ipHoppingDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Insert/Fetch IP hopping visualization (always fetches fresh data)
     * @param daysBack - Optional number of days to look back (defaults to 60)
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with IP hopping data or null
     */
    insertIPHopping: async (daysBack: number = 60, domainId?: number): Promise<IPHoppingVisualizationResult | null> => {
      try {
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          ipHoppingDataRef.current.error = errorMsg;
          return null;
        }

        // Use default daysBack if not provided
        const targetDaysBack = daysBack ?? 60;

        // console.log(`🔄 Inserting/Fetching fresh IP Hopping for domainId: ${targetDomainId}, daysBack: ${targetDaysBack}`);
        ipHoppingDataRef.current.isLoading = true;
        ipHoppingDataRef.current.error = null;
        
        const result = await fetchIPHopping(targetDomainId, targetDaysBack);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: IPHoppingVisualizationResult = {
            domainId: result.domainId,
            timeGroups: result.timeGroups.map(group => ({
              ...group,
              timestamp: group.timestamp ? utcToLocalISO(group.timestamp) : group.timestamp,
              ips: group.ips
            }))
          };
          
          const cacheKey = `${targetDomainId}_${targetDaysBack}`;
          ipHoppingDataRef.current.cache.set(cacheKey, processedResult);
          ipHoppingDataRef.current.isLoading = false;
          // console.log('✅ IP Hopping data inserted/updated in cache');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to insert IP Hopping for domainId: ${targetDomainId}, daysBack: ${targetDaysBack}`;
          console.error(errorMsg);
          ipHoppingDataRef.current.error = errorMsg;
          ipHoppingDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in insertIPHopping: ${err}`;
        console.error(errorMsg, err);
        ipHoppingDataRef.current.error = errorMsg;
        ipHoppingDataRef.current.isLoading = false;
        return null;
      }
    },

    clearIPHopping: () => {
      ipHoppingDataRef.current.cache.clear();
      ipHoppingDataRef.current.error = null;
      ipHoppingDataRef.current.isLoading = false;
      // console.log('🗑️ IP Hopping cache cleared');
    },

    isLoading: () => ipHoppingDataRef.current.isLoading,
    getError: () => ipHoppingDataRef.current.error,
  }), [fetchIPHopping, getDomainId]);

  return (
    <IPHoppingVisualizationDataContext.Provider value={contextValue}>
      {children}
    </IPHoppingVisualizationDataContext.Provider>
  );
}

/**
 * Custom hook to access IP Hopping Visualization Data Context
 * 
 * @example
 * const { getIPHopping } = useIPHoppingVisualizationData();
 * // Both parameters are optional
 * const data = await getIPHopping(); // daysBack=60 (default), domainId from varData
 * const data = await getIPHopping(30); // daysBack=30, domainId from varData
 * const data = await getIPHopping(30, 5); // daysBack=30, domainId=5
 */
export function useIPHoppingVisualizationData(): IPHoppingVisualizationDataContextType {
  const context = useContext(IPHoppingVisualizationDataContext);
  
  if (context === undefined) {
    throw new Error('useIPHoppingVisualizationData must be used within an IPHoppingVisualizationDataProvider');
  }
  
  return context;
}
