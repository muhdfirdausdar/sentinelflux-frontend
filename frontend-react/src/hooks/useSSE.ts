/**
 * useSSE - Server-Sent Events (SSE) Hook
 * 
 * A React hook for managing SSE connections with automatic reconnection,
 * JWT authentication, and shared connections across components.
 * 
 * WHAT IS SSE?
 * Server-Sent Events allow the server to push real-time updates to the client
 * over a single HTTP connection. Unlike WebSockets, SSE is unidirectional (server → client).
 * 
 * HOW TO USE:
 * 
 * Basic usage:
 * ```tsx
 * const { data, running, stop } = useSSE({
 *   endpoint: '/api/metrics',
 *   enabled: true,
 *   onMessage: (data) => console.log('New data:', data)
 * });
 * ```
 * 
 * With authentication:
 * ```tsx
 * const { data, running } = useSSE({
 *   endpoint: '/api/secure-stream',
 *   requireAuth: true  // Adds JWT Bearer token to request
 * });
 * ```
 * 
 * Using selector for derived data:
 * ```tsx
 * const count = useSSESelector('/api/metrics', (snapshot) => snapshot.data?.count ?? 0);
 * ```
 * 
 * KEY FEATURES:
 * - Shared connections: Multiple components using same endpoint share one SSE connection
 * - Automatic reconnection: Reconnects after 5s if connection drops
 * - JWT authentication: Automatically includes Bearer token if requireAuth=true
 * - Change detection: Only triggers re-renders when data actually changes
 * - Reference counting: Connection closes when last subscriber unmounts
 */

import { useEffect, useSyncExternalStore } from "react";
import tokenService from '../services/tokenService';
import { API_BASE_URL } from '../constants';
import logger from '../utils/logger';
import { SSEResponse } from '../types/restapi.d';

const log = logger.module('useSSE');

/**
 * Options for configuring the SSE connection
 * @template T - The type of data.data field in the SSE response
 */
type UseSSEOptions<T = Record<string, unknown>> = {
  enabled?: boolean;           // Default: true. Set to false to pause connection
  onMessage?: (data: SSEResponse<T>) => void; // Callback fired when stored data changes (after comparison)
  onRawMessage?: (data: SSEResponse<T>) => void; // Callback fired for EVERY message (before storage/comparison)
  endpoint: string;            // Required. API endpoint path (e.g., '/api/metrics')
  requireAuth?: boolean;       // Default: true. Whether to include JWT Bearer token
  storeData?: boolean;         // Default: true. Set to false to disable storing data in memory
};

/**
 * Return value from useSSE hook
 * @template T - The type of data.data field in the SSE response
 */
type UseSSEReturn<T = Record<string, unknown>> = {
  data: SSEResponse<T> | null;   // Latest data snapshot from SSE (null if no data yet)
  running: boolean;              // Whether SSE connection is currently active
  stop: () => void;              // Function to manually stop the SSE connection
};

/**
 * GLOBAL STORE ARCHITECTURE
 * 
 * Each SSE endpoint gets its own store containing:
 * - currentEnvelope: Raw parsed JSON from last SSE message
 * - listeners: Set of React components subscribed to this endpoint
 * - isRunning: Whether the SSE connection is active
 * - lastUpdated: ISO timestamp of last data update
 * - snapshotCache: Immutable snapshot for React's useSyncExternalStore
 * - storeData: Whether to store data in memory (can be disabled per endpoint)
 * 
 * WHY? This allows multiple components to share one SSE connection per endpoint.
 * Example: If 3 components all use useSSE({ endpoint: '/api/metrics' }),
 * only ONE network connection is made, and all 3 get the same data.
 */
const sseStores = new Map<string, {
  currentEnvelope: any;           // Last received data envelope
  listeners: Set<() => void>;     // Subscriber callbacks (React components)
  isRunning: boolean;             // Connection status
  lastUpdated: string | null;     // ISO timestamp
  snapshotCache: any;             // Immutable snapshot for React
  storeData: boolean;             // Whether to store data in memory
  rawMessageCallbacks: Set<(data: any) => void>; // Callbacks for raw messages (before storage)
}>();

/**
 * Get or create a store for a specific endpoint
 * Lazy initialization: Store is created on first access
 */
