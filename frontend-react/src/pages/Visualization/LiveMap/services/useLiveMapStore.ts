/**
 * React Hook for LiveMap Store
 * 
 * Provides easy access to LiveMap data stored in the general-purpose store.
 * This hook allows components to subscribe to LiveMap data changes
 * without needing to manage SSE connections directly.
 * 
 * USAGE:
 * ```tsx
 * import { useLiveMapStore } from './services/useLiveMapStore';
 * 
 * function MyComponent() {
 *   const liveMapData = useLiveMapStore();
 *   
 *   return <div>{liveMapData ? 'Data loaded' : 'No data'}</div>;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { useStore, useStoreMetadata } from '@/stores';
import { LiveMapData } from '../data';

/**
 * Hook to access LiveMap store data
 * Automatically creates the store if it doesn't exist
 * 
 * @returns Tuple of [data, setData] - similar to useState
 */
export function useLiveMapStore() {
  const [data, setData] = useStore<LiveMapData | null>('liveMapData', null);
  
  return [data, setData] as const;
}

/**
 * Hook to access only the store data (read-only)
 * Use this when you don't need to update the store
 * 
 * @returns Current LiveMap data
 */
export function useLiveMapData(): LiveMapData | null {
  const [data] = useLiveMapStore();
  return data;
}

/**
 * Hook to detect when LiveMap store changes
 * Fires callback every time the store is updated
 * 
 * @example
 * ```tsx
 * useLiveMapDataChange((newData, oldData) => {
 *   console.log('Data changed!');
 *   console.log('Old:', oldData);
 *   console.log('New:', newData);
 * });
 * ```
 */
export function useLiveMapDataChange(
  callback: (newData: LiveMapData | null, oldData: LiveMapData | null) => void
) {
  const data = useLiveMapData();
  const prevDataRef = useRef<LiveMapData | null>(null);

  useEffect(() => {
    // Skip first render
    if (prevDataRef.current === null && data === null) {
      prevDataRef.current = data;
      return;
    }

    // Detect change
    if (data !== prevDataRef.current) {
      callback(data, prevDataRef.current);
      prevDataRef.current = data;
    }
  }, [data, callback]);
}

/**
 * Hook to get metadata about LiveMap store
 * Returns info like last update time, number of subscribers, etc.
 * 
 * @example
 * ```tsx
 * const metadata = useLiveMapMetadata();
 * console.log('Last updated:', metadata.lastUpdated);
 * console.log('Subscribers:', metadata.subscribers);
 * ```
 */
export function useLiveMapMetadata() {
  return useStoreMetadata('liveMapData');
}
