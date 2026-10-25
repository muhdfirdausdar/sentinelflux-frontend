import { useEffect, useState } from 'react';
import { useSummaryData } from '../../data/summaryData';
import { useARecordInfoData } from '../../data/aRecordInfoData';
import { useNSRecordInfoData } from '../../data/nsRecordInfoData';

/**
 * Complete Domain Data Component
 * Combines data from Summary, A Records, and NS Records
 * Shows comprehensive domain information in one structure
 */
export function CompleteDomainData() {
  const { getSummary, isLoading: isSummaryLoading, getError: getSummaryError } = useSummaryData();
  const { getARecordInfo, isLoading: isARecordLoading, getError: getARecordError } = useARecordInfoData();
  const { getNSRecordInfo, isLoading: isNSRecordLoading, getError: getNSRecordError } = useNSRecordInfoData();
  
  const [combinedData, setCombinedData] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Fetch all data and combine
  useEffect(() => {
    let isMounted = true;
    
    const fetchAllData = async () => {
      setLocalLoading(true);
      
      try {
        // Fetch all data in parallel
        const [summaryData, aRecordData, nsRecordData] = await Promise.all([
          getSummary(),
          getARecordInfo(),
          getNSRecordInfo()
        ]);

        if (isMounted && summaryData && aRecordData && nsRecordData) {
          // Process A Record Info - remove unwanted fields
          const processedARecordInfo = [{
            aRecords: aRecordData.aRecords.map((record: any) => ({
              id: record.id,
              ipId: record.ipId,
              ipAddress: record.ipAddress,
              ttl: record.ttl,
              lowestTtl: record.lowestTtl,
              highestTtl: record.highestTtl,
              firstSeen: record.firstSeen,
              lastSeen: record.lastSeen,
              lowestTtlTime: record.lowestTtlTime,
              country: record.country,
              asnAso: record.asnAso,
              // Removed: maliciousTypes, maliciousSources, latitudeLongitude
            })),
            ipReuseInfo: aRecordData.ipReuseInfo
            // No addon data
          }];

          // Process NS Record Info - remove unwanted fields from nsToIpsInfo
          const processedNSRecordInfo = [{
            nsRecords: nsRecordData.nsRecords,
            nsToIpsInfo: nsRecordData.nsToIpsInfo.map((info: any) => ({
              ipId: info.ipId,
              ipAddress: info.ipAddress,
              nsId: info.nsId,
              nameserver: info.nameserver,
              ipNsTtl: info.ipNsTtl,
              ipNsLowestTtl: info.ipNsLowestTtl,
              firstSeen: info.firstSeen,
              lastSeen: info.lastSeen,
              ipNsLowestTtlTime: info.ipNsLowestTtlTime,
              // Removed: country, asnAso
            }))
          }];

          // Combine all data into one structure
          const combined = {
            id: summaryData.id,
            domainName: summaryData.domainName,
            domainStatus: summaryData.domainStatus,
            sourceDomain: summaryData.sourceDomain,
            isFastFlux: summaryData.isFastFlux,
            fluxType: summaryData.fluxType,
            domFirstSeen: summaryData.domFirstSeen,
            domLastSeen: summaryData.domLastSeen,
            isMalicious: summaryData.isMalicious,
            sourceMalicious: summaryData.sourceMalicious,
            maliciousType: summaryData.maliciousType,
            lastMalUpdated: summaryData.lastMalUpdated,
            aChangeFrequencyPerWeek: summaryData.aChangeFrequencyPerWeek,
            nsChangeFrequencyPerWeek: summaryData.nsChangeFrequencyPerWeek,
            totalARecords: summaryData.totalARecords,
            totalNsRecords: summaryData.totalNsRecords,
            totalNsIps: summaryData.totalNsIps,
            aRecordInfo: processedARecordInfo,
            nsRecordInfo: processedNSRecordInfo
          };

          setCombinedData(combined);
        }
        
        setLocalLoading(false);
      } catch (error) {
        console.error('Error fetching combined data:', error);
        setLocalLoading(false);
      }
    };
    
    fetchAllData();
    
    return () => {
      isMounted = false;
    };
  }, [getSummary, getARecordInfo, getNSRecordInfo]);

  if (localLoading || isSummaryLoading() || isARecordLoading() || isNSRecordLoading()) {
    return <div>Loading...</div>;
  }

  if (getSummaryError() || getARecordError() || getNSRecordError()) {
    return <div>Error: {getSummaryError() || getARecordError() || getNSRecordError()}</div>;
  }

  if (!combinedData) {
    return <div>No data</div>;
  }

  // Return raw JSON data
  return (
    <div>
      <pre>{JSON.stringify(combinedData, null, 2)}</pre>
    </div>
  );
}
