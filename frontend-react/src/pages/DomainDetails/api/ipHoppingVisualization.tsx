import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { IP_HOPPING_VISUALIZATION } from '@/constants/graphql';
import { IPHoppingVisualizationData, IPHoppingVisualizationResult } from '@/types/graphql';

/**
 * Custom hook for fetching IP Hopping Visualization
 * 
 * @example
 * const { fetchIPHopping, data, loading } = useIPHoppingVisualization();
 * const result = await fetchIPHopping(5, 30);
 * // Returns: { domainId: 5, timeGroups: [{ timestamp: "...", ips: [...] }] }
 */
export function useIPHoppingVisualization() {
  const [executeIPHopping, { data, loading, error }] = useLazyGraphQL<IPHoppingVisualizationData>(
    IP_HOPPING_VISUALIZATION,
    {
      onCompleted: (result) => {
        // console.log('IP Hopping Visualization completed:', result);
      },
      onError: (err) => {
        console.error('IP Hopping Visualization error:', err);
      }
    }
  );

  /**
   * Fetch IP hopping visualization data
   * @param domainId - The ID of the domain to fetch
   * @param daysBack - Number of days to look back
   * @returns Promise with time-grouped IP location data or null
   */
  const fetchIPHopping = async (
    domainId: number,
    daysBack: number
  ): Promise<IPHoppingVisualizationResult | null> => {
    try {
      const result = await executeIPHopping({
        variables: { domainId, daysBack }
      });
      
      // Return the unwrapped data
      return result.data?.ipHoppingVisualization || null;
    } catch (err) {
      console.error('Error fetching IP hopping visualization:', err);
      return null;
    }
  };

  return {
    fetchIPHopping,
    data: data?.ipHoppingVisualization || null, // Unwrapped data
    loading,
    error,
  };
}

/**
 * Direct function to fetch IP hopping visualization without hook
 * 
 * @param domainId - The ID of the domain to fetch
 * @param daysBack - Number of days to look back
 * @returns Promise with IP hopping visualization data or null
 */
export async function fetchIPHoppingVisualization(
  domainId: number,
  daysBack: number,
  client: any // Apollo Client instance
): Promise<IPHoppingVisualizationResult | null> {
  try {
    const result = await client.query({
      query: IP_HOPPING_VISUALIZATION,
      variables: { domainId, daysBack },
    });
    
    return result.data?.ipHoppingVisualization || null;
  } catch (err) {
    console.error('Error fetching IP hopping visualization:', err);
    return null;
  }
}

/**
 * Sample processed data structure returned by this API:
 * 
 * {
 *   domainId: 5,
 *   timeGroups: [
 *     {
 *       timestamp: "2025-10-12T08:01:40.797022+00:00",
 *       ips: [
 *         {
 *           ipAddress: "172.217.25.110",
 *           latitude: "35.689499",
 *           longitude: "139.692322"
 *         },
 *         {
 *           ipAddress: "104.21.42.43",
 *           latitude: "37.774929",
 *           longitude: "-122.419418"
 *         }
 *       ]
 *     },
 *     {
 *       timestamp: "2025-10-13T10:15:20.123456+00:00",
 *       ips: [
 *         {
 *           ipAddress: "172.67.156.26",
 *           latitude: "40.712776",
 *           longitude: "-74.005974"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
