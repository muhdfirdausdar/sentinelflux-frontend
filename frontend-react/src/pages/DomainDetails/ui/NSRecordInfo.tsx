import { useEffect, useState, useMemo } from 'react';
import { useNSRecordInfoData } from '../data/nsRecordInfoData';
import './NSRecordInfo.css';

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Sort configuration for NS Record table
 */
type NSRecordSortConfig = {
  column: 'nameserver' | 'ttl' | 'lowestTtl' | 'firstSeen' | 'lastSeen' | 'lowestTtlTime' | null;
  direction: SortDirection;
};

/**
 * Sort configuration for NS to IPs table
 */
type NSToIPsSortConfig = {
  column: 'ipAddress' | 'nameserver' | 'ipNsTtl' | 'ipNsLowestTtl' | 'firstSeen' | 'lastSeen' | 'ipNsLowestTtlTime' | 'country' | 'asnAso' | null;
  direction: SortDirection;
};

/**
 * NS Record Info Component
 * Displays NS Records and NS to IPs information in two tables
 */
export function NSRecordInfo() {
  const { getNSRecordInfo, isLoading, getError } = useNSRecordInfoData();
  const [nsRecordData, setNSRecordData] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Sort states
  const [nsRecordSort, setNSRecordSort] = useState<NSRecordSortConfig>({ column: null, direction: null });
  const [nsToIPsSort, setNSToIPsSort] = useState<NSToIPsSortConfig>({ column: null, direction: null });
  
  // Show all toggles for each table
  const [showAllNSRecords, setShowAllNSRecords] = useState(false);
  const [showAllNSToIPs, setShowAllNSToIPs] = useState(false);
  
  const RECORDS_LIMIT = 15;

  // Fetch NS record data when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLocalLoading(true);
      const data = await getNSRecordInfo();
      
      if (isMounted) {
        if (data) {
          setNSRecordData(data);
        }
        setLocalLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [getNSRecordInfo]);

  // Manual refresh function
  const handleRefresh = async () => {
    setLocalLoading(true);
    setNSRecordData(null);
    const data = await getNSRecordInfo();
    if (data) {
      setNSRecordData(data);
    }
    setLocalLoading(false);
  };
  
  // Handle sorting for NS Record table
  const handleNSRecordSort = (column: NSRecordSortConfig['column']) => {
    setNSRecordSort(prev => {
      if (prev.column === column) {
        // Toggle through: asc -> desc -> null
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };
  
  // Handle sorting for NS to IPs table
  const handleNSToIPsSort = (column: NSToIPsSortConfig['column']) => {
    setNSToIPsSort(prev => {
      if (prev.column === column) {
        // Toggle through: asc -> desc -> null
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };
  
  // Sort NS Records based on current sort configuration
  const sortedNSRecords = useMemo(() => {
    if (!nsRecordData?.nsRecords || !nsRecordSort.column || !nsRecordSort.direction) {
      return nsRecordData?.nsRecords || [];
    }
    
    const sorted = [...nsRecordData.nsRecords].sort((a, b) => {
      const column = nsRecordSort.column!;
      let aVal = a[column];
      let bVal = b[column];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined || aVal === 'N/A') return 1;
      if (bVal === null || bVal === undefined || bVal === 'N/A') return -1;
      
      // Convert to numbers if possible
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return nsRecordSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (nsRecordSort.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });
    
    return sorted;
  }, [nsRecordData, nsRecordSort]);
  
  // Sort NS to IPs Info based on current sort configuration
  const sortedNSToIPsInfo = useMemo(() => {
    if (!nsRecordData?.nsToIpsInfo || !nsToIPsSort.column || !nsToIPsSort.direction) {
      return nsRecordData?.nsToIpsInfo || [];
    }
    
    const sorted = [...nsRecordData.nsToIpsInfo].sort((a, b) => {
      const column = nsToIPsSort.column!;
      let aVal = a[column];
      let bVal = b[column];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined || aVal === 'N/A') return 1;
      if (bVal === null || bVal === undefined || bVal === 'N/A') return -1;
      
      // Convert to numbers if possible
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return nsToIPsSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (nsToIPsSort.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });
    
    return sorted;
  }, [nsRecordData, nsToIPsSort]);
  
  // Get sort indicator for display
  const getSortIndicator = (column: string, currentSort: { column: string | null, direction: SortDirection }) => {
    if (currentSort.column !== column) return ' ↑↓';
    if (currentSort.direction === 'asc') return ' ↑';
    if (currentSort.direction === 'desc') return ' ↓';
    return ' ↑↓';
  };

  if (localLoading || isLoading()) {
    return (
      <div className="nsrecord-loading">
        <p>Loading NS Record information...</p>
      </div>
    );
  }

  if (getError()) {
    return (
      <div className="nsrecord-error">
        <p>Error: {getError()}</p>
        <button className="nsrecord-retry-button" onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  if (!nsRecordData || !nsRecordData.nsRecords || nsRecordData.nsRecords.length === 0) {
    return (
      <div className="nsrecord-empty">
        <p>No NS Record data available</p>
        <button className="nsrecord-retry-button" onClick={handleRefresh}>Load NS Records</button>
      </div>
    );
  }

  return (
    <div className="nsrecord-container">
      <button className="nsrecord-refresh-button" onClick={handleRefresh}>
        Refresh NS Records
      </button>

      {/* NS Record Table */}
      <div className="nsrecord-table-section">
        <h3 className="nsrecord-table-header">
          NS Record Table
          {sortedNSRecords.length > RECORDS_LIMIT && (
            <span className="nsrecord-record-count"> ({sortedNSRecords.length} records)</span>
          )}
        </h3>
        
        <div className="nsrecord-table-content">
          <table className="nsrecord-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleNSRecordSort('nameserver')}>
                  Nameserver{getSortIndicator('nameserver', nsRecordSort)}
                </th>
                <th className="sortable" onClick={() => handleNSRecordSort('ttl')}>
                  TTL{getSortIndicator('ttl', nsRecordSort)}
                </th>
                <th className="sortable" onClick={() => handleNSRecordSort('lowestTtl')}>
                  Lowest TTL{getSortIndicator('lowestTtl', nsRecordSort)}
                </th>
                <th className="sortable" onClick={() => handleNSRecordSort('firstSeen')}>
                  First Seen{getSortIndicator('firstSeen', nsRecordSort)}
                </th>
                <th className="sortable" onClick={() => handleNSRecordSort('lastSeen')}>
                  Last Seen{getSortIndicator('lastSeen', nsRecordSort)}
                </th>
                <th className="sortable" onClick={() => handleNSRecordSort('lowestTtlTime')}>
                  Lowest TTL Time{getSortIndicator('lowestTtlTime', nsRecordSort)}
                </th>
              </tr>
            </thead>
            <tbody>
              {(showAllNSRecords ? sortedNSRecords : sortedNSRecords.slice(0, RECORDS_LIMIT)).map((record: any, index: number) => (
                <tr key={record.id || index}>
                  <td>{record.nameserver}</td>
                  <td>{record.ttl}</td>
                  <td>{record.lowestTtl}</td>
                  <td>{record.firstSeen || 'N/A'}</td>
                  <td>{record.lastSeen || 'N/A'}</td>
                  <td>{record.lowestTtlTime || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedNSRecords.length > RECORDS_LIMIT && (
          <button 
            className="nsrecord-show-all-button" 
            onClick={() => setShowAllNSRecords(!showAllNSRecords)}
          >
            {showAllNSRecords ? 'Show Less' : `Show All (${sortedNSRecords.length} records)`}
          </button>
        )}
      </div>

      {/* NS to IPs Details Table */}
      <div className="nsrecord-table-section">
        <h3 className="nsrecord-table-header">
          NS to IPs Details Table
          {sortedNSToIPsInfo.length > RECORDS_LIMIT && (
            <span className="nsrecord-record-count"> ({sortedNSToIPsInfo.length} records)</span>
          )}
        </h3>
        
        <div className="nsrecord-table-content">
          <table className="nsrecord-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleNSToIPsSort('ipAddress')}>
                  IP Address{getSortIndicator('ipAddress', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('nameserver')}>
                  Nameserver{getSortIndicator('nameserver', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('ipNsTtl')}>
                  TTL{getSortIndicator('ipNsTtl', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('ipNsLowestTtl')}>
                  Lowest TTL{getSortIndicator('ipNsLowestTtl', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('firstSeen')}>
                  First Seen{getSortIndicator('firstSeen', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('lastSeen')}>
                  Last Seen{getSortIndicator('lastSeen', nsToIPsSort)}
                </th>
                <th className="sortable" onClick={() => handleNSToIPsSort('ipNsLowestTtlTime')}>
                  Lowest TTL Time{getSortIndicator('ipNsLowestTtlTime', nsToIPsSort)}
                </th>
                <th>Country</th>
                <th>ASN ASO</th>
              </tr>
            </thead>
            <tbody>
              {(showAllNSToIPs ? sortedNSToIPsInfo : sortedNSToIPsInfo.slice(0, RECORDS_LIMIT)).map((info: any, index: number) => (
                <tr key={info.id || index}>
                  <td>{info.ipAddress}</td>
                  <td>{info.nameserver}</td>
                  <td>{info.ipNsTtl}</td>
                  <td>{info.ipNsLowestTtl}</td>
                  <td>{info.firstSeen || 'N/A'}</td>
                  <td>{info.lastSeen || 'N/A'}</td>
                  <td>{info.ipNsLowestTtlTime || 'N/A'}</td>
                  <td>{info.country || 'N/A'}</td>
                  <td>{info.asnAso || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedNSToIPsInfo.length > RECORDS_LIMIT && (
          <button 
            className="nsrecord-show-all-button" 
            onClick={() => setShowAllNSToIPs(!showAllNSToIPs)}
          >
            {showAllNSToIPs ? 'Show Less' : `Show All (${sortedNSToIPsInfo.length} records)`}
          </button>
        )}
      </div>
    </div>
  );
}