function getOrCreateStore(endpoint: string, storeData: boolean = true) {
  if (!sseStores.has(endpoint)) {
    sseStores.set(endpoint, {
      currentEnvelope: null,
      listeners: new Set<() => void>(),
      isRunning: false,
      lastUpdated: null,
      snapshotCache: { _meta: { lastUpdated: null, _sse_id: null } },
      storeData: storeData,
      rawMessageCallbacks: new Set()
    });
  }
  return sseStores.get(endpoint)!;
}

/**
 * Notify all React components subscribed to this endpoint that data changed
 * This triggers React re-renders via useSyncExternalStore
 */
function notifyListeners(endpoint: string) {
  const store = getOrCreateStore(endpoint);
  // Call each listener function (React's state update callbacks)
  store.listeners.forEach((l) => l());
}

/**
 * Create a message handler for SSE events
 * This function parses incoming SSE data and updates the store
 * 
 * MESSAGE FORMAT EXPECTED:
 * {
 *   remark?: string,  // Optional server message ("no change" = skip update)
 *   data: any         // Required. Your actual data payload
 * }
 * 
 * CHANGE DETECTION:
 * - Only triggers re-render if JSON.stringify output differs
 * - Prevents unnecessary React updates when data hasn't changed
 */
function createHandleSSEMessage(endpoint: string) {
  return (event: { data: string }) => {
    const store = getOrCreateStore(endpoint);
    
    try {
      // Parse the SSE data (format: "data: {...JSON...}")
      const parsed = JSON.parse(event.data);
      
      // SERVER OPTIMIZATION: If server sends "remark: no change", skip processing
      // This allows server to keep connection alive without triggering updates
      const remark = typeof parsed?.remark === 'string' ? parsed.remark.trim().toLowerCase() : '';
      if (remark === 'no change' || remark === 'No new data') {
        log.debug(`No change for endpoint: ${endpoint}`);
        return; // Exit early, don't update store
      } else {
        log.info(`${endpoint}: ${remark}`);
      }
      
      // VALIDATION: Only process messages with valid data field
      // Ensures we don't pass null/undefined to components
      // Data must be at least an object (can be empty {})
      const isValid = parsed && 
                      typeof parsed === 'object' && 
                      parsed.data !== null && 
                      parsed.data !== undefined &&
                      typeof parsed.data === 'object';
      if (!isValid) {
        log.warn(`Invalid SSE message format for ${endpoint}. Expected data to be an object.`, parsed);
        return; // Invalid message, skip
      }

      // console.log('Received SSE message for', endpoint, ':', parsed);

      // CALL RAW MESSAGE CALLBACKS FIRST (before storage/comparison)
      // This fires for EVERY message, regardless of storeData setting
      // Useful for incremental/streaming data that should be accumulated externally
      if (store.rawMessageCallbacks.size > 0) {
        store.rawMessageCallbacks.forEach(callback => {
          try {
            callback(parsed);
          } catch (err) {
            log.error(`Error in raw message callback for ${endpoint}:`, err);
          }
        });
      }

      // CHANGE DETECTION & STORAGE:
      // If storeData is enabled, check if data changed before storing
      // If storeData is disabled, always trigger listeners (no comparison needed)
      if (store.storeData) {
        // Compare JSON strings to detect actual changes
        // Only update store if data is different (avoids noisy re-renders)
        const changed = JSON.stringify(parsed) !== JSON.stringify(store.currentEnvelope);
        if (changed) {
          // Update store with new data
          store.currentEnvelope = parsed;
          store.lastUpdated = new Date().toISOString();
          
          // Extract SSE event ID if provided (for resuming connections)
          const sseId = (event as any).lastEventId || store.snapshotCache?._meta?._sse_id || null;
          
          // Create NEW snapshot object (immutability for React)
          // React's useSyncExternalStore requires reference equality check
          store.snapshotCache = Object.assign({}, { _meta: { lastUpdated: store.lastUpdated, _sse_id: sseId } }, parsed);
          
          // Trigger React re-renders for all subscribed components
          notifyListeners(endpoint);
        }
      } else {
        // storeData is false: Don't store, but always notify listeners
        // This allows onMessage callbacks to fire for every message
        notifyListeners(endpoint);
      }

    } catch (e) {
      log.error(`SSE message parse error for ${endpoint}:`, e);
    }
  };
}

