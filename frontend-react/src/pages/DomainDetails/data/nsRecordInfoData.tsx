import { createContext, useContext, useRef, useMemo, useEffect, ReactNode } from 'react';
import { useNSRecordInfo } from '../api/nsRecordInfo';
import { NSRecordInfoResult } from '@/types/graphql';
import { useDomainData } from './varData';
import { utcToLocalISO } from '@/utils/dateTime';

/**
 * NS Record Info Data stored in ref (no re-renders)
 */
interface NSRecordInfoDataRef {
  nsRecordInfo: NSRecordInfoResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * NS Record Info Data Context Interface
 */
interface NSRecordInfoDataContextType {
  getNSRecordInfo: (domainId?: number) => Promise<NSRecordInfoResult | null>;
  insertNSRecordInfo: (domainId?: number) => Promise<NSRecordInfoResult | null>;
  clearNSRecordInfo: () => void;
  isLoading: () => boolean;
  getError: () => string | null;
}

/**
 * Create NS Record Info Data Context
 */
const NSRecordInfoDataContext = createContext<NSRecordInfoDataContextType | undefined>(undefined);

/**
 * NS Record Info Data Provider Props
 */
interface NSRecordInfoDataProviderProps {
  children: ReactNode;
}

/**
 * NS Record Info Data Provider Component
 * Manages NS record info data using useRef for page-level memory without re-renders
 * 
 * @example
 * <NSRecordInfoDataProvider>
 *   <YourComponents />
 * </NSRecordInfoDataProvider>
 */
export function NSRecordInfoDataProvider({ children }: NSRecordInfoDataProviderProps) {
  const nsRecordInfoDataRef = useRef<NSRecordInfoDataRef>({
    nsRecordInfo: null,
    isLoading: false,
    error: null,
  });

  const { fetchNSRecordInfo } = useNSRecordInfo();
  const { getDomainId, subscribeToChanges } = useDomainData();

  // Subscribe to domain ID changes and clear cache
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      // console.log('🗑️ NS Record Info: Domain ID changed, clearing cache');
      nsRecordInfoDataRef.current.nsRecordInfo = null;
      nsRecordInfoDataRef.current.error = null;
      nsRecordInfoDataRef.current.isLoading = false;
    });
    return unsubscribe;
  }, [subscribeToChanges]);

  const contextValue = useMemo<NSRecordInfoDataContextType>(() => ({
    /**
     * Get NS record info data
     * If data is not in cache, automatically fetches from API
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with NS record info or null
     */
    getNSRecordInfo: async (domainId?: number): Promise<NSRecordInfoResult | null> => {
      try {
        // If data already exists in cache, return it
        if (nsRecordInfoDataRef.current.nsRecordInfo !== null) {
          // console.log('✅ NS Record Info data from cache');
          return nsRecordInfoDataRef.current.nsRecordInfo;
        }

        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          nsRecordInfoDataRef.current.error = errorMsg;
          return null;
        }

        // Data not in cache, fetch it
        // console.log('📡 Fetching NS Record Info for domain ID:', targetDomainId);
        nsRecordInfoDataRef.current.isLoading = true;
        nsRecordInfoDataRef.current.error = null;

        const result = await fetchNSRecordInfo(targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: NSRecordInfoResult = {
            nsRecords: result.nsRecords.map(record => ({
              ...record,
              firstSeen: record.firstSeen ? utcToLocalISO(record.firstSeen) : record.firstSeen,
              lastSeen: record.lastSeen ? utcToLocalISO(record.lastSeen) : record.lastSeen,
              lowestTtlTime: record.lowestTtlTime ? utcToLocalISO(record.lowestTtlTime) : record.lowestTtlTime,
            })),
            nsToIpsInfo: result.nsToIpsInfo.map(info => ({
              ...info,
              firstSeen: info.firstSeen ? utcToLocalISO(info.firstSeen) : info.firstSeen,
              lastSeen: info.lastSeen ? utcToLocalISO(info.lastSeen) : info.lastSeen,
              ipNsLowestTtlTime: info.ipNsLowestTtlTime ? utcToLocalISO(info.ipNsLowestTtlTime) : info.ipNsLowestTtlTime,
            }))
          };
          
          nsRecordInfoDataRef.current.nsRecordInfo = processedResult;
          nsRecordInfoDataRef.current.isLoading = false;
          // console.log('✅ NS Record Info fetched, timestamps converted, and cached');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to fetch NS Record Info for domain ID: ${targetDomainId}`;
          console.error(errorMsg);
          nsRecordInfoDataRef.current.error = errorMsg;
          nsRecordInfoDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in getNSRecordInfo: ${err}`;
        console.error(errorMsg, err);
        nsRecordInfoDataRef.current.error = errorMsg;
        nsRecordInfoDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Insert/Fetch NS record info (always fetches fresh data)
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with NS record info or null
     */
    insertNSRecordInfo: async (domainId?: number): Promise<NSRecordInfoResult | null> => {
      try {
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          nsRecordInfoDataRef.current.error = errorMsg;
          return null;
        }

        // console.log('🔄 Inserting/Fetching fresh NS Record Info for domain ID:', targetDomainId);
        nsRecordInfoDataRef.current.isLoading = true;
        nsRecordInfoDataRef.current.error = null;
        
        const result = await fetchNSRecordInfo(targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: NSRecordInfoResult = {
            nsRecords: result.nsRecords.map(record => ({
              ...record,
              firstSeen: record.firstSeen ? utcToLocalISO(record.firstSeen) : record.firstSeen,
              lastSeen: record.lastSeen ? utcToLocalISO(record.lastSeen) : record.lastSeen,
              lowestTtlTime: record.lowestTtlTime ? utcToLocalISO(record.lowestTtlTime) : record.lowestTtlTime,
            })),
            nsToIpsInfo: result.nsToIpsInfo.map(info => ({
              ...info,
              firstSeen: info.firstSeen ? utcToLocalISO(info.firstSeen) : info.firstSeen,
              lastSeen: info.lastSeen ? utcToLocalISO(info.lastSeen) : info.lastSeen,
              ipNsLowestTtlTime: info.ipNsLowestTtlTime ? utcToLocalISO(info.ipNsLowestTtlTime) : info.ipNsLowestTtlTime,
            }))
          };
          
          nsRecordInfoDataRef.current.nsRecordInfo = processedResult;
          nsRecordInfoDataRef.current.isLoading = false;
          // console.log('✅ NS Record Info inserted/updated in cache');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to insert NS Record Info for domain ID: ${targetDomainId}`;
          console.error(errorMsg);
          nsRecordInfoDataRef.current.error = errorMsg;
          nsRecordInfoDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in insertNSRecordInfo: ${err}`;
        console.error(errorMsg, err);
        nsRecordInfoDataRef.current.error = errorMsg;
        nsRecordInfoDataRef.current.isLoading = false;
        return null;
      }
    },

    clearNSRecordInfo: () => {
      nsRecordInfoDataRef.current.nsRecordInfo = null;
      nsRecordInfoDataRef.current.error = null;
      nsRecordInfoDataRef.current.isLoading = false;
      // console.log('🗑️ NS Record Info cache cleared');
    },

    isLoading: () => nsRecordInfoDataRef.current.isLoading,
    getError: () => nsRecordInfoDataRef.current.error,
  }), [fetchNSRecordInfo, getDomainId]);

  return (
    <NSRecordInfoDataContext.Provider value={contextValue}>
      {children}
    </NSRecordInfoDataContext.Provider>
  );
}

/**
 * Custom hook to access NS Record Info Data Context
 * 
 * @example
 * const { getNSRecordInfo, insertNSRecordInfo } = useNSRecordInfoData();
 * const data = await getNSRecordInfo(); // Uses varData domain ID
 * const data = await getNSRecordInfo(5); // Uses specific domain ID
 */
export function useNSRecordInfoData(): NSRecordInfoDataContextType {
  const context = useContext(NSRecordInfoDataContext);
  
  if (context === undefined) {
    throw new Error('useNSRecordInfoData must be used within an NSRecordInfoDataProvider');
  }
  
  return context;
}
