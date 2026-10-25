import { createContext, useContext, useRef, useMemo, useEffect, ReactNode } from 'react';
import { useARecordInfo } from '../api/aRecordInfo';
import { ARecordInfoResult } from '@/types/graphql';
import { useDomainData } from './varData';
import { utcToLocalISO } from '@/utils/dateTime';

/**
 * A Record Info Data stored in ref (no re-renders)
 */
interface ARecordInfoDataRef {
  aRecordInfo: ARecordInfoResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * A Record Info Data Context Interface
 */
interface ARecordInfoDataContextType {
  getARecordInfo: (domainId?: number) => Promise<ARecordInfoResult | null>;
  insertARecordInfo: (domainId?: number) => Promise<ARecordInfoResult | null>;
  clearARecordInfo: () => void;
  isLoading: () => boolean;
  getError: () => string | null;
}

/**
 * Create A Record Info Data Context
 */
const ARecordInfoDataContext = createContext<ARecordInfoDataContextType | undefined>(undefined);

/**
 * A Record Info Data Provider Props
 */
interface ARecordInfoDataProviderProps {
  children: ReactNode;
}

/**
 * A Record Info Data Provider Component
 * Manages A record info data using useRef for page-level memory without re-renders
 * Automatically fetches data when not in cache
 * 
 * @example
 * <ARecordInfoDataProvider>
 *   <YourComponents />
 * </ARecordInfoDataProvider>
 */
export function ARecordInfoDataProvider({ children }: ARecordInfoDataProviderProps) {
  const aRecordInfoDataRef = useRef<ARecordInfoDataRef>({
    aRecordInfo: null,
    isLoading: false,
    error: null,
  });

  const { fetchARecordInfo } = useARecordInfo();
  const { getDomainId, subscribeToChanges } = useDomainData();

  // Subscribe to domain ID changes and clear cache
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      // console.log('🗑️ A Record Info: Domain ID changed, clearing cache');
      aRecordInfoDataRef.current.aRecordInfo = null;
      aRecordInfoDataRef.current.error = null;
      aRecordInfoDataRef.current.isLoading = false;
    });
    return unsubscribe;
  }, [subscribeToChanges]);

  const contextValue = useMemo<ARecordInfoDataContextType>(() => ({
    /**
     * Get A record info data
     * If data is not in cache, automatically fetches from API
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with A record info or null
     */
    getARecordInfo: async (domainId?: number): Promise<ARecordInfoResult | null> => {
      try {
        // If data already exists in cache, return it
        if (aRecordInfoDataRef.current.aRecordInfo !== null) {
          // console.log('✅ A Record Info data from cache');
          return aRecordInfoDataRef.current.aRecordInfo;
        }

        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          aRecordInfoDataRef.current.error = errorMsg;
          return null;
        }

        // Data not in cache, fetch it
        // console.log('📡 Fetching A Record Info for domain ID:', targetDomainId);
        aRecordInfoDataRef.current.isLoading = true;
        aRecordInfoDataRef.current.error = null;

        const result = await fetchARecordInfo(targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: ARecordInfoResult = {
            aRecords: result.aRecords.map(record => ({
              ...record,
              firstSeen: record.firstSeen ? utcToLocalISO(record.firstSeen) : record.firstSeen,
              lastSeen: record.lastSeen ? utcToLocalISO(record.lastSeen) : record.lastSeen,
              lowestTtlTime: record.lowestTtlTime ? utcToLocalISO(record.lowestTtlTime) : record.lowestTtlTime,
            })),
            ipReuseInfo: result.ipReuseInfo // No timestamps in ipReuseInfo
          };
          
          aRecordInfoDataRef.current.aRecordInfo = processedResult;
          aRecordInfoDataRef.current.isLoading = false;
          // console.log('✅ A Record Info fetched, timestamps converted, and cached');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to fetch A Record Info for domain ID: ${targetDomainId}`;
          console.error(errorMsg);
          aRecordInfoDataRef.current.error = errorMsg;
          aRecordInfoDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in getARecordInfo: ${err}`;
        console.error(errorMsg, err);
        aRecordInfoDataRef.current.error = errorMsg;
        aRecordInfoDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Insert/Fetch A record info (always fetches fresh data)
     * Resets cache and fetches new data from API
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with A record info or null
     */
    insertARecordInfo: async (domainId?: number): Promise<ARecordInfoResult | null> => {
      try {
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          aRecordInfoDataRef.current.error = errorMsg;
          return null;
        }

        // console.log('🔄 Inserting/Fetching fresh A Record Info for domain ID:', targetDomainId);
        aRecordInfoDataRef.current.isLoading = true;
        aRecordInfoDataRef.current.error = null;
        
        const result = await fetchARecordInfo(targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: ARecordInfoResult = {
            aRecords: result.aRecords.map(record => ({
              ...record,
              firstSeen: record.firstSeen ? utcToLocalISO(record.firstSeen) : record.firstSeen,
              lastSeen: record.lastSeen ? utcToLocalISO(record.lastSeen) : record.lastSeen,
              lowestTtlTime: record.lowestTtlTime ? utcToLocalISO(record.lowestTtlTime) : record.lowestTtlTime,
            })),
            ipReuseInfo: result.ipReuseInfo
          };
          
          aRecordInfoDataRef.current.aRecordInfo = processedResult;
          aRecordInfoDataRef.current.isLoading = false;
          // console.log('✅ A Record Info inserted/updated in cache');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to insert A Record Info for domain ID: ${targetDomainId}`;
          console.error(errorMsg);
          aRecordInfoDataRef.current.error = errorMsg;
          aRecordInfoDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in insertARecordInfo: ${err}`;
        console.error(errorMsg, err);
        aRecordInfoDataRef.current.error = errorMsg;
        aRecordInfoDataRef.current.isLoading = false;
        return null;
      }
    },

    clearARecordInfo: () => {
      aRecordInfoDataRef.current.aRecordInfo = null;
      aRecordInfoDataRef.current.error = null;
      aRecordInfoDataRef.current.isLoading = false;
      // console.log('🗑️ A Record Info cache cleared');
    },

    isLoading: () => aRecordInfoDataRef.current.isLoading,
    getError: () => aRecordInfoDataRef.current.error,
  }), [fetchARecordInfo, getDomainId]);

  return (
    <ARecordInfoDataContext.Provider value={contextValue}>
      {children}
    </ARecordInfoDataContext.Provider>
  );
}

/**
 * Custom hook to access A Record Info Data Context
 * 
 * @example
 * const { getARecordInfo, insertARecordInfo } = useARecordInfoData();
 * const data = await getARecordInfo(); // Uses varData domain ID
 * const data = await getARecordInfo(5); // Uses specific domain ID
 */
export function useARecordInfoData(): ARecordInfoDataContextType {
  const context = useContext(ARecordInfoDataContext);
  
  if (context === undefined) {
    throw new Error('useARecordInfoData must be used within an ARecordInfoDataProvider');
  }
  
  return context;
}
