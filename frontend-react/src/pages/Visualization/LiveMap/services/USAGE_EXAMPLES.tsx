/**
 * LiveMap Store Usage Examples
 * 
 * This file shows different ways to use the LiveMap store in your components
 */

import React, { useEffect } from 'react';
import { useSSELiveMap } from './useSSELiveMap';
import { useLiveMapData, useLiveMapStore } from './useLiveMapStore';
import { LiveMapData } from '../data';

// ============================================================================
// EXAMPLE 1: Component that STARTS SSE and STORES data
// ============================================================================
// This should be at the TOP level of your app (e.g., in LiveMap.tsx)

export function LiveMapSSEProvider() {
  const { sseData, storeData, running } = useSSELiveMap();
  
  useEffect(() => {
    console.log('SSE Data:', sseData);
    console.log('Store Data:', storeData);
    console.log('Running:', running);
  }, [sseData, storeData, running]);
  
  return (
    <div>
      <p>SSE Status: {running ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p>Data in store: {storeData ? 'Available' : 'None'}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Component that READS data from store (read-only)
// ============================================================================
// Use this in any child component that needs to display the data

export function LiveMapDisplay() {
  // Simple read-only access
  const data = useLiveMapData();
  
  if (!data) {
    return <div>No live map data available</div>;
  }
  
  return (
    <div>
      <h3>Live Map Data</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Component that can READ and WRITE to store
// ============================================================================
// Use this if you need to manually update the store

export function LiveMapEditor() {
  const [data, setData] = useLiveMapStore();
  
  const handleUpdate = () => {
    // Manually update store
    setData({
      // ... your LiveMapData structure
    } as LiveMapData);
  };
  
  return (
    <div>
      <button onClick={handleUpdate}>Update Store</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Multiple components accessing SAME store
// ============================================================================

export function LocationCount() {
  const data = useLiveMapData();
  
  // Only shows count, but shares same store as other components
  return <div>Locations: {data?.locations?.length ?? 0}</div>;
}

export function LastUpdate() {
  const data = useLiveMapData();
  
  // Only shows timestamp, but shares same store as other components
  return <div>Last Update: {data?.timestamp ?? 'Never'}</div>;
}

export function MapVisualization() {
  const data = useLiveMapData();
  
  // Renders the map using shared store data
  return <div>{/* Your map rendering */}</div>;
}

// All 3 components above read from the SAME store!
// When SSE updates the store, ALL 3 components re-render automatically

// ============================================================================
// EXAMPLE 5: Complete LiveMap Page Structure
// ============================================================================

export function LiveMapPage() {
  return (
    <div>
      {/* This component starts SSE and feeds data into store */}
      <LiveMapSSEProvider />
      
      {/* All these components read from the same store */}
      <LocationCount />
      <LastUpdate />
      <MapVisualization />
      <LiveMapDisplay />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Using in Globe.tsx
// ============================================================================

/*
import { useLiveMapData } from './services/useLiveMapStore';

function Globe() {
  // Get live map data from store
  const liveMapData = useLiveMapData();
  
  useEffect(() => {
    if (liveMapData) {
      console.log('🌍 Globe received data from store:', liveMapData);
      // Update globe with new locations
    }
  }, [liveMapData]);
  
  return <svg>...</svg>;
}
*/
