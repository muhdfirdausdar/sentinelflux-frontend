# General-Purpose In-Memory Store Module

A type-safe, flexible store system for managing application state in React and vanilla JavaScript.

## 📁 File Structure

```
src/stores/
├── index.ts           # Main exports
├── types.ts           # TypeScript type definitions
├── createStore.ts     # Core store implementation
├── useStore.ts        # React hooks
├── examples.ts        # Usage examples
└── README.md          # This file
```

## ✨ Features

- ✅ **Type-safe** with TypeScript generics
- ✅ **Multiple stores** with unique IDs
- ✅ **React integration** via `useSyncExternalStore`
- ✅ **Performance optimized** with selectors
- ✅ **Validation support** for data integrity
- ✅ **Change callbacks** for side effects
- ✅ **Metadata tracking** (updates, subscribers, timestamps)
- ✅ **No dependencies** on SSE or other modules
- ✅ **Works with vanilla JS** (not React-only)

## 🚀 Quick Start

### 1. Create a Store

```typescript
import { createStore } from '@/stores';

interface User {
  name: string;
  age: number;
}

const userStore = createStore<User>('user', { name: 'Alice', age: 30 });
```

### 2. Use in React Component

```tsx
import { useStore } from '@/stores';

function UserProfile() {
  const [user, setUser] = useStore<User>('user', { name: '', age: 0 });
  
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Increment Age
      </button>
    </div>
  );
}
```

### 3. Use Selector for Performance

```tsx
import { useStoreSelector } from '@/stores';

function UserName() {
  // Only re-renders when user.name changes (not when age changes)
  const name = useStoreSelector('user', (user) => user.name);
  
  return <p>Hello, {name}!</p>;
}
```

## 📚 API Reference

### Core Functions

#### `createStore<T>(id, initialValue, options)`
Creates a new store or retrieves existing one.

```typescript
const store = createStore<User>(
  'user',                           // Unique ID
  { name: '', age: 0 },            // Initial value
  {
    validator: (user) => user.age >= 0,  // Optional validation
    onChange: (newVal, oldVal) => {}     // Optional callback
  }
);
```

#### `getStore<T>(id)`
Get an existing store by ID.

```typescript
const store = getStore<User>('user');
if (store) {
  console.log(store.get());
}
```

#### `hasStore(id)`
Check if a store exists.

```typescript
if (!hasStore('user')) {
  createStore('user', { name: '', age: 0 });
}
```

#### `destroyStore(id)`
Remove a store and clean up all resources.

```typescript
destroyStore('user');
```

### Store Methods

#### `store.get()`
Get current value.

```typescript
const user = userStore.get();
```

#### `store.set(value)`
Set new value (supports updater function).

```typescript
// Direct value
userStore.set({ name: 'Bob', age: 25 });

// Updater function
userStore.set(prev => ({ ...prev, age: prev.age + 1 }));
```

#### `store.subscribe(listener)`
Subscribe to changes.

```typescript
const unsubscribe = userStore.subscribe((user) => {
  console.log('User changed:', user);
});

// Later...
unsubscribe();
```

#### `store.reset()`
Reset to initial value.

```typescript
userStore.reset();
```

#### `store.destroy()`
Clean up store.

```typescript
userStore.destroy();
```

#### `store.getMetadata()`
Get store metadata.

```typescript
const meta = userStore.getMetadata();
console.log(meta.updateCount);
console.log(meta.subscriberCount);
```

### React Hooks

#### `useStore<T>(id, initialValue, options)`
Use a store in React (creates if doesn't exist).

```typescript
const [value, setValue] = useStore('counter', 0);
```

#### `useStoreSelector<T, S>(id, selector)`
Use store with selector for performance.

```typescript
const name = useStoreSelector('user', (user) => user.name);
```

#### `useStoreMetadata(id)`
Get store metadata in React.

```typescript
const metadata = useStoreMetadata('user');
```

## 🎯 Use Cases

### 1. Live Map State

```typescript
interface LiveMapState {
  locations: Location[];
  lastUpdated: string | null;
}

createStore<LiveMapState>('liveMap', {
  locations: [],
  lastUpdated: null
});

// In component:
function LiveMap() {
  const [state, setState] = useStore('liveMap', { locations: [], lastUpdated: null });
  
  // Update from SSE
  useSSE({
    endpoint: '/api/livemap',
    onMessage: (data) => {
      setState({
        locations: data.data.locations,
        lastUpdated: new Date().toISOString()
      });
    }
  });
  
  return <Globe locations={state.locations} />;
}
```

### 2. Shopping Cart

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

createStore<CartItem[]>('cart', []);

function Cart() {
  const [items, setItems] = useStore<CartItem[]>('cart', []);
  
  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };
  
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (/* ... */);
}
```

### 3. Theme State

```typescript
createStore<'light' | 'dark'>('theme', 'light');

function ThemeToggle() {
  const [theme, setTheme] = useStore('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

## 🆚 Comparison with useSSE Store

| Feature | General Store | useSSE Store |
|---------|--------------|--------------|
| Purpose | General state management | SSE-specific |
| Coupling | None | Tied to SSE connections |
| Identifier | Any string ID | Endpoint URL |
| React Hook | Yes | Yes |
| Vanilla JS | Yes | No |
| Validation | Yes | No |
| Callbacks | Yes | Yes (onMessage) |
| Persistence | In-memory only | In-memory only |
| Use Cases | Any state | SSE streaming data |

## 🔧 Advanced Usage

### Validation

```typescript
createStore<User>('user', { name: '', age: 0 }, {
  validator: (user) => {
    if (user.age < 0) return false;
    if (user.name.length > 50) return false;
    return true;
  }
});
```

### Change Callbacks

```typescript
createStore('counter', 0, {
  onChange: (newVal, oldVal) => {
    console.log(`Counter: ${oldVal} → ${newVal}`);
    // Send analytics
    // Trigger side effects
  }
});
```

### Debugging

```typescript
import { getAllStoreIds, getDebugInfo } from '@/stores';

// List all stores
console.log('Active stores:', getAllStoreIds());

// Debug info
console.log('Debug info:', getDebugInfo());
```

## 📝 Best Practices

1. **Create stores early**: Initialize stores in your app's entry point
2. **Use selectors**: Optimize performance with `useStoreSelector`
3. **Type everything**: Always provide TypeScript types
4. **Clean up**: Destroy stores when no longer needed
5. **Validate data**: Use validators for data integrity
6. **Unique IDs**: Use descriptive, unique store IDs

## 🐛 Troubleshooting

### Store doesn't exist error
```typescript
// ❌ Wrong: Store not created
const [user] = useStore('user');

// ✅ Correct: Provide initial value
const [user] = useStore('user', { name: '', age: 0 });
```

### Validation failing
```typescript
// Check console for validation errors
// Ensure validator returns true for valid data
```

### Too many re-renders
```typescript
// ❌ Wrong: Component re-renders on any change
const [state] = useStore('bigState');

// ✅ Correct: Only re-render when specific field changes
const name = useStoreSelector('bigState', (s) => s.name);
```

## 📖 See Also

- [`examples.ts`](./examples.ts) - Comprehensive usage examples
- [`types.ts`](./types.ts) - Type definitions
- [`useSSE.ts`](../hooks/useSSE.ts) - SSE-specific store
