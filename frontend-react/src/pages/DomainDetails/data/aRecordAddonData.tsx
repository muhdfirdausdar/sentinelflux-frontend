import { createContext, useContext, useRef, useMemo, useEffect, ReactNode } from 'react';
import { useARecordAddon } from '../api/aRecordAddon';
import { ARecordAddonResult } from '@/types/graphql';
import { useDomainData } from './varData';
import { utcToLocalISO } from '@/utils/dateTime';

/**
 * A Record Addon Data stored in ref (no re-renders)
 * Key structure: `${ipId}_${domainId}` for unique caching
 */
interface ARecordAddonDataRef {
  cache: Map<string, ARecordAddonResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * A Record Addon Data Context Interface
 */
interface ARecordAddonDataContextType {
  getARecordAddon: (ipId: number, domainId?: number) => Promise<ARecordAddonResult | null>;
  insertARecordAddon: (ipId: number, domainId?: number) => Promise<ARecordAddonResult | null>;
  clearARecordAddon: () => void;
  isLoading: () => boolean;
  getError: () => string | null;
}

/**
 * Create A Record Addon Data Context
 */
const ARecordAddonDataContext = createContext<ARecordAddonDataContextType | undefined>(undefined);

/**
 * A Record Addon Data Provider Props
 */
interface ARecordAddonDataProviderProps {
  children: ReactNode;
}

/**
 * A Record Addon Data Provider Component
 * Manages A record addon data with Map-based caching for multiple ipId/domainId combinations
 * 
 * @example
 * <ARecordAddonDataProvider>
 *   <YourComponents />
 * </ARecordAddonDataProvider>
 */
export function ARecordAddonDataProvider({ children }: ARecordAddonDataProviderProps) {
  const aRecordAddonDataRef = useRef<ARecordAddonDataRef>({
    cache: new Map(),
    isLoading: false,
    error: null,
  });

  const { fetchARecordAddon } = useARecordAddon();
  const { getDomainId, subscribeToChanges } = useDomainData();

  // Subscribe to domain ID changes and clear cache
  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      // console.log('🗑️ A Record Addon: Domain ID changed, clearing all cached entries');
      aRecordAddonDataRef.current.cache.clear();
      aRecordAddonDataRef.current.error = null;
      aRecordAddonDataRef.current.isLoading = false;
    });
    return unsubscribe;
  }, [subscribeToChanges]);

  const contextValue = useMemo<ARecordAddonDataContextType>(() => ({
    /**
     * Get A record addon data
     * @param ipId - REQUIRED IP ID (mandatory parameter)
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with A record addon or null
     */
    getARecordAddon: async (ipId: number, domainId?: number): Promise<ARecordAddonResult | null> => {
      try {
        // Determine which domain ID to use
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          aRecordAddonDataRef.current.error = errorMsg;
          return null;
        }

        // Create cache key
        const cacheKey = `${ipId}_${targetDomainId}`;

        // Check cache
        if (aRecordAddonDataRef.current.cache.has(cacheKey)) {
          // console.log(`✅ A Record Addon data from cache (ipId: ${ipId}, domainId: ${targetDomainId})`);
          return aRecordAddonDataRef.current.cache.get(cacheKey)!;
        }

        // Data not in cache, fetch it
        // console.log(`📡 Fetching A Record Addon for ipId: ${ipId}, domainId: ${targetDomainId}`);
        aRecordAddonDataRef.current.isLoading = true;
        aRecordAddonDataRef.current.error = null;

        const result = await fetchARecordAddon(ipId, targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: ARecordAddonResult = {
            relatedDomain: result.relatedDomain.map(domain => ({
              ...domain,
              firstSeen: domain.firstSeen ? utcToLocalISO(domain.firstSeen) : domain.firstSeen,
              lastSeen: domain.lastSeen ? utcToLocalISO(domain.lastSeen) : domain.lastSeen,
            })),
            relatedNameserver: result.relatedNameserver.map(ns => ({
              ...ns,
              firstSeen: ns.firstSeen ? utcToLocalISO(ns.firstSeen) : ns.firstSeen,
              lastSeen: ns.lastSeen ? utcToLocalISO(ns.lastSeen) : ns.lastSeen,
            }))
          };
          
          aRecordAddonDataRef.current.cache.set(cacheKey, processedResult);
          aRecordAddonDataRef.current.isLoading = false;
          // console.log('✅ A Record Addon fetched, timestamps converted, and cached');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to fetch A Record Addon for ipId: ${ipId}, domainId: ${targetDomainId}`;
          console.error(errorMsg);
          aRecordAddonDataRef.current.error = errorMsg;
          aRecordAddonDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in getARecordAddon: ${err}`;
        console.error(errorMsg, err);
        aRecordAddonDataRef.current.error = errorMsg;
        aRecordAddonDataRef.current.isLoading = false;
        return null;
      }
    },

    /**
     * Insert/Fetch A record addon (always fetches fresh data)
     * @param ipId - REQUIRED IP ID (mandatory parameter)
     * @param domainId - Optional domain ID (defaults to varData domain ID)
     * @returns Promise with A record addon or null
     */
    insertARecordAddon: async (ipId: number, domainId?: number): Promise<ARecordAddonResult | null> => {
      try {
        const targetDomainId = domainId ?? getDomainId();
        
        if (targetDomainId === null) {
          const errorMsg = '⚠️ No domain ID provided and none found in varData or URL';
          console.error(errorMsg);
          aRecordAddonDataRef.current.error = errorMsg;
          return null;
        }

        // console.log(`🔄 Inserting/Fetching fresh A Record Addon for ipId: ${ipId}, domainId: ${targetDomainId}`);
        aRecordAddonDataRef.current.isLoading = true;
        aRecordAddonDataRef.current.error = null;
        
        const result = await fetchARecordAddon(ipId, targetDomainId);

        if (result) {
          // Convert UTC timestamps to user's local timezone
          const processedResult: ARecordAddonResult = {
            relatedDomain: result.relatedDomain.map(domain => ({
              ...domain,
              firstSeen: domain.firstSeen ? utcToLocalISO(domain.firstSeen) : domain.firstSeen,
              lastSeen: domain.lastSeen ? utcToLocalISO(domain.lastSeen) : domain.lastSeen,
            })),
            relatedNameserver: result.relatedNameserver.map(ns => ({
              ...ns,
              firstSeen: ns.firstSeen ? utcToLocalISO(ns.firstSeen) : ns.firstSeen,
              lastSeen: ns.lastSeen ? utcToLocalISO(ns.lastSeen) : ns.lastSeen,
            }))
          };
          
          const cacheKey = `${ipId}_${targetDomainId}`;
          aRecordAddonDataRef.current.cache.set(cacheKey, processedResult);
          aRecordAddonDataRef.current.isLoading = false;
          // console.log('✅ A Record Addon inserted/updated in cache');
          return processedResult;
        } else {
          const errorMsg = `❌ Failed to insert A Record Addon for ipId: ${ipId}, domainId: ${targetDomainId}`;
          console.error(errorMsg);
          aRecordAddonDataRef.current.error = errorMsg;
          aRecordAddonDataRef.current.isLoading = false;
          return null;
        }
      } catch (err) {
        const errorMsg = `❌ Error in insertARecordAddon: ${err}`;
        console.error(errorMsg, err);
        aRecordAddonDataRef.current.error = errorMsg;
        aRecordAddonDataRef.current.isLoading = false;
        return null;
      }
    },

    clearARecordAddon: () => {
      aRecordAddonDataRef.current.cache.clear();
      aRecordAddonDataRef.current.error = null;
      aRecordAddonDataRef.current.isLoading = false;
      // console.log('🗑️ A Record Addon cache cleared');
    },

    isLoading: () => aRecordAddonDataRef.current.isLoading,
    getError: () => aRecordAddonDataRef.current.error,
  }), [fetchARecordAddon, getDomainId]);

  return (
    <ARecordAddonDataContext.Provider value={contextValue}>
      {children}
    </ARecordAddonDataContext.Provider>
  );
}

/**
 * Custom hook to access A Record Addon Data Context
 * 
 * @example
 * const { getARecordAddon } = useARecordAddonData();
 * // ipId is MANDATORY, domainId is optional (uses varData if not provided)
 * const data = await getARecordAddon(10); // ipId=10, domainId from varData
 * const data = await getARecordAddon(10, 5); // ipId=10, domainId=5
 */
export function useARecordAddonData(): ARecordAddonDataContextType {
  const context = useContext(ARecordAddonDataContext);
  
  if (context === undefined) {
    throw new Error('useARecordAddonData must be used within an ARecordAddonDataProvider');
  }
  
  return context;
}
