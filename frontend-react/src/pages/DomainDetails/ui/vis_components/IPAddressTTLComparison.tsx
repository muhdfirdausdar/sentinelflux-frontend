import { useEffect, useState } from 'react';
import { useARecordInfoData } from '../../data/aRecordInfoData';
import { TTLComparisonChart } from './TTLComparisonChart';

interface TTLData {
  ipId: number;
  ipAddress: string;
  ttl: number;
  lowestTtl: number;
  highestTtl: number;
}

/**
 * IP Address TTL Comparison Component
 * Extracts and displays TTL comparison data from A Records
 * Shows only: ipId, ipAddress, ttl, lowestTtl, highestTtl
 */
export function IPAddressTTLComparison() {
  const { getARecordInfo, isLoading, getError } = useARecordInfoData();
  const [ttlData, setTTLData] = useState<TTLData[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // Fetch A record data and extract TTL information
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLocalLoading(true);
      const data = await getARecordInfo();
      
      if (isMounted) {
        if (data && data.aRecords) {
          // Extract only TTL-related fields from aRecords
          const extractedData: TTLData[] = data.aRecords.map((record: any) => ({
            ipId: record.ipId,
            ipAddress: record.ipAddress,
            ttl: record.ttl,
            lowestTtl: record.lowestTtl,
            highestTtl: record.highestTtl,
          }));
          
          setTTLData(extractedData);
        }
        setLocalLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [getARecordInfo]);

  if (localLoading || isLoading()) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '300px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Loading TTL comparison data...
      </div>
    );
  }

  if (getError()) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '300px',
        color: '#f87171'
      }}>
        Error: {getError()}
      </div>
    );
  }

  if (!ttlData || ttlData.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '300px',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        No TTL data available
      </div>
    );
  }

  return <TTLComparisonChart data={ttlData} />;
}
