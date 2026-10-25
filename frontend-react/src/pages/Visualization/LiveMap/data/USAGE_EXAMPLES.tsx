/**
 * Usage Examples for LiveMap Data Structure
 */

import { useLiveMapData } from '../services/useLiveMapStore';
import { 
    flattenLiveMapData, 
    getTotalIPCount, 
    getTotalDomainCount,
    groupByCountry,
    groupByFluxType,
    getStatistics,
    filterByFluxType
} from '../data/utils';

// ============================================
// Example 1: Display total counts
// ============================================
function LiveMapStats() {
    const data = useLiveMapData();
    
    const totalDomains = getTotalDomainCount(data);
    const totalIPs = getTotalIPCount(data);
    
    return (
        <div>
            <p>Total Domains: {totalDomains}</p>
            <p>Total IPs: {totalIPs}</p>
        </div>
    );
}

// ============================================
// Example 2: Render locations on globe
// ============================================
function GlobeWithLiveData() {
    const data = useLiveMapData();
    
    // Flatten nested structure to simple array
    const locations = flattenLiveMapData(data);
    
    return (
        <div>
            {locations.map((loc, index) => (
                <div key={`${loc.domainId}-${loc.ip}-${index}`}>
                    <p>{loc.country}: {loc.ip}</p>
                    <p>Lat: {loc.latitude}, Lng: {loc.longitude}</p>
                    <p>Type: {loc.flux_type}</p>
                    <p>Last Active: {loc.last_active}</p>
                </div>
            ))}
        </div>
    );
}

// ============================================
// Example 3: Statistics dashboard
// ============================================
function LiveMapDashboard() {
    const data = useLiveMapData();
    
    const stats = getStatistics(data);
    
    return (
        <div>
            <h2>Live Map Statistics</h2>
            
            <div>
                <h3>Overview</h3>
                <p>Domains: {stats.totalDomains}</p>
                <p>IP Addresses: {stats.totalIPs}</p>
                <p>Last Activity: {stats.mostRecentActivity}</p>
            </div>
            
            <div>
                <h3>By Flux Type</h3>
                {Object.entries(stats.byFluxType).map(([type, count]) => (
                    <p key={type}>{type}: {count}</p>
                ))}
            </div>
            
            <div>
                <h3>By Country</h3>
                {Object.entries(stats.byCountry).map(([country, count]) => (
                    <p key={country}>{country}: {count}</p>
                ))}
            </div>
            
            <div>
                <h3>Countries</h3>
                <p>{stats.countries.join(', ')}</p>
            </div>
        </div>
    );
}

// ============================================
// Example 4: Filter by flux type
// ============================================
function SingleFluxMap() {
    const data = useLiveMapData();
    
    // Get only single-flux IPs
    const singleFluxData = filterByFluxType(data, 'single');
    const locations = flattenLiveMapData(singleFluxData);
    
    return (
        <div>
            <h3>Single-Flux Locations ({locations.length})</h3>
            {/* Render filtered locations */}
        </div>
    );
}

// ============================================
// Example 5: Access nested data directly
// ============================================
function DomainDetails() {
    const data = useLiveMapData();
    
    if (!data) return <p>No data</p>;
    
    return (
        <div>
            {Object.entries(data).map(([domainId, ipMap]) => (
                <div key={domainId}>
                    <h3>Domain: {domainId}</h3>
                    <p>IPs: {Object.keys(ipMap).length}</p>
                    
                    {Object.entries(ipMap).map(([ip, locationData]) => (
                        <div key={`${domainId}-${ip}`}>
                            <p>IP: {ip}</p>
                            <p>Country: {locationData.country}</p>
                            <p>Type: {locationData.flux_type}</p>
                            <p>Coords: {locationData.latitude}, {locationData.longitude}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================
// Example 6: Group by country pie chart
// ============================================
function CountryDistributionChart() {
    const data = useLiveMapData();
    const countryData = groupByCountry(data);
    
    // Convert to chart data format
    const chartData = Object.entries(countryData).map(([country, count]) => ({
        name: country,
        value: count
    }));
    
    return (
        <div>
            <h3>IP Distribution by Country</h3>
            {/* Pass chartData to your chart component */}
            {chartData.map(item => (
                <p key={item.name}>{item.name}: {item.value}</p>
            ))}
        </div>
    );
}

// ============================================
// Example 7: Console debugging
// ============================================
function DebugLiveMapData() {
    const data = useLiveMapData();
    
    const handleDebug = () => {
        console.log('=== LiveMap Data Debug ===');
        console.log('Raw data:', data);
        console.log('Statistics:', getStatistics(data));
        console.log('Flattened:', flattenLiveMapData(data));
        console.log('========================');
    };
    
    return <button onClick={handleDebug}>Debug Data</button>;
}

export {
    LiveMapStats,
    GlobeWithLiveData,
    LiveMapDashboard,
    SingleFluxMap,
    DomainDetails,
    CountryDistributionChart,
    DebugLiveMapData
};
