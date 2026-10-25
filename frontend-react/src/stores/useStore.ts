/**
 * React Hook for Store Module
 * 
 * Provides React integration for the general-purpose store system.
 * Uses React's useSyncExternalStore for optimal performance.
 * 
 * USAGE:
 * ```tsx
 * import { useStore } from '@/stores/useStore';
 * 
 * function MyComponent() {
 *   const [user, setUser] = useStore('user');
 *   
 *   return (
 *     <div>
 *       <p>{user.name}</p>
 *       <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
 *         Increment Age
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getStore, createStore } from './createStore';
import { StoreOptions } from './types';

/**
 * React hook to use a store
 * Creates the store if it doesn't exist
 * 
 * @template T - The type of data stored
 * @param id - Store identifier
 * @param initialValue - Initial value (used if store doesn't exist)
 * @param options - Store configuration options
 * @returns Tuple of [value, setValue] similar to useState
 * 
 * @example
 * ```tsx
 * interface User { name: string; age: number; }
 * 
 * function UserProfile() {
 *   const [user, setUser] = useStore<User>('user', { name: '', age: 0 });
 *   
 *   return (
 *     <div>
 *       <p>Name: {user.name}</p>
 *       <p>Age: {user.age}</p>
 *       <button onClick={() => setUser(prev => ({ ...prev, age: prev.age + 1 }))}>
 *         Increment Age
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStore<T>(
  id: string,
  initialValue: T,
  options?: StoreOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get or create store
  let store = getStore<T>(id);
  if (!store) {
    store = createStore(id, initialValue, options);
  }

  // Subscribe to store changes using React 18's useSyncExternalStore
  const value = useSyncExternalStore(
    store.subscribe,  // Subscribe function
    store.get,        // Get current value (client)
    store.get         // Get current value (server - SSR)
  );

  // Memoize setter to prevent unnecessary re-renders
  const setValue = useCallback(store.set, [store]);

  return [value, setValue];
}

/**
 * Hook to use store with selector for performance optimization
 * Only re-renders when selected value changes
 * 
 * @template T - The type of data stored
 * @template S - The type of selected data
 * @param id - Store identifier
 * @param selector - Function to select part of the store value
 * @returns Selected value
 * 
 * @example
 * ```tsx
 * // Store has: { user: { name: 'Alice', age: 30 }, theme: 'dark' }
 * 
 * function UserName() {
 *   // Only re-renders when user.name changes
 *   const name = useStoreSelector('app', state => state.user.name);
 *   return <p>{name}</p>;
 * }
 * 
 * function Theme() {
 *   // Only re-renders when theme changes
 *   const theme = useStoreSelector('app', state => state.theme);
 *   return <p>{theme}</p>;
 * }
 * ```
 */
export function useStoreSelector<T, S>(
  id: string,
  selector: (value: T) => S
): S {
  const store = getStore<T>(id);
  
  if (!store) {
    throw new Error(`Store "${id}" does not exist. Create it first or use useStore() instead.`);
  }

  // Subscribe with selector for optimal re-renders
  const selectedValue = useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),  // Client
    () => selector(store.get())   // Server
  );

  return selectedValue;
}

/**
 * Hook to get store metadata
 * Useful for debugging or showing store information
 * 
 * @param id - Store identifier
 * @returns Store metadata or null if store doesn't exist
 * 
 * @example
 * ```tsx
 * function StoreDebug() {
 *   const metadata = useStoreMetadata('user');
 *   
 *   return (
 *     <div>
 *       <p>Updates: {metadata?.updateCount}</p>
 *       <p>Subscribers: {metadata?.subscriberCount}</p>
 *       <p>Last Updated: {metadata?.lastUpdated}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStoreMetadata(id: string) {
  const store = getStore(id);
  
  if (!store) {
    return null;
  }

  // Subscribe to trigger re-render on any store change
  useSyncExternalStore(
    store.subscribe,
    store.get,
    store.get
  );

  return store.getMetadata();
}
