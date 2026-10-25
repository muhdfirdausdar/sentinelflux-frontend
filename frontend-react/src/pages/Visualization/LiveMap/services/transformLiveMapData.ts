/**
 * LiveMap Data Transformer
 * 
 * Transforms LiveMapData (domain → IP structure) into LocationType array for Globe rendering
 * 
 * FLOW:
 * 1. Iterate through LiveMapData (nested: domain → IP)
 * 2. For each IP:
 *    - If NEW: Create new Location with unique ID
 *    - If EXISTS: Update if newer last_active, increment domain counters
 * 3. Calculate derived properties (color, radius, glow) based on aggregated data
 */

import { LiveMapData, LiveMapIPData } from '../data';
import { Location } from '../LocationData';
import { GlobeFilters } from '../GlobeSvgDefs';
import { convertToUserTimezone } from '@/utils/dateTime';

/**
 * In-memory store for Location data
 * Key: IP address
 * Value: Location object
 */
let locationStore: Map<string, Location> = new Map();
let nextId = 1; // Auto-increment ID counter

/**
 * Convert LiveMapData last_active string to user timezone Date object
 * Format: "2025-10-12 06:30:00.123456" → Date in user timezone
 */
const convertLastActiveToUserTimezone = (lastActive: string): Date => {
  // The format is: "YYYY-MM-DD HH:MM:SS.ffffff"
  // We need to convert to ISO format first, then convert to user timezone
  
  // Replace space with 'T' and add 'Z' for UTC
  const isoString = lastActive.replace(' ', 'T') + 'Z';
  return convertToUserTimezone(isoString);
};

/**
 * Format Date object back to string in user timezone
 */
const formatDateToString = (date: Date): string => {
  // Format: "YYYY-MM-DD HH:MM:SS"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Determine color based on flux type priority
 * Priority: double (red) > name (blue) > single (yellow)
 */
const determineColor = (
  singleCount: number,
  doubleCount: number,
  nameCount: number
): string => {
  if (doubleCount > 0) return '#ff0000'; // Bright red
  if (nameCount > 0) return '#0000ff';   // Bright blue
  return '#ffff00'; // Yellow (single or default)
};

/**
 * Determine circle radius based on total domains
 */
const determineCircleRadius = (totalDomains: number): number => {
  if (totalDomains === 1) return 2.0;
  if (totalDomains < 3) return 2.3;
  if (totalDomains < 7) return 2.5;
  if (totalDomains < 10) return 2.7;
  return 3.0; // >= 10 domains
};

/**
 * Determine glow intensity based on last active time
 */
const determineGlowIntensity = (lastActiveDate: Date): typeof GlobeFilters[keyof typeof GlobeFilters] => {
  const now = new Date();
  const diffMs = now.getTime() - lastActiveDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours <= 5) return GlobeFilters.ULTRA_GLOW;  // <= 5 hours
  if (diffDays <= 1) return GlobeFilters.STRONG_GLOW;  // <= 1 day
  if (diffDays <= 3) return GlobeFilters.PULSING_GLOW; // <= 3 days
  if (diffDays <= 5) return GlobeFilters.GLOW;         // <= 5 days
  return GlobeFilters.SUBTLE_GLOW;                     // > 5 days
};

/**
 * Transform LiveMapData to Location array
 * This is the main transformation function
 * 
 * @param liveMapData - Nested data structure from SSE
 * @param isReset - If true, clears existing location store (for "Initial data loaded")
 * @returns Array of Location objects for Globe rendering
 */
export const transformLiveMapToLocations = (
  liveMapData: LiveMapData | null,
  isReset: boolean = false
): Location[] => {
  // RESET: Clear existing data if this is initial load
  if (isReset) {
    console.log('🔄 Resetting Location store...');
    locationStore.clear();
    nextId = 1;
  }

  if (!liveMapData) {
    console.log('⚠️ No LiveMap data to transform');
    return Array.from(locationStore.values());
  }

  console.log('🔄 Transforming LiveMap data to Locations...');

  // PHASE 1: Iterate through LiveMapData and build/update Location store
  // For each domain → for each IP
  for (const [domainId, ipMap] of Object.entries(liveMapData)) {
    for (const [ipAddress, ipData] of Object.entries(ipMap)) {
      processIPData(domainId, ipAddress, ipData);
    }
  }

  // PHASE 2: Calculate derived properties for all locations
  for (const location of locationStore.values()) {
    updateDerivedProperties(location);
  }

  const locations = Array.from(locationStore.values());
  console.log(`✅ Transformed ${locations.length} unique IPs into Locations`);
  
  return locations;
};

/**
 * Process a single IP data entry
 * Handles: new IP creation, duplicate detection, counter increments
 */
