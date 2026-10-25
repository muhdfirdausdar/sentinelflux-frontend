import { useState, useEffect } from 'react';
import apiClient from "@/services/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants";
import { GetApiResponse } from "@/types/restapi";

// Type definitions matching the actual API response
export interface GeoIPLocation {
  country: string;
  latitude: number;
  longitude: number;
}

export interface Top10StatsData {
  last_update: string;
  top10_geoip: Record<string, GeoIPLocation>;  // "1", "2", "3", etc. as keys
  top10_ips: Record<string, string>;            // "1", "2", "3", etc. as keys
  top10_nameserver: Record<string, string>;     // "1", "2", "3", etc. as keys
}

// Custom hook to fetch Top 10 statistics
export function useTop10Stats() {
  const [data, setData] = useState<Top10StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTop10Stats = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = API_BASE_URL + API_ENDPOINTS.TOP_10_STATS;
        console.log('Fetching Top 10 stats from URL:', url);
        const response = await apiClient.request(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiResponse: GetApiResponse<Top10StatsData> = await response.json();

        if (!cancelled) {
          // Extract the data from the API response
          if (apiResponse.status === 'good' && apiResponse.data) {
            setData(apiResponse.data);
          } else {
            throw new Error(apiResponse.remark || 'Failed to fetch Top 10 stats');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching Top 10 stats:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTop10Stats();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      cancelled = true;
    };
  }, []); // Empty dependency array means this runs once on mount

  return { data, loading, error };
}

// Manual fetch function (for button clicks or conditional fetching)
export async function fetchTop10Stats(): Promise<Top10StatsData> {
  const url = API_ENDPOINTS.TOP_10_STATS;
  const response = await apiClient.request(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const apiResponse: GetApiResponse<Top10StatsData> = await response.json();
  
  if (apiResponse.status === 'good' && apiResponse.data) {
    return apiResponse.data;  // Returns only the data object
  } else {
    throw new Error(apiResponse.remark || 'Failed to fetch Top 10 stats');
  }
}

/* 
 * ============================================================================
 * HOW TO USE THIS MODULE
 * ============================================================================
 * 
 * This module extracts Top 10 statistics data from the API.
 * It provides two ways to fetch data:
 * 
 * 1. useTop10Stats() - Hook for automatic fetching when component mounts
 * 2. fetchTop10Stats() - Function for manual fetching (button clicks, etc.)
 * 
 * Both methods return ONLY the data object from the API response.
 * 
 * 
 * EXAMPLE 1: Automatic fetching with useEffect
 * ---------------------------------------------
 * import { useTop10Stats } from './getTop10';
 * 
 * function MyComponent() {
 *   const { data, loading, error } = useTop10Stats();
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div>
 *       <p>Last Update: {data?.last_update}</p>
 *       
 *       {Object.entries(data?.top10_geoip || {}).map(([rank, location]) => (
 *         <div key={rank}>
 *           #{rank}: {location.country} ({location.latitude}, {location.longitude})
 *         </div>
 *       ))}
 * 
 *       {Object.entries(data?.top10_ips || {}).map(([rank, ip]) => (
 *         <div key={rank}>#{rank}: {ip}</div>
 *       ))}
 * 
 *       {Object.entries(data?.top10_nameserver || {}).map(([rank, ns]) => (
 *         <div key={rank}>#{rank}: {ns}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXAMPLE 2: Manual fetching on button click
 * -------------------------------------------
 * import { fetchTop10Stats } from './getTop10';
 * import { useState } from 'react';
 * 
 * function MyComponent() {
 *   const [data, setData] = useState(null);
 * 
 *   const handleFetch = async () => {
 *     const result = await fetchTop10Stats();
 *     setData(result);
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleFetch}>Load Stats</button>
 *       {data && <div>{data.last_update}</div>}
 *     </div>
 *   );
 * }
 * 
 * 
 * EXAMPLE 3: Using in multiple components (shared data)
 * ------------------------------------------------------
 * // Parent component fetches once, children receive data as props
 * 
 * function Dashboard() {
 *   const { data, loading } = useTop10Stats();
 * 
 *   return (
 *     <div>
 *       <GeoIPMap data={data?.top10_geoip} loading={loading} />
 *       <IPList data={data?.top10_ips} loading={loading} />
 *       <NameserverList data={data?.top10_nameserver} loading={loading} />
 *     </div>
 *   );
 * }
 * 
 * 
 * DATA STRUCTURE YOU'LL RECEIVE:
 * -------------------------------
 * {
 *   last_update: "2025-10-26T10:55:53.619791",
 *   top10_geoip: {
 *     "1": { country: "India", latitude: 13.087898, longitude: 80.278481 },
 *     "2": { country: "United States of America", latitude: 32.783058, longitude: -96.806503 },
 *     ...
 *   },
 *   top10_ips: {
 *     "1": "216.198.79.195",
 *     "2": "216.198.79.131",
 *     ...
 *   },
 *   top10_nameserver: {
 *     "1": "ns2.vercel-dns-3.com",
 *     "2": "ns3.vercel-dns-3.com",
 *     ...
 *   }
 * }
 */