/**
 * Start an SSE connection to the specified endpoint
 * 
 * WHY fetch() INSTEAD OF EventSource?
 * - EventSource API doesn't support custom headers (can't add Authorization)
 * - fetch() allows us to add JWT Bearer token for authenticated endpoints
 * - Requires manual parsing of SSE format, but gives us full control
 * 
 * FLOW:
 * 1. Get JWT token if requireAuth=true
 * 2. Make fetch request with Authorization header
 * 3. Read response body stream chunk by chunk
 * 4. Parse SSE format (lines starting with "data: ")
 * 5. Call handleMessage for each data event
 * 6. Auto-reconnect on error after 5 seconds
 * 
 * @param endpoint - API endpoint path (e.g., '/api/metrics')
 * @param requireAuth - Whether to include JWT Bearer token
 * @param storeData - Whether to store data in memory (default: true)
 */
async function startSSEConnection(endpoint: string, requireAuth: boolean = true, storeData: boolean = true) {
  const store = getOrCreateStore(endpoint, storeData);
  
  // Update storeData setting if it changed
  store.storeData = storeData;
  
  // Prevent duplicate connections to same endpoint
  if (store.isRunning) {
    console.log(`[useSSE] Connection already running for ${endpoint}, skipping...`);
    return;
  }
  
  try {
    let token = null;
    
    if (requireAuth) {
      // GET JWT TOKEN: Ensure we have a valid token before connecting
      // tokenService handles token refresh if expired
      token = await tokenService.ensureValidToken();
      if (!token) {
        log.error(`[${endpoint}] Failed to establish SSE connection: No valid token available`);
        return;
      }
    }
    
    try {
      store.isRunning = true;
      
      // BUILD REQUEST: Construct fetch URL and headers
      const url = `${API_BASE_URL}${endpoint}`;
      const headers: Record<string, string> = {
        'Accept': 'text/event-stream',      // Tell server we expect SSE format
        'Cache-Control': 'no-cache'         // Prevent caching of stream
      };
      
      // ADD JWT TOKEN: Include Bearer token if authentication required
      if (requireAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // INITIATE CONNECTION: Start fetch request
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // GET STREAM READER: Access response body as readable stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }
      
      // SETUP PARSING: Prepare to decode binary chunks as text
      const decoder = new TextDecoder();
      const handleMessage = createHandleSSEMessage(endpoint);
      
      // BUFFER: Accumulate incomplete SSE messages across chunks
      // SSE messages can be split across multiple network packets
      let buffer = '';
      
      // READ LOOP: Continuously read chunks from stream
      while (store.isRunning) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream ended normally
          break;
        }
        
        // DECODE CHUNK: Convert Uint8Array to string
        const chunk = decoder.decode(value, { stream: true });
        
        // ACCUMULATE: Add new chunk to buffer
        buffer += chunk;
        
        // SPLIT BY DOUBLE NEWLINE: SSE messages end with "\n\n"
        // This ensures we only process complete messages
        const messages = buffer.split('\n\n');
        
        // KEEP INCOMPLETE: Last element might be incomplete, keep it in buffer
        buffer = messages.pop() || '';
        
        // PROCESS COMPLETE MESSAGES: Parse each complete SSE message
        for (const message of messages) {
          const lines = message.split('\n');
          let dataLines: string[] = [];
          
          // COLLECT DATA LINES: SSE can have multi-line data
          // Format: "data: line1\ndata: line2\n\n"
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              dataLines.push(line.slice(6)); // Remove 'data: ' prefix
            }
          }
          
          // JOIN AND PARSE: Combine multi-line data and process
          if (dataLines.length > 0) {
            const data = dataLines.join(''); // Concatenate all data lines
            if (data.trim()) {
              // PROCESS MESSAGE: Pass complete JSON to handler
              handleMessage({ data });
            }
          }
        }
      }
      
    } catch (fetchError) {
      log.error(`[${endpoint}] Failed to establish SSE connection:`, fetchError);
      store.isRunning = false;
      
      // AUTO-RECONNECT: Attempt to reconnect after 5 seconds
      // This handles network drops, server restarts, etc.
      setTimeout(() => {
        startSSEConnection(endpoint, requireAuth, storeData);
      }, 5000);
    }
    
  } catch (tokenError) {
    // TOKEN ERROR: Failed to get valid JWT token
    log.error(`[${endpoint}] Failed to establish SSE connection:`, tokenError);
    store.isRunning = false;
  }
}