const processIPData = (
  domainId: string,
  ipAddress: string,
  ipData: LiveMapIPData
): void => {
  const existingLocation = locationStore.get(ipAddress);

  // Convert last_active to user timezone Date object
  const incomingLastActive = convertLastActiveToUserTimezone(ipData.last_active);

  if (!existingLocation) {
    // STEP 1: NEW IP - Create new Location entry
    const newLocation: Location = {
      id: nextId++,
      ip_address: ipAddress,
      country: ipData.country,
      coords: [ipData.longitude, ipData.latitude], // [lon, lat] for D3
      last_active: formatDateToString(incomingLastActive),
      total_domains: 1,
      total_single_flux_domain: ipData.flux_type === 'single' ? 1 : 0,
      total_double_flux_domain: ipData.flux_type === 'double' ? 1 : 0,
      total_name_flux_domain: ipData.flux_type === 'name' ? 1 : 0,
      // Derived properties (will be calculated in Phase 2)
      color: '#ffff00', // Default yellow
      circle_radius: 2.0, // Default
      glow_intensity: GlobeFilters.GLOW // Default
    };

    locationStore.set(ipAddress, newLocation);
    console.log(`  ➕ New IP: ${ipAddress} from ${ipData.country}`);
  } else {
    // STEP 2: EXISTING IP - Check if we need to update location data
    const existingLastActive = convertLastActiveToUserTimezone(existingLocation.last_active);

    // Compare timestamps: if incoming is newer, update location data
    if (incomingLastActive > existingLastActive) {
      console.log(`  🔄 Updating IP ${ipAddress}: newer last_active`);
      existingLocation.last_active = formatDateToString(incomingLastActive);
      existingLocation.country = ipData.country;
      existingLocation.coords = [ipData.longitude, ipData.latitude];
    }

    // STEP 3: INCREMENT COUNTERS (always, regardless of timestamp)
    existingLocation.total_domains += 1;

    // Increment flux type counters based on incoming data
    if (ipData.flux_type === 'single') {
      existingLocation.total_single_flux_domain += 1;
    } else if (ipData.flux_type === 'double') {
      existingLocation.total_double_flux_domain += 1;
    } else if (ipData.flux_type === 'name') {
      existingLocation.total_name_flux_domain += 1;
    }

    console.log(`  📊 Incremented counters for ${ipAddress}: ${existingLocation.total_domains} domains`);
  }
};

/**
 * Update derived properties for a Location
 * STEP 4: Calculate color, radius, and glow based on aggregated data
 */
const updateDerivedProperties = (location: Location): void => {
  // Calculate color based on flux type priority
  location.color = determineColor(
    location.total_single_flux_domain,
    location.total_double_flux_domain,
    location.total_name_flux_domain
  );

  // Calculate radius based on total domains
  location.circle_radius = determineCircleRadius(location.total_domains);

  // Calculate glow intensity based on last active
  const lastActiveDate = convertLastActiveToUserTimezone(location.last_active);
  location.glow_intensity = determineGlowIntensity(lastActiveDate);
};

/**
 * Get current Location store as array
 * Useful for reading without transformation
 */
export const getCurrentLocations = (): Location[] => {
  return Array.from(locationStore.values());
};

/**
 * Get statistics about current Location store
 */
export const getLocationStats = () => {
  const locations = Array.from(locationStore.values());
  
  return {
    totalIPs: locations.length,
    totalDomains: locations.reduce((sum, loc) => sum + loc.total_domains, 0),
    byFluxType: {
      single: locations.reduce((sum, loc) => sum + loc.total_single_flux_domain, 0),
      double: locations.reduce((sum, loc) => sum + loc.total_double_flux_domain, 0),
      name: locations.reduce((sum, loc) => sum + loc.total_name_flux_domain, 0),
    },
    byColor: {
      red: locations.filter(loc => loc.color === '#ff0000').length,
      blue: locations.filter(loc => loc.color === '#0000ff').length,
      yellow: locations.filter(loc => loc.color === '#ffff00').length,
    },
    byGlow: {
      ultra: locations.filter(loc => loc.glow_intensity === GlobeFilters.ULTRA_GLOW).length,
      strong: locations.filter(loc => loc.glow_intensity === GlobeFilters.STRONG_GLOW).length,
      pulsing: locations.filter(loc => loc.glow_intensity === GlobeFilters.PULSING_GLOW).length,
      normal: locations.filter(loc => loc.glow_intensity === GlobeFilters.GLOW).length,
      subtle: locations.filter(loc => loc.glow_intensity === GlobeFilters.SUBTLE_GLOW).length,
    }
  };
};

/**
 * Clear the location store
 * Used when LiveMap data is reset
 */
export const clearLocationStore = (): void => {
  console.log('🗑️ Clearing Location store...');
  locationStore.clear();
  nextId = 1;
};
