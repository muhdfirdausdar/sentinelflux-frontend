/**
 * LiveMap to Location Integration Hook
 * 
 * Automatically transforms LiveMapData to Location array whenever the store changes
 * This hook bridges the gap between SSE data and Globe rendering
 */

import { useState } from 'react';
import { useLiveMapDataChange } from './useLiveMapStore';
import { transformLiveMapToLocations, getLocationStats } from './transformLiveMapData';
import { Location } from '../LocationData';

/**
 * Hook that automatically transforms LiveMap data to Locations
 * Listens to LiveMap store changes and transforms data on every update
 * 
 * @returns Array of Location objects ready for Globe rendering
 * 
 * @example
 * ```tsx
 * function LiveMapPage() {
 *   const locations = useLiveMapLocations();
 *   
 *   return <Globe locations={locations} />;
 * }
 * ```
 */
export function useLiveMapLocations(): Location[] {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Listen to LiveMap store changes
  useLiveMapDataChange((newData, oldData) => {
    console.log('🔄 LiveMap data changed, transforming to Locations...');
    
    // Determine if this is a reset (initial load)
    // Reset happens when:
    // 1. First load (no oldData, newData exists)
    // 2. Or when newData has significantly fewer domains than oldData (SSE sent reset signal)
    const oldCount = oldData ? Object.keys(oldData).length : 0;
    const newCount = newData ? Object.keys(newData).length : 0;
    const isReset = isFirstLoad || (oldCount === 0 && newCount > 0) || (oldCount > 0 && newCount < oldCount * 0.5);
    
    if (isFirstLoad && newData) {
      console.log('📍 First load detected - will reset Location store');
      setIsFirstLoad(false);
    }

    // Transform LiveMap data to Location array
    const transformedLocations = transformLiveMapToLocations(newData, isReset);
    
    // Update state
    setLocations(transformedLocations);
    
    // Log stats
    const stats = getLocationStats();
    console.log('📊 Location Stats:', stats);
  });

  return locations;
}

/**
 * Hook that provides both locations and statistics
 * Useful for displaying stats alongside the globe
 * 
 * @returns Object with locations array and stats object
 * 
 * @example
 * ```tsx
 * function LiveMapDashboard() {
 *   const { locations, stats } = useLiveMapWithStats();
 *   
 *   return (
 *     <>
 *       <Globe locations={locations} />
 *       <Stats data={stats} />
 *     </>
 *   );
 * }
 * ```
 */
export function useLiveMapWithStats() {
  const locations = useLiveMapLocations();
  const stats = getLocationStats();

  return { locations, stats };
}