/**
 * Stop the SSE connection for an endpoint
 * Sets isRunning=false which breaks the read loop in startSSEConnection
 */
function stopSSEConnection(endpoint: string) {
  const store = getOrCreateStore(endpoint);
  store.isRunning = false;
  notifyListeners(endpoint); // Notify components that connection stopped
}

/**
 * Subscribe function for React's useSyncExternalStore
 * 
 * REFERENCE COUNTING PATTERN:
 * - When first component subscribes: Start SSE connection
 * - When last component unsubscribes: Stop SSE connection
 * - In between: Share the same connection
 * 
 * EXAMPLE:
 * Component A mounts → listeners.size = 1 → Start SSE
 * Component B mounts → listeners.size = 2 → Reuse existing SSE
 * Component A unmounts → listeners.size = 1 → Keep SSE running
 * Component B unmounts → listeners.size = 0 → Stop SSE
 * 
 * @param endpoint - API endpoint path
 * @param requireAuth - Whether to use JWT authentication
 * @param storeData - Whether to store data in memory
 * @returns Unsubscribe function (called by React on component unmount)
 */
function subscribe(endpoint: string, requireAuth: boolean = true, storeData: boolean = true) {
  return (listener: () => void) => {
    const store = getOrCreateStore(endpoint, storeData);
    
    // ADD SUBSCRIBER: Register this component's listener
    store.listeners.add(listener);
    
    // START CONNECTION: Only if this is the first subscriber
    if (store.listeners.size === 1) {
      startSSEConnection(endpoint, requireAuth, storeData);
    }
    
    // RETURN CLEANUP FUNCTION: React calls this on component unmount
    return () => {
      // REMOVE SUBSCRIBER: Unregister this component's listener
      store.listeners.delete(listener);
      
      // STOP CONNECTION: Only if this was the last subscriber
      if (store.listeners.size === 0) {
        stopSSEConnection(endpoint);
      }
    };
  };
}

/**
 * Get current data snapshot for an endpoint
 * Used by React's useSyncExternalStore to read current state
 * 
 * @param endpoint - API endpoint path
 * @returns Immutable snapshot of current data
 */
function getSnapshot(endpoint: string) {
  const store = getOrCreateStore(endpoint);
  return store.snapshotCache;
}

/**
 * UTILITY: Get store for an endpoint (for advanced usage)
 * Allows direct access to store internals for debugging or custom logic
 * 
 * @param endpoint - API endpoint path
 * @returns Store object with currentEnvelope, listeners, isRunning, etc.
 */
export function getSSEStore(endpoint: string) {
  return getOrCreateStore(endpoint);
}

/**
 * UTILITY: Check if SSE connection is running for an endpoint
 * Useful for showing connection status indicators in UI
 * 
 * @param endpoint - API endpoint path
 * @returns true if connection is active, false otherwise
 */
export function isSSERunning(endpoint: string): boolean {
  const store = sseStores.get(endpoint);
  return store?.isRunning ?? false;
}

/**
 * ADVANCED HOOK: Subscribe to SSE data with a custom selector
 * 
 * USE CASE: When you only need part of the data
 * Instead of getting the whole snapshot and picking a field,
 * use a selector to extract exactly what you need.
 * 
 * EXAMPLE:
 * ```tsx
 * // Instead of this (re-renders on any data change):
 * const { data } = useSSE({ endpoint: '/api/metrics' });
 * const count = data?.data?.count ?? 0;
 * 
 * // Do this (only re-renders when count changes):
 * const count = useSSESelector('/api/metrics', (s) => s.data?.count ?? 0);
 * ```
 * 
 * HOW IT WORKS:
 * - useSyncExternalStore is React 18's primitive for external state
 * - subscribe() tells React when to check for updates
 * - selector() extracts specific data from snapshot
 * - React only re-renders if selector output changes
 * 
 * @param endpoint - API endpoint path
 * @param selector - Function to extract specific data from snapshot
 * @param requireAuth - Whether to use JWT authentication
 * @param storeData - Whether to store data in memory (default: true)
 * @returns The selected data (result of selector function)
 */
