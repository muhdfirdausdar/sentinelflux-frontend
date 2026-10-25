/**
 * General-Purpose In-Memory Store Module
 * 
 * A type-safe, flexible store system for managing application state.
 * 
 * @module stores
 */

// Core store functions
export {
  createStore,
  getStore,
  hasStore,
  destroyStore,
  getAllStoreIds,
  destroyAllStores,
  getDebugInfo
} from './createStore';

// React hooks
export {
  useStore,
  useStoreSelector,
  useStoreMetadata
} from './useStore';

// Types
export type {
  Store,
  StoreOptions,
  StoreMetadata,
  StoreEntry
} from './types';
