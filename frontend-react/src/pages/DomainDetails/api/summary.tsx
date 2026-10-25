import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { DOMAIN_DETAILS_SUMMARY } from '@/constants/graphql';
import { DomainDetailsSummaryData, DomainDetailsSummary } from '@/types/graphql';

/**
 * Custom hook for fetching Domain Details Summary
 * 
 * @example
 * const { fetchSummary, data, loading } = useDomainSummary();
 * const summary = await fetchSummary(5);
 * console.log(summary?.domainName); // "example.com"
 */
export function useDomainSummary() {
  const [executeSummary, { data, loading, error }] = useLazyGraphQL<DomainDetailsSummaryData>(
    DOMAIN_DETAILS_SUMMARY,
    {
      onCompleted: (result) => {
        if (result?.domDetailsSummary) {
          // console.log('✅ Domain summary loaded successfully');
        }
      },
      onError: (err: any) => {
        // Ignore abort errors in development (React Strict Mode)
        if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
          console.error('❌ Domain summary error:', err);
        }
      }
    }
  );

  /**
   * Fetch domain summary by domain ID
   * @param domainId - The ID of the domain to fetch
   * @returns Promise with the domain summary data or null
   */
  const fetchSummary = async (domainId: number): Promise<DomainDetailsSummary | null> => {
    try {
      const result = await executeSummary({
        variables: { domainId }
      });
      
      // Return the unwrapped data (remove outer bracket)
      return result.data?.domDetailsSummary || null;
    } catch (err: any) {
      // Ignore abort errors (caused by React Strict Mode in development or duplicate requests)
      if (err?.name === 'AbortError' || err?.message?.includes('aborted') || err?.message?.includes('cancel')) {
        // console.log('Query aborted (likely React Strict Mode or duplicate request), ignoring...');
        return null;
      }
      
      // Log other errors but don't throw - let caller handle null return
      console.warn('⚠️ Error fetching domain summary:', err?.message || err);
      return null;
    }
  };

  return {
    fetchSummary,
    data: data?.domDetailsSummary || null, // Unwrapped data
    loading,
    error,
  };
}

/**
 * Direct function to fetch domain summary without hook
 * Useful for one-time fetches or outside React components
 * 
 * Note: This requires the GraphQL client to be configured in your app
 * 
 * @param domainId - The ID of the domain to fetch
 * @returns Promise with the domain summary data or null
 */
export async function fetchDomainSummary(
  domainId: number,
  client: any // Apollo Client instance
): Promise<DomainDetailsSummary | null> {
  try {
    const result = await client.query({
      query: DOMAIN_DETAILS_SUMMARY,
      variables: { domainId },
    });
    
    // Return the unwrapped data
    return result.data?.domDetailsSummary || null;
  } catch (err) {
    console.error('Error fetching domain summary:', err);
    return null;
  }
}

/**
 * Sample processed data structure returned by this API:
 * 
 * {
 *   id: 5,
 *   domainName: "cpcontacts.textcentrzdmnewz.xyz",
 *   domainStatus: "INACTIVE",
 *   sourceDomain: "ThreatFox",
 *   isFastFlux: false,
 *   fluxType: "UNKNOWN",
 *   domFirstSeen: "2025-05-03T04:35:26+00:00",
 *   domLastSeen: "2025-08-28T13:24:45.579354+00:00",
 *   isMalicious: true,
 *   sourceMalicious: "VirusTotal",
 *   maliciousType: ["malicious"],
 *   lastMalUpdated: "2025-05-03T17:40:43+00:00",
 *   totalARecords: 2,
 *   totalNsRecords: 2,
 *   totalNsIps: 6,
 *   aChangeFrequencyPerWeek: 0,
 *   nsChangeFrequencyPerWeek: 0
 * }
 */
