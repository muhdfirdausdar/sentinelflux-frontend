/**
 * Example Usage of General-Purpose Store Module
 * 
 * This file demonstrates various ways to use the store system.
 * Delete this file after you understand how to use the stores.
 */

import { createStore } from '@/stores';

// ============================================================================
// EXAMPLE 1: Simple Counter Store
// ============================================================================

export function createCounterStore() {
  return createStore('counter', 0);
}

// Usage in React component:
/*
import { useStore } from '@/stores';

function CounterComponent() {
  const [count, setCount] = useStore('counter', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 2: User Store with Validation
// ============================================================================

interface User {
  name: string;
  email: string;
  age: number;
}

export function createUserStore() {
  return createStore<User>(
    'user',
    { name: '', email: '', age: 0 },
    {
      // Validation: Age must be >= 0
      validator: (user) => user.age >= 0,
      
      // Log changes
      onChange: (newUser, oldUser) => {
        console.log('User changed from:', oldUser, 'to:', newUser);
      }
    }
  );
}

// Usage in React component:
/*
import { useStore } from '@/stores';

function UserProfile() {
  const [user, setUser] = useStore<User>('user', { name: '', email: '', age: 0 });
  
  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <p>Email: {user.email}</p>
      <p>Age: {user.age}</p>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 3: Live Map Locations Store
// ============================================================================

interface Location {
  country: string;
  coords: [number, number];
  color: string;
  circle_radius: number;
  glow_intensity: string;
}

interface LiveMapState {
  locations: Location[];
  lastUpdated: string | null;
  isLoading: boolean;
}

export function createLiveMapStore() {
  return createStore<LiveMapState>(
    'liveMap',
    {
      locations: [],
      lastUpdated: null,
      isLoading: false
    },
    {
      onChange: (newState, oldState) => {
        console.log(`Locations updated: ${oldState.locations.length} → ${newState.locations.length}`);
      }
    }
  );
}

// Usage in React component:
/*
import { useStore, useStoreSelector } from '@/stores';

// Component 1: Full state access
function LiveMapComponent() {
  const [state, setState] = useStore<LiveMapState>('liveMap', {
    locations: [],
    lastUpdated: null,
    isLoading: false
  });
  
  // Update from SSE
  useEffect(() => {
    const handleSSEMessage = (data) => {
      setState(prev => ({
        ...prev,
        locations: data.locations,
        lastUpdated: new Date().toISOString()
      }));
    };
  }, []);
  
  return <Globe locations={state.locations} />;
}

// Component 2: Using selector (performance optimized)
function LocationCount() {
  // Only re-renders when locations.length changes
  const count = useStoreSelector('liveMap', (state) => state.locations.length);
  
  return <p>Total Locations: {count}</p>;
}

// Component 3: Another selector
function LastUpdated() {
  // Only re-renders when lastUpdated changes
  const lastUpdated = useStoreSelector('liveMap', (state) => state.lastUpdated);
  
  return <p>Last Updated: {lastUpdated}</p>;
}
*/

// ============================================================================
// EXAMPLE 4: Shopping Cart Store with History
// ============================================================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

export function createCartStore() {
  return createStore<CartState>(
    'cart',
    { items: [], total: 0 },
    {
      onChange: (newCart) => {
        // Automatically calculate total
        const total = newCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('Cart total:', total);
      }
    }
  );
}

// ============================================================================
// EXAMPLE 5: Multiple Stores Working Together
// ============================================================================

// Create all stores on app initialization:
/*
export function initializeStores() {
  createCounterStore();
  createUserStore();
  createLiveMapStore();
  createCartStore();
}

// In your App.tsx or main.tsx:
import { initializeStores } from './stores/examples';

function App() {
  useEffect(() => {
    initializeStores();
  }, []);
  
  return <YourApp />;
}
*/

// ============================================================================
// EXAMPLE 6: Vanilla JS Usage (No React)
// ============================================================================

/*
import { createStore } from '@/stores';

// Create store
const counterStore = createStore('counter', 0);

// Get value
console.log(counterStore.get()); // 0

// Set value
counterStore.set(10);
console.log(counterStore.get()); // 10

// Subscribe to changes
const unsubscribe = counterStore.subscribe((value) => {
  console.log('Counter changed:', value);
});

// Update (triggers subscriber)
counterStore.set(20); // Logs: "Counter changed: 20"

// Unsubscribe
unsubscribe();

// Update (doesn't trigger subscriber anymore)
counterStore.set(30);

// Reset to initial value
counterStore.reset();
console.log(counterStore.get()); // 0

// Destroy store
counterStore.destroy();
*/

// ============================================================================
// EXAMPLE 7: Debugging
// ============================================================================

/*
import { getDebugInfo, getAllStoreIds } from '@/stores';

function DebugPanel() {
  const storeIds = getAllStoreIds();
  const debugInfo = getDebugInfo();
  
  return (
    <div>
      <h3>Active Stores ({storeIds.length})</h3>
      {storeIds.map(id => (
        <div key={id}>
          <h4>{id}</h4>
          <pre>{JSON.stringify(debugInfo[id], null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
*/

export default {
  createCounterStore,
  createUserStore,
  createLiveMapStore,
  createCartStore
};
