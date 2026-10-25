import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { A_RECORD_ADDON } from '@/constants/graphql';
import { ARecordAddonData, ARecordAddonResult } from '@/types/graphql';

/**
 * Custom hook for fetching A Record Addon (Related Domains & Nameservers)
 * 
 * @example
 * const { fetchARecordAddon, data, loading } = useARecordAddon();
 * const result = await fetchARecordAddon(10, 5);
 * // Returns: { relatedDomain: [...], relatedNameserver: [...] }
 */
export function useARecordAddon() {
  const [executeARecordAddon, { data, loading, error }] = useLazyGraphQL<ARecordAddonData>(
    A_RECORD_ADDON,
    {
      onCompleted: (result) => {
        // console.log('A Record Addon completed:', result);
      },
      onError: (err) => {
        console.error('A Record Addon error:', err);
      }
    }
  );

  /**
   * Fetch related domains and nameservers by IP ID and Domain ID
   * @param ipId - The ID of the IP address
   * @param domainId - The ID of the domain
   * @returns Promise with related domains and nameservers or null
   */
  const fetchARecordAddon = async (ipId: number, domainId: number): Promise<ARecordAddonResult | null> => {
    try {
      const result = await executeARecordAddon({
        variables: { ipId, domainId }
      });
      
      // Return the unwrapped data
      return result.data?.aRecordAddon || null;
    } catch (err) {
      console.error('Error fetching A record addon:', err);
      return null;
    }
  };

  return {
    fetchARecordAddon,
    data: data?.aRecordAddon || null, // Unwrapped data
    loading,
    error,
  };
}

/**
 * Direct function to fetch A record addon without hook
 * 
 * @param ipId - The ID of the IP address
 * @param domainId - The ID of the domain
 * @returns Promise with A record addon data or null
 */
export async function fetchARecordAddon(
  ipId: number,
  domainId: number,
  client: any // Apollo Client instance
): Promise<ARecordAddonResult | null> {
  try {
    const result = await client.query({
      query: A_RECORD_ADDON,
      variables: { ipId, domainId },
    });
    
    return result.data?.aRecordAddon || null;
  } catch (err) {
    console.error('Error fetching A record addon:', err);
    return null;
  }
}

/**
 * Sample processed data structure returned by this API:
 * 
 * {
 *   relatedDomain: [
 *     {
 *       domainId: 123,
 *       domainName: "example.com",
 *       firstSeen: "2025-05-03T04:35:26+00:00",
 *       lastSeen: "2025-08-16T03:37:29.586382+00:00",
 *       fluxType: "SINGLEFLUX",
 *       isMalicious: true
 *     }
 *   ],
 *   relatedNameserver: [
 *     {
 *       nameserverId: 456,
 *       nameserverName: "ns1.example.com",
 *       firstSeen: "2025-05-03T04:35:26+00:00",
 *       lastSeen: "2025-08-16T03:37:29.586382+00:00",
 *       lowestTtl: 300,
 *       latestTtl: 3600
 *     }
 *   ]
 * }
 */
