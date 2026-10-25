import { createContext, useContext, useRef, useMemo, ReactNode } from 'react';

/**
 * Domain Data stored in ref (no re-renders)
 */
interface DomainDataRef {
  domainId: number | null;
}

/**
 * Callback function type for domain ID change listeners
 */
type DomainIdChangeListener = (newDomainId: number | null) => void;

/**
 * Domain Data Context Interface
 */
interface DomainDataContextType {
  getDomainId: () => number | null;
  setDomainId: (id: number | null) => void;
  clearDomainId: () => void;
  subscribeToChanges: (listener: DomainIdChangeListener) => () => void;
}

/**
 * Create Domain Data Context
 */
const DomainDataContext = createContext<DomainDataContextType | undefined>(undefined);

/**
 * Domain Data Provider Props
 */
interface DomainDataProviderProps {
  children: ReactNode;
}

/**
 * Helper function to fetch domain ID from URL query parameters
 * @returns Domain ID from URL or null if not found
 */
function getDomainIdFromUrl(): number | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const domIdParam = urlParams.get('dom_id');
    
    if (domIdParam) {
      const domainId = parseInt(domIdParam, 10);
      if (!isNaN(domainId)) {
        // console.log('📌 Domain ID fetched from URL:', domainId);
        return domainId;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading domain ID from URL:', error);
    return null;
  }
}

/**
 * Domain Data Provider Component
 * Manages domain ID using useRef for page-level memory without re-renders
 * Data persists across component changes and doesn't trigger re-renders
 * Automatically fetches from URL if not already set
 * 
 * @example
 * // Wrap your page or component tree
 * <DomainDataProvider>
 *   <YourComponents />
 * </DomainDataProvider>
 */
export function DomainDataProvider({ children }: DomainDataProviderProps) {
  // Use ref to store data without triggering re-renders
  const domainDataRef = useRef<DomainDataRef>({
    domainId: null,
  });

  // Store listeners for domain ID changes
  const listenersRef = useRef<Set<DomainIdChangeListener>>(new Set());

  // Notify all listeners when domain ID changes
  const notifyListeners = (newDomainId: number | null) => {
    listenersRef.current.forEach(listener => {
      try {
        listener(newDomainId);
      } catch (error) {
        console.error('Error in domain ID change listener:', error);
      }
    });
  };

  // Memoize the context value (functions don't change, so no re-renders)
  const contextValue = useMemo<DomainDataContextType>(() => ({
    getDomainId: () => {
      // If domain ID is not set, try to fetch from URL
      if (domainDataRef.current.domainId === null) {
        const urlDomainId = getDomainIdFromUrl();
        if (urlDomainId !== null) {
          // Auto-populate from URL
          domainDataRef.current.domainId = urlDomainId;
          // console.log('✅ Domain ID auto-populated from URL:', urlDomainId);
          return urlDomainId;
        }
        console.warn('⚠️ No domain ID found in memory or URL');
        return null;
      }
      return domainDataRef.current.domainId;
    },
    setDomainId: (id: number | null) => {
      const oldId = domainDataRef.current.domainId;
      
      // Only update and notify if the value actually changed
      if (oldId !== id) {
        domainDataRef.current.domainId = id;
        // console.log('Domain ID updated (no re-render):', id);
        
        // Notify all subscribers (data modules) to clear their caches
        notifyListeners(id);
        // console.log('🔔 Notified all data modules to clear caches');
      }
    },
    clearDomainId: () => {
      const oldId = domainDataRef.current.domainId;
      
      if (oldId !== null) {
        domainDataRef.current.domainId = null;
        // console.log('Domain ID cleared (no re-render)');
        
        // Notify all subscribers
        notifyListeners(null);
        // console.log('🔔 Notified all data modules to clear caches');
      }
    },
    subscribeToChanges: (listener: DomainIdChangeListener) => {
      listenersRef.current.add(listener);
      // console.log('➕ Data module subscribed to domain ID changes');
      
      // Return unsubscribe function
      return () => {
        listenersRef.current.delete(listener);
        // console.log('➖ Data module unsubscribed from domain ID changes');
      };
    },
  }), []); // Empty deps - functions never change

  return (
    <DomainDataContext.Provider value={contextValue}>
      {children}
    </DomainDataContext.Provider>
  );
}

/**
 * Custom hook to access Domain Data Context
 * Uses useRef internally - NO RE-RENDERS when data changes
 * Automatically fetches from URL ?dom_id= if not in memory
 * 
 * When domain ID changes, all subscribed data modules are notified to clear their caches
 * 
 * @example
 * const { getDomainId, setDomainId, clearDomainId, subscribeToChanges } = useDomainData();
 * 
 * // Get domain ID (auto-fetches from URL if not set)
 * const id = getDomainId(); // 5 (from memory or URL)
 * 
 * // Set domain ID manually (notifies all data modules to clear)
 * setDomainId(5);
 * 
 * // Clear domain ID (notifies all data modules to clear)
 * clearDomainId();
 * 
 * // Subscribe to changes (for data modules)
 * const unsubscribe = subscribeToChanges((newId) => {
 *   // Clear cache when domain ID changes
 * });
 */
export function useDomainData(): DomainDataContextType {
  const context = useContext(DomainDataContext);
  
  if (context === undefined) {
    throw new Error('useDomainData must be used within a DomainDataProvider');
  }
  
  return context;
}

/**
 * Hook to get domain ID getter function
 * Call the function to get the current value
 * Automatically fetches from URL if not in memory
 * 
 * @example
 * const getDomainId = useGetDomainId();
 * const id = getDomainId(); // 5 (from memory or URL ?dom_id=5)
 */
export function useGetDomainId(): () => number | null {
  const { getDomainId } = useDomainData();
  return getDomainId;
}

/**
 * Hook to get domain ID setter function
 * Updates value without triggering re-renders
 * 
 * @example
 * const setDomainId = useSetDomainId();
 * setDomainId(5); // No re-render
 */
export function useSetDomainId(): (id: number | null) => void {
  const { setDomainId } = useDomainData();
  return setDomainId;
}
