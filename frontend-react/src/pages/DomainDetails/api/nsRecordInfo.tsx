import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { NS_RECORD_INFO } from '@/constants/graphql';
import { NSRecordInfoData, NSRecordInfoResult } from '@/types/graphql';

/**
 * Custom hook for fetching NS Record Info
 * 
 * @example
 * const { fetchNSRecordInfo, data, loading } = useNSRecordInfo();
 * const result = await fetchNSRecordInfo(5);
 * // Returns: { nsRecords: [...], nsToIpsInfo: [...] }
 */
export function useNSRecordInfo() {
  const [executeNSRecordInfo, { data, loading, error }] = useLazyGraphQL<NSRecordInfoData>(
    NS_RECORD_INFO,
    {
      onCompleted: (result) => {
        // console.log('NS Record Info completed:', result);
      },
      onError: (err) => {
        console.error('NS Record Info error:', err);
      }
    }
  );

  /**
   * Fetch NS record information by domain ID
   * @param domainId - The ID of the domain to fetch
   * @returns Promise with NS records and NS-to-IP mappings or null
   */
  const fetchNSRecordInfo = async (domainId: number): Promise<NSRecordInfoResult | null> => {
    try {
      const result = await executeNSRecordInfo({
        variables: { domainId }
      });
      
      // Return the unwrapped data
      return result.data?.nsRecordInfo || null;
    } catch (err) {
      console.error('Error fetching NS record info:', err);
      return null;
    }
  };

  return {
    fetchNSRecordInfo,
    data: data?.nsRecordInfo || null, // Unwrapped data
    loading,
    error,
  };
}

/**
 * Direct function to fetch NS record info without hook
 * 
 * @param domainId - The ID of the domain to fetch
 * @returns Promise with NS record info or null
 */
export async function fetchNSRecordInfo(
  domainId: number,
  client: any // Apollo Client instance
): Promise<NSRecordInfoResult | null> {
  try {
    const result = await client.query({
      query: NS_RECORD_INFO,
      variables: { domainId },
    });
    
    return result.data?.nsRecordInfo || null;
  } catch (err) {
    console.error('Error fetching NS record info:', err);
    return null;
  }
}

/**
 * Sample processed data structure returned by this API:
 * 
 * {
 *   nsRecords: [
 *     {
 *       id: 10,
 *       nameserverId: 5,
 *       nameserver: "ns1.example.com",
 *       ttl: 3600,
 *       lowestTtl: 1800,
 *       firstSeen: "2025-05-03T04:35:26+00:00",
 *       lastSeen: "2025-08-16T03:37:29.586382+00:00",
 *       lowestTtlTime: "2025-06-15T10:20:30+00:00"
 *     }
 *   ],
 *   nsToIpsInfo: [
 *     {
 *       ipId: 24,
 *       ipAddress: "172.67.156.26",
 *       nsId: 5,
 *       nameserver: "ns1.example.com",
 *       ipNsTtl: 3600,
 *       ipNsLowestTtl: 1800,
 *       firstSeen: "2025-05-03T04:35:26+00:00",
 *       lastSeen: "2025-08-16T03:37:29.586382+00:00",
 *       ipNsLowestTtlTime: "2025-06-15T10:20:30+00:00",
 *       country: "United States of America",
 *       asnAso: "AS13335 CloudFlare Inc."
 *     }
 *   ]
 * }
 */
