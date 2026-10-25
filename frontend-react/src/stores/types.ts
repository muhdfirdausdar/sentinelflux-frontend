/**
 * Store Module Types
 * 
 * Type definitions for the general-purpose in-memory store system
 */

/**
 * Store configuration options
 * @template T - The type of data stored in the store
 */
export interface StoreOptions<T> {
  initialValue?: T;                        // Initial value for the store
  persist?: boolean;                       // Whether to persist to localStorage (future feature)
  validator?: (value: T) => boolean;       // Optional validation function
  onChange?: (value: T, prevValue: T) => void; // Callback when value changes
}

/**
 * Store instance interface
 * @template T - The type of data stored
 */
export interface Store<T> {
  get: () => T;                            // Get current value
  set: (value: T | ((prev: T) => T)) => void; // Set new value (supports updater function)
  subscribe: (listener: (value: T) => void) => () => void; // Subscribe to changes
  reset: () => void;                       // Reset to initial value
  destroy: () => void;                     // Clean up store
  getMetadata: () => StoreMetadata;        // Get store metadata
}

/**
 * Store metadata
 */
export interface StoreMetadata {
  id: string;                              // Store identifier
  createdAt: string;                       // ISO timestamp
  lastUpdated: string | null;              // ISO timestamp of last update
  updateCount: number;                     // Number of times store was updated
  subscriberCount: number;                 // Number of active subscribers
}

/**
 * Store registry entry (internal use)
 * @template T - The type of data stored
 */
export interface StoreEntry<T> {
  value: T;                                // Current value
  initialValue: T;                         // Initial value for reset
  listeners: Set<(value: T) => void>;      // Subscriber callbacks
  metadata: StoreMetadata;                 // Store metadata
  options: StoreOptions<T>;                // Configuration options
}
