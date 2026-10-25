/**
 * LiveMap Data Structure
 * 
 * Data is nested: domain_id → ip_address → location_data
 * 
 * Example:
 * {
 *   "domain_id": {
 *     "102.165.0.1": {
 *       "last_active": "2025-10-12 06:30:00.123456",
 *       "latitude": 3.139,
 *       "longitude": 101.6869,
 *       "country": "Malaysia",
 *       "flux_type": "single"
 *     },
 *     "102.165.0.2": {
 *       "last_active": "2025-10-12 06:35:00.123456",
 *       "latitude": 3.139,
 *       "longitude": 101.6869,
 *       "country": "Malaysia",
 *       "flux_type": "single"
 *     }
 *   },
 *   "domain_id_2": {
 *     "172.67.23.45": {
 *       "last_active": "2025-10-11 21:00:00.789012",
 *       "latitude": 37.751,
 *       "longitude": -97.822,
 *       "country": "United States",
 *       "flux_type": "double"
 *     }
 *   }
 * }
 */

/**
 * Single location data point for an IP address
 */
export type LiveMapIPData = {
    last_active: string;  // ISO timestamp of last activity
    latitude: number;     // Geographic latitude
    longitude: number;    // Geographic longitude
    country: string;      // Country name
    flux_type: 'single' | 'double' | 'name';  // Type of flux detected
}

/**
 * Map of IP addresses to their location data
 * Key: IP address (e.g., "102.165.0.1")
 * Value: Location and flux information
 */
export type DomainIPMap = {
    [ipAddress: string]: LiveMapIPData;
}

/**
 * Complete LiveMap data structure
 * Key: Domain ID (e.g., "domain_id", "example.com")
 * Value: Map of IPs associated with that domain
 */

export type LiveMapData = {
    [domainId: string]: DomainIPMap;
}



/*
	Designing data structure
	- id: number
	- ip_address: string
	- country: string
	- total_domains: number
	- last_active: string
	- total_single_flux_domain: number
	- total_double_flux_domain: number
	- total_name_flux_domain: number
	- coords: [lon, lat]
	- color: string
	- circle_radius: number
	- glow_intensity: GlobeFilters (enum) { SUBTLE_GLOW, GLOW[default], PULSING_GLOW, STRONG_GLOW, ULTRA_GLOW }
*/

import { GlobeFilters } from "../GlobeSvgDefs";


export interface LocationType {
  id: number;
  ip_address: string;
  country: string;
  total_domains: number;
  last_active: string;
  total_single_flux_domain: number;
  total_double_flux_domain: number;
  total_name_flux_domain: number;
  coords: [number, number]; // [lon, lat]
  color: string;
  circle_radius: number;
  glow_intensity: typeof GlobeFilters[keyof typeof GlobeFilters];
}