/**
 * Utility functions for working with LiveMap data
 */

import type { LiveMapData, LiveMapIPData, DomainIPMap } from './index';

/**
 * Flatten nested LiveMap data to a simple array of locations
 * Useful for rendering on a map
 * 
 * @example
 * const locations = flattenLiveMapData(data);
 * // [
 * //   { domainId: "domain_id", ip: "102.165.0.1", latitude: 3.139, ... },
 * //   { domainId: "domain_id", ip: "102.165.0.2", latitude: 3.139, ... },
 * // ]
 */
export function flattenLiveMapData(data: LiveMapData | null): Array<LiveMapIPData & { domainId: string; ip: string }> {
    if (!data) return [];
    
    const result: Array<LiveMapIPData & { domainId: string; ip: string }> = [];
    
    // Iterate through domains
    for (const [domainId, ipMap] of Object.entries(data)) {
        // Iterate through IPs for each domain
        for (const [ip, locationData] of Object.entries(ipMap)) {
            result.push({
                domainId,
                ip,
                ...locationData
            });
        }
    }
    
    return result;
}

/**
 * Get total count of all IPs across all domains
 */
export function getTotalIPCount(data: LiveMapData | null): number {
    if (!data) return 0;
    
    return Object.values(data).reduce((total, ipMap) => {
        return total + Object.keys(ipMap).length;
    }, 0);
}

/**
 * Get total count of domains
 */
export function getTotalDomainCount(data: LiveMapData | null): number {
    if (!data) return 0;
    return Object.keys(data).length;
}

/**
 * Get all IPs for a specific domain
 */
export function getIPsForDomain(data: LiveMapData | null, domainId: string): DomainIPMap | null {
    if (!data || !data[domainId]) return null;
    return data[domainId];
}

/**
 * Get location data for a specific IP in a specific domain
 */
export function getIPLocation(data: LiveMapData | null, domainId: string, ip: string): LiveMapIPData | null {
    if (!data || !data[domainId] || !data[domainId][ip]) return null;
    return data[domainId][ip];
}

/**
 * Group locations by country
 * Useful for statistics/charts
 */
export function groupByCountry(data: LiveMapData | null): Record<string, number> {
    if (!data) return {};
    
    const countsByCountry: Record<string, number> = {};
    
    for (const ipMap of Object.values(data)) {
        for (const locationData of Object.values(ipMap)) {
            const country = locationData.country;
            countsByCountry[country] = (countsByCountry[country] || 0) + 1;
        }
    }
    
    return countsByCountry;
}

/**
 * Group locations by flux type
 * Useful for statistics/charts
 */
export function groupByFluxType(data: LiveMapData | null): Record<string, number> {
    if (!data) return {};
    
    const countsByFluxType: Record<string, number> = {};
    
    for (const ipMap of Object.values(data)) {
        for (const locationData of Object.values(ipMap)) {
            const fluxType = locationData.flux_type;
            countsByFluxType[fluxType] = (countsByFluxType[fluxType] || 0) + 1;
        }
    }
    
    return countsByFluxType;
}

/**
 * Get most recent activity timestamp across all data
 */
export function getMostRecentActivity(data: LiveMapData | null): string | null {
    if (!data) return null;
    
    let mostRecent: string | null = null;
    
    for (const ipMap of Object.values(data)) {
        for (const locationData of Object.values(ipMap)) {
            if (!mostRecent || locationData.last_active > mostRecent) {
                mostRecent = locationData.last_active;
            }
        }
    }
    
    return mostRecent;
}

/**
 * Filter locations by flux type
 */
export function filterByFluxType(
    data: LiveMapData | null, 
    fluxType: 'single' | 'double' | 'name'
): LiveMapData {
    if (!data) return {};
    
    const filtered: LiveMapData = {};
    
    for (const [domainId, ipMap] of Object.entries(data)) {
        for (const [ip, locationData] of Object.entries(ipMap)) {
            if (locationData.flux_type === fluxType) {
                if (!filtered[domainId]) {
                    filtered[domainId] = {};
                }
                filtered[domainId][ip] = locationData;
            }
        }
    }
    
    return filtered;
}

/**
 * Filter locations by country
 */
export function filterByCountry(data: LiveMapData | null, country: string): LiveMapData {
    if (!data) return {};
    
    const filtered: LiveMapData = {};
    
    for (const [domainId, ipMap] of Object.entries(data)) {
        for (const [ip, locationData] of Object.entries(ipMap)) {
            if (locationData.country === country) {
                if (!filtered[domainId]) {
                    filtered[domainId] = {};
                }
                filtered[domainId][ip] = locationData;
            }
        }
    }
    
    return filtered;
}

/**
 * Get unique countries list
 */
export function getUniqueCountries(data: LiveMapData | null): string[] {
    if (!data) return [];
    
    const countries = new Set<string>();
    
    for (const ipMap of Object.values(data)) {
        for (const locationData of Object.values(ipMap)) {
            countries.add(locationData.country);
        }
    }
    
    return Array.from(countries).sort();
}

/**
 * Get statistics summary
 */
export function getStatistics(data: LiveMapData | null) {
    return {
        totalDomains: getTotalDomainCount(data),
        totalIPs: getTotalIPCount(data),
        byCountry: groupByCountry(data),
        byFluxType: groupByFluxType(data),
        countries: getUniqueCountries(data),
        mostRecentActivity: getMostRecentActivity(data)
    };
}