export function useSSESelector<T>(
  endpoint: string, 
  selector: (s: any) => T, 
  requireAuth: boolean = true,
  storeData: boolean = true
): T {
  return useSyncExternalStore(
    subscribe(endpoint, requireAuth, storeData),           // How to subscribe/unsubscribe
    () => selector(getSnapshot(endpoint)),                 // How to get current value (client)
    () => selector(getSnapshot(endpoint))                  // How to get current value (server - SSR)
  );
}

/**
 * MAIN HOOK: useSSE
 * 
 * Primary interface for using SSE in React components
 * Manages connection lifecycle and provides data/status
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage:
 * ```tsx
 * const { data, running } = useSSE({ endpoint: '/api/metrics' });
 * ```
 * 
 * 2. With callback:
 * ```tsx
 * const { data } = useSSE({
 *   endpoint: '/api/metrics',
 *   onMessage: (data) => {
 *     console.log('New metrics:', data);
 *   }
 * });
 * ```
 * 
 * 3. Conditional connection:
 * ```tsx
 * const [shouldConnect, setShouldConnect] = useState(false);
 * const { data, running } = useSSE({
 *   endpoint: '/api/metrics',
 *   enabled: shouldConnect  // Only connects when true
 * });
 * ```
 * 
 * 4. Public endpoint (no auth):
 * ```tsx
 * const { data } = useSSE({
 *   endpoint: '/api/public-metrics',
 *   requireAuth: false  // Don't send JWT token
 * });
 * ```
 * 
 * 5. Callback-only mode (no data storage):
 * ```tsx
 * useSSE({
 *   endpoint: '/api/events',
 *   storeData: false,  // Don't store data in memory
 *   onMessage: (data) => {
 *     // Process data immediately, don't keep in memory
 *     processEvent(data);
 *   }
 * });
 * // Note: `data` will be null since storeData is false
 * ```
 * 
 * DATA FORMAT:
 * The returned `data` object has this structure:
 * ```
 * {
 *   _meta: {
 *     lastUpdated: "2024-10-17T10:30:00.000Z",
 *     _sse_id: "12345"
 *   },
 *   remark: "Updated successfully",
 *   data: { ...your actual data... }
 * }
 * ```
 * 
 * @template T - The type of data.data field in the SSE response
 * @param opts - Configuration options
 * @returns Object with { data, running, stop }
 */
export function useSSE<T = Record<string, unknown>>(opts: UseSSEOptions<T>): UseSSEReturn<T> {
  const { enabled = true, onMessage, onRawMessage, endpoint, requireAuth = true, storeData = true } = opts;

  // EFFECT 1: Register raw message callback (fires for EVERY message, before storage)
  useEffect(() => {
    if (!onRawMessage) return;
    
    const store = getOrCreateStore(endpoint, storeData);
    store.rawMessageCallbacks.add(onRawMessage);
    
    return () => {
      store.rawMessageCallbacks.delete(onRawMessage);
    };
  }, [endpoint, onRawMessage, storeData]);

  // EFFECT 2: Start SSE connection when component mounts (if enabled)
  // Note: Actual connection start is reference-counted in subscribe()
  // This effect ensures connection starts even if we're the first subscriber
  useEffect(() => {
    if (!enabled) return;
    console.log(`[useSSE] Starting SSE connection for ${endpoint}`);
    startSSEConnection(endpoint, requireAuth, storeData);
    return () => {
      // Cleanup: Don't stop SSE here; reference counting handles it
      // This allows other components to keep using the same connection
    };
  }, [enabled, endpoint, requireAuth, storeData]);

  // SUBSCRIBE TO DATA: Get latest snapshot whenever it changes
  // Uses useSSESelector under the hood for efficient updates
  const data = useSSESelector(endpoint, (s) => s ?? null, requireAuth, storeData);
  
  // EFFECT 3: Call onMessage callback whenever STORED data changes
  // Only fires when data in store actually changes (after comparison)
  useEffect(() => {
    if (onMessage && data) onMessage(data);
  }, [data, onMessage]);

  // SUBSCRIBE TO STATUS: Get connection running state
  const running = useSSESelector(endpoint, () => {
    const store = getOrCreateStore(endpoint, storeData);
    return store.isRunning;
  }, requireAuth, storeData);
  
  // STOP FUNCTION: Manually stop SSE connection
  // Useful for pause/resume functionality
  const stop = () => stopSSEConnection(endpoint);

  return { data, running, stop };
}

export default useSSE;
