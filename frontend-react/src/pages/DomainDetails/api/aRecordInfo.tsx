import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { A_RECORD_INFO } from '@/constants/graphql';
import { ARecordInfoData, ARecordInfoResult } from '@/types/graphql';

/**
 * Custom hook for fetching A Record Info
 * 
 * @example
 * const { fetchARecordInfo, data, loading } = useARecordInfo();
 * const result = await fetchARecordInfo(5);
 * // Returns: { aRecords: [...], ipReuseInfo: [...] }
 */
export function useARecordInfo() {
  const [executeARecordInfo, { data, loading, error }] = useLazyGraphQL<ARecordInfoData>(
    A_RECORD_INFO,
    {
      onCompleted: (result) => {
        // console.log('A Record Info completed:', result);
      },
      onError: (err) => {
        console.error('A Record Info error:', err);
      }
    }
  );

  /**
   * Fetch A record information by domain ID
   * @param domainId - The ID of the domain to fetch
   * @returns Promise with A records and IP reuse info or null
   */
  const fetchARecordInfo = async (domainId: number): Promise<ARecordInfoResult | null> => {
    try {
      const result = await executeARecordInfo({
        variables: { domainId }
      });
      
      // Return the unwrapped data
      return result.data?.aRecordInfo || null;
    } catch (err) {
      console.error('Error fetching A record info:', err);
      return null;
    }
  };

  return {
    fetchARecordInfo,
    data: data?.aRecordInfo || null, // Unwrapped data
    loading,
    error,
  };
}

/**
 * Direct function to fetch A record info without hook
 * 
 * @param domainId - The ID of the domain to fetch
 * @returns Promise with A record info or null
 */
export async function fetchARecordInfo(
  domainId: number,
  client: any // Apollo Client instance
): Promise<ARecordInfoResult | null> {
  try {
    const result = await client.query({
      query: A_RECORD_INFO,
      variables: { domainId },
    });
    
    return result.data?.aRecordInfo || null;
  } catch (err) {
    console.error('Error fetching A record info:', err);
    return null;
  }
}

/**
 * Sample processed data structure returned by this API:
 * 
 * {
 *   aRecords: [
 *     {
 *       id: 7,
 *       ipId: 24,
 *       ipAddress: "172.67.156.26",
 *       ttl: 300,
 *       lowestTtl: 300,
 *       highestTtl: 300,
 *       firstSeen: "2025-05-03T04:35:26+00:00",
 *       lastSeen: "2025-08-16T03:37:29.586382+00:00",
 *       lowestTtlTime: "2025-08-16T03:37:29.586382+00:00",
 *       country: "United States of America",
 *       asnAso: "AS13335 CloudFlare Inc.",
 *       latitudeLongitude: "37.774929, -122.419418",
 *       maliciousTypes: ["malicious"],
 *       maliciousSources: ["VirusTotal"]
 *     }
 *   ],
 *   ipReuseInfo: [
 *     {
 *       ipId: 24,
 *       ipAddress: "172.67.156.26",
 *       totalRelationWithOtherDomains: 3,
 *       totalRelationWithOtherNs: 0
 *     }
 *   ]
 * }
 */
