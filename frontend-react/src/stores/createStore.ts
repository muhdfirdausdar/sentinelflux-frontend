/**
 * General-Purpose In-Memory Store Module
 * 
 * A flexible, type-safe store system for managing application state.
 * 
 * FEATURES:
 * - Type-safe with TypeScript generics
 * - Multiple independent stores with unique IDs
 * - Subscribe/unsubscribe pattern
 * - Validation support
 * - Change callbacks
 * - Metadata tracking
 * - No dependencies on React or SSE
 * 
 * USAGE:
 * ```ts
 * // Create a store
 * const userStore = createStore('user', { name: '', age: 0 });
 * 
 * // Get value
 * const user = userStore.get();
 * 
 * // Set value
 * userStore.set({ name: 'Alice', age: 30 });
 * 
 * // Subscribe to changes
 * const unsubscribe = userStore.subscribe((user) => {
 *   console.log('User changed:', user);
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */

import { Store, StoreOptions, StoreEntry } from './types';

/**
 * Global registry of all stores
 * Key: Store ID
 * Value: Store entry with data and metadata
 */
const storeRegistry = new Map<string, StoreEntry<any>>();

/**
 * Create a new store or retrieve existing one
 * 
 * @template T - The type of data to store
 * @param id - Unique identifier for the store
 * @param initialValue - Initial value for the store
 * @param options - Configuration options
 * @returns Store instance with get/set/subscribe methods
 * 
 * @example
 * ```ts
 * interface User { name: string; age: number; }
 * 
 * const userStore = createStore<User>('user', { name: '', age: 0 }, {
 *   validator: (user) => user.age >= 0,
 *   onChange: (newUser, oldUser) => console.log('Changed!', newUser)
 * });
 * ```
 */
export function createStore<T>(
  id: string,
  initialValue: T,
  options: StoreOptions<T> = {}
): Store<T> {
  // Check if store already exists
  if (storeRegistry.has(id)) {
    console.warn(`Store "${id}" already exists. Returning existing store.`);
    return getStoreInstance<T>(id);
  }

  // Create new store entry
  const entry: StoreEntry<T> = {
    value: initialValue,
    initialValue: initialValue,
    listeners: new Set(),
    metadata: {
      id,
      createdAt: new Date().toISOString(),
      lastUpdated: null,
      updateCount: 0,
      subscriberCount: 0
    },
    options
  };

  storeRegistry.set(id, entry);

  return getStoreInstance<T>(id);
}

/**
 * Get a store instance by ID
 * 
 * @template T - The type of data stored
 * @param id - Store identifier
 * @returns Store instance
 * @throws Error if store doesn't exist
 */
function getStoreInstance<T>(id: string): Store<T> {
  const entry = storeRegistry.get(id) as StoreEntry<T> | undefined;
  
  if (!entry) {
    throw new Error(`Store "${id}" does not exist. Create it first with createStore()`);
  }

  return {
    /**
     * Get current value from store
     */
    get: () => {
      return entry.value;
    },

    /**
     * Set new value in store
     * Supports updater function for functional updates
     * 
     * @param value - New value or updater function
     * 
     * @example
     * ```ts
     * // Direct value
     * store.set({ name: 'Alice' });
     * 
     * // Updater function
     * store.set(prev => ({ ...prev, age: prev.age + 1 }));
     * ```
     */
    set: (value: T | ((prev: T) => T)) => {
      const prevValue = entry.value;
      const newValue = typeof value === 'function' 
        ? (value as (prev: T) => T)(prevValue)
        : value;

      // Validate if validator provided
      if (entry.options.validator && !entry.options.validator(newValue)) {
        console.error(`Store "${id}": Validation failed for value:`, newValue);
        return;
      }

      // Check if value actually changed
      const changed = JSON.stringify(newValue) !== JSON.stringify(prevValue);
      if (!changed) {
        return; // Skip update if nothing changed
      }

      // Update value
      entry.value = newValue;
      entry.metadata.lastUpdated = new Date().toISOString();
      entry.metadata.updateCount++;

      // Call onChange callback
      if (entry.options.onChange) {
        entry.options.onChange(newValue, prevValue);
      }

      // Notify all subscribers
      entry.listeners.forEach(listener => {
        try {
          listener(newValue);
        } catch (error) {
          console.error(`Store "${id}": Error in listener:`, error);
        }
      });
    },

    /**
     * Subscribe to store changes
     * 
     * @param listener - Callback function called when value changes
     * @returns Unsubscribe function
     * 
     * @example
     * ```ts
     * const unsubscribe = store.subscribe((value) => {
     *   console.log('Value changed:', value);
     * });
     * 
     * // Later...
     * unsubscribe();
     * ```
     */
    subscribe: (listener: (value: T) => void) => {
      entry.listeners.add(listener);
      entry.metadata.subscriberCount = entry.listeners.size;

      // Return unsubscribe function
      return () => {
        entry.listeners.delete(listener);
        entry.metadata.subscriberCount = entry.listeners.size;
      };
    },

    /**
     * Reset store to initial value
     */
    reset: () => {
      const prevValue = entry.value;
      entry.value = entry.initialValue;
      entry.metadata.lastUpdated = new Date().toISOString();
      entry.metadata.updateCount++;

      // Notify subscribers
      entry.listeners.forEach(listener => {
        try {
          listener(entry.value);
        } catch (error) {
          console.error(`Store "${id}": Error in listener:`, error);
        }
      });

      if (entry.options.onChange) {
        entry.options.onChange(entry.value, prevValue);
      }
    },

    /**
     * Destroy the store and clean up all resources
     */
    destroy: () => {
      entry.listeners.clear();
      storeRegistry.delete(id);
    },

    /**
     * Get store metadata
     */
    getMetadata: () => {
      return { ...entry.metadata };
    }
  };
}

/**
 * Get an existing store by ID
 * 
 * @template T - The type of data stored
 * @param id - Store identifier
 * @returns Store instance or null if doesn't exist
 */
export function getStore<T>(id: string): Store<T> | null {
  if (!storeRegistry.has(id)) {
    return null;
  }
  return getStoreInstance<T>(id);
}

/**
 * Check if a store exists
 * 
 * @param id - Store identifier
 * @returns true if store exists
 */
export function hasStore(id: string): boolean {
  return storeRegistry.has(id);
}

/**
 * Destroy a store by ID
 * 
 * @param id - Store identifier
 */
export function destroyStore(id: string): void {
  const store = getStore(id);
  if (store) {
    store.destroy();
  }
}

/**
 * Get list of all store IDs
 * 
 * @returns Array of store IDs
 */
export function getAllStoreIds(): string[] {
  return Array.from(storeRegistry.keys());
}

/**
 * Destroy all stores
 * Useful for testing or cleanup
 */
export function destroyAllStores(): void {
  storeRegistry.forEach((_, id) => {
    destroyStore(id);
  });
}

/**
 * Get debug information about all stores
 * Useful for development and debugging
 */
export function getDebugInfo(): Record<string, any> {
  const info: Record<string, any> = {};
  
  storeRegistry.forEach((entry, id) => {
    info[id] = {
      metadata: entry.metadata,
      hasValidation: !!entry.options.validator,
      hasOnChange: !!entry.options.onChange,
      currentValue: entry.value
    };
  });
  
  return info;
}
