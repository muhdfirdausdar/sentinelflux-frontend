import { API_ENDPOINTS } from '@/constants';
import { useSSE } from '@/hooks/useSSE';
import { LiveMapData } from '../data';
import { createStore, getStore } from '@/stores';

/**
 * Custom hook for fetching live map data via SSE
 * Combines SSE streaming with persistent in-memory store
 * 
 * DATA FLOW:
 * 1. Initial SSE connection → Receives bulk data (e.g., 1000 items)
 * 2. Ongoing updates → Receives incremental data (e.g., +5 new items)
 * 3. Store merges old + new data (accumulates over time)
 */
export function useSSELiveMap() {
    // Create or get the store (only creates once, even if hook called multiple times)
    let store = getStore<LiveMapData | null>('liveMapData');
    if (!store) {
        store = createStore<LiveMapData | null>('liveMapData', null, {
            onChange: (newData, oldData) => {
                const oldCount = oldData ? Object.keys(oldData).length : 0;
                const newCount = newData ? Object.keys(newData).length : 0;
                console.log(`📦 LiveMap Store: ${oldCount} → ${newCount} items`);
            }
        });
    }

    // SSE hook to receive live data
    // storeData=false: Don't use useSSE's internal store (no comparison needed)
    // onRawMessage: Receives EVERY SSE message before any storage/comparison
    const { data: sseData, running, stop } = useSSE<LiveMapData>({
        endpoint: API_ENDPOINTS.STREAM_LIVEMAP,
        enabled: true,
        requireAuth: true,
        storeData: false, // We manage our own incremental store
        onRawMessage: (envelope) => {
            // envelope is SSEResponse<LiveMapData> with { status, remark, data }
            // This fires for EVERY message, not just when data changes
            
            const incomingData = envelope?.data;
            
            if (!incomingData || typeof incomingData !== 'object') {
                console.warn('🌍 LiveMap SSE: No data in message');
                return;
            }
            
            const incomingDomainCount = Object.keys(incomingData).length;
            const remark = envelope?.remark || 'Update received';
            
            // CHECK FOR INITIAL DATA LOAD: Reset store completely
            // This ensures we start fresh with bulk data, then accumulate incremental updates
            if (remark === 'Initial data loaded') {
                console.log(`🔄 LiveMap SSE: ${remark} - RESETTING store with ${incomingDomainCount} domains`);
                store.set(incomingData);  // Replace entire store with initial data
                return;
            }
            
            // INCREMENTAL UPDATE: Deep merge with existing data
            console.log(`🌍 LiveMap SSE: ${remark} (+${incomingDomainCount} domains in update)`);
            
            // Get current stored data
            const currentData = store.get() || {};
            const mergedData: LiveMapData = { ...currentData };
            
            // Deep merge: Iterate through each domain in the incoming data
            let domainsAdded = 0;
            let domainsUpdated = 0;
            let ipsAdded = 0;
            let ipsUpdated = 0;
            
            for (const [domainId, incomingIPMap] of Object.entries(incomingData)) {
                // Check if domain already exists in store
                if (mergedData[domainId]) {
                    // Domain exists: Merge IP data
                    domainsUpdated++;
                    
                    // Iterate through each IP in the incoming domain
                    for (const [ip, ipData] of Object.entries(incomingIPMap)) {
                        if (mergedData[domainId][ip]) {
                            // IP exists: Update (replace) with new data
                            mergedData[domainId][ip] = ipData;
                            ipsUpdated++;
                        } else {
                            // IP is new: Add to domain
                            mergedData[domainId][ip] = ipData;
                            ipsAdded++;
                        }
                    }
                } else {
                    // Domain is new: Add entire domain with all its IPs
                    mergedData[domainId] = incomingIPMap;
                    domainsAdded++;
                    ipsAdded += Object.keys(incomingIPMap).length;
                }
            }
            
            const totalDomains = Object.keys(mergedData).length;
            const totalIPs = Object.values(mergedData).reduce(
                (sum, ipMap) => sum + Object.keys(ipMap).length, 
                0
            );
            
            console.log(`📦 Merge Stats:`);
            console.log(`   Domains: +${domainsAdded} new, ~${domainsUpdated} updated (${totalDomains} total)`);
            console.log(`   IPs: +${ipsAdded} new, ~${ipsUpdated} updated (${totalIPs} total)`);
            
            // Update store with deeply merged data
            store.set(mergedData);
        }
    });

    return {
        data: store.get(),  // Latest merged data from general store (this is what you want to use)
        sseData,            // Latest SSE response (from useSSE's internal store, for debugging)
        running,            // SSE connection status
        stop,               // Function to stop SSE
        store               // Direct access to store for advanced usage
    };
}