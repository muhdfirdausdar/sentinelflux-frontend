import { useEffect, useState } from 'react';
import { useARecordInfoData } from '../data/aRecordInfoData';
import { useARecordAddonData } from '../data/aRecordAddonData';
import './ARecordInfo.css';

/**
 * Relation tab type for the addon section
 */
type RelationTab = 'domain' | 'nameserver';

/**
 * A Record Info Component
 * Displays A Records and IP Reuse information in two tables
 * Shows related domains/nameservers when an IP is selected
 */
export function ARecordInfo() {
  const { getARecordInfo, isLoading, getError } = useARecordInfoData();
  const { getARecordAddon, isLoading: isAddonLoading, getError: getAddonError } = useARecordAddonData();
  
  const [aRecordData, setARecordData] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedIpId, setSelectedIpId] = useState<number | null>(null);
  const [addonData, setAddonData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<RelationTab>('domain');
  
  // Show all toggles for each table
  const [showAllARecords, setShowAllARecords] = useState(false);
  const [showAllIPReuse, setShowAllIPReuse] = useState(false);
  const [showAllRelatedDomain, setShowAllRelatedDomain] = useState(false);
  const [showAllRelatedNameserver, setShowAllRelatedNameserver] = useState(false);
  
  const RECORDS_LIMIT = 15;

  // Fetch A record data when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLocalLoading(true);
      const data = await getARecordInfo();
      
      if (isMounted) {
        if (data) {
          setARecordData(data);
        }
        setLocalLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [getARecordInfo]);

  // Manual refresh function
  const handleRefresh = async () => {
    setLocalLoading(true);
    setARecordData(null);
    const data = await getARecordInfo();
    if (data) {
      setARecordData(data);
    }
    setLocalLoading(false);
  };

  // Handle select button click
  const handleSelectIp = async (ipId: number) => {
    // If same IP is clicked, deselect it
    if (selectedIpId === ipId) {
      setSelectedIpId(null);
      setAddonData(null);
      return;
    }

    setSelectedIpId(ipId);
    setActiveTab('domain'); // Reset to domain tab
    // console.log('Selected IP ID:', ipId);
    
    // Fetch addon data for this IP
    const addon = await getARecordAddon(ipId);
    if (addon) {
      setAddonData(addon);
      // console.log('Addon data loaded:', addon);
    } else {
      console.error('Failed to load addon data for IP:', ipId);
    }
  };

  if (localLoading || isLoading()) {
    return (
      <div className="arecord-loading">
        <p>Loading A Record information...</p>
      </div>
    );
  }

  if (getError()) {
    return (
      <div className="arecord-error">
        <p>Error: {getError()}</p>
        <button className="arecord-retry-button" onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  if (!aRecordData || !aRecordData.aRecords || aRecordData.aRecords.length === 0) {
    return (
      <div className="arecord-empty">
        <p>No A Record data available</p>
        <button className="arecord-retry-button" onClick={handleRefresh}>Load A Records</button>
      </div>
    );
  }

  return (
    <div className="arecord-container">
      <button className="arecord-refresh-button" onClick={handleRefresh}>
        Refresh A Records
      </button>

      {/* A Record Table */}
      <div className="arecord-table-section">
        <h3 className="arecord-table-header">
          A Record Table
          {aRecordData.aRecords.length > RECORDS_LIMIT && (
            <span className="arecord-record-count"> ({aRecordData.aRecords.length} records)</span>
          )}
        </h3>
        
        <div className="arecord-table-content">
          <table className="arecord-table">
            <thead>
              <tr>
                <th>IP Address ↑↓</th>
                <th>TTL ↑↓</th>
                <th>Lowest TTL ↑↓</th>
                <th>First Seen ↑↓</th>
                <th>Last Seen ↑↓</th>
                <th>Lowest TTL Time ↑↓</th>
                <th>Country ↑↓</th>
                <th>ASN ASO ↑↓</th>
                <th>Geo Coordinates ↑↓</th>
              </tr>
            </thead>
            <tbody>
              {(showAllARecords ? aRecordData.aRecords : aRecordData.aRecords.slice(0, RECORDS_LIMIT)).map((record: any, index: number) => (
                <tr key={record.id || index}>
                  <td>{record.ipAddress}</td>
                  <td>{record.ttl}</td>
                  <td>{record.lowestTtl}</td>
                  <td>{record.firstSeen || 'N/A'}</td>
                  <td>{record.lastSeen || 'N/A'}</td>
                  <td>{record.lowestTtlTime || 'N/A'}</td>
                  <td>{record.country || 'N/A'}</td>
                  <td>{record.asnAso || 'N/A'}</td>
                  <td>{record.latitudeLongitude || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {aRecordData.aRecords.length > RECORDS_LIMIT && (
          <button 
            className="arecord-show-all-button" 
            onClick={() => setShowAllARecords(!showAllARecords)}
          >
            {showAllARecords ? 'Show Less' : `Show All (${aRecordData.aRecords.length} records)`}
          </button>
        )}
      </div>

      {/* IP Reuse Details Table */}
      <div className="arecord-table-section">
        <h3 className="arecord-table-header">
          IP Reuse Details
          {aRecordData.ipReuseInfo.length > RECORDS_LIMIT && (
            <span className="arecord-record-count"> ({aRecordData.ipReuseInfo.length} records)</span>
          )}
        </h3>
        
        <div className="arecord-table-content">
          <table className="arecord-table">
            <thead>
              <tr>
                <th>IP Address ↑↓</th>
                <th>Total Relation with Other Domain ↑↓</th>
                <th>Total Relation with Nameserver ↑↓</th>
                <th>Oldest Seen ↑↓</th>
                <th>Latest Seen ↑↓</th>
                <th>Show Relation</th>
              </tr>
            </thead>
            <tbody>
              {(showAllIPReuse ? aRecordData.ipReuseInfo : aRecordData.ipReuseInfo.slice(0, RECORDS_LIMIT)).map((info: any, index: number) => {
                // Find matching A record to get first/last seen dates
                const matchingRecord = aRecordData.aRecords.find((r: any) => r.ipId === info.ipId);
                const isSelected = selectedIpId === info.ipId;
                
                return (
                  <tr key={info.ipId || index}>
                    <td>{info.ipAddress}</td>
                    <td>{info.totalRelationWithOtherDomains}</td>
                    <td>{info.totalRelationWithOtherNs}</td>
                    <td>{matchingRecord?.firstSeen || 'N/A'}</td>
                    <td>{matchingRecord?.lastSeen || 'N/A'}</td>
                    <td>
                      <button
                        className={`arecord-select-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectIp(info.ipId)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {aRecordData.ipReuseInfo.length > RECORDS_LIMIT && (
          <button 
            className="arecord-show-all-button" 
            onClick={() => setShowAllIPReuse(!showAllIPReuse)}
          >
            {showAllIPReuse ? 'Show Less' : `Show All (${aRecordData.ipReuseInfo.length} records)`}
          </button>
        )}
      </div>

      {/* Related Data Section - Shows when an IP is selected */}
      {selectedIpId && (
        <div className="arecord-related-section">
          {/* Tab Navigation */}
          <div className="arecord-tab-navigation">
            <button
              className={`arecord-tab-button ${activeTab === 'domain' ? 'active' : ''}`}
              onClick={() => setActiveTab('domain')}
            >
              Related Domain
            </button>

            <button
              className={`arecord-tab-button ${activeTab === 'nameserver' ? 'active' : ''}`}
              onClick={() => setActiveTab('nameserver')}
            >
              Related Nameserver
            </button>
          </div>

          {/* Loading State */}
          {isAddonLoading() && (
            <div className="arecord-related-loading">
              <p>Loading related data...</p>
            </div>
          )}

          {/* Error State */}
          {getAddonError() && !addonData && (
            <div className="arecord-related-error">
              <p>Error loading related data: {getAddonError()}</p>
            </div>
          )}

          {/* Related Domain Table */}
          {activeTab === 'domain' && addonData && (
            <div className="arecord-related-content">
              <h4 className="arecord-related-title">
                [IP : {aRecordData.ipReuseInfo.find((i: any) => i.ipId === selectedIpId)?.ipAddress}] Related Domain
                {addonData.relatedDomain && addonData.relatedDomain.length > RECORDS_LIMIT && (
                  <span className="arecord-record-count"> ({addonData.relatedDomain.length} records)</span>
                )}
              </h4>
              
              {addonData.relatedDomain && addonData.relatedDomain.length > 0 ? (
                <>
                  <div className="arecord-table-content">
                    <table className="arecord-table">
                      <thead>
                        <tr>
                          <th>Domain Name ↑↓</th>
                          <th>Fast Flux? ↑↓</th>
                          <th>Malicious? ↑↓</th>
                          <th>First Seen ↑↓</th>
                          <th>Last Seen ↑↓</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllRelatedDomain ? addonData.relatedDomain : addonData.relatedDomain.slice(0, RECORDS_LIMIT)).map((domain: any, index: number) => (
                          <tr key={domain.domainId || index}>
                            <td>{domain.domainName}</td>
                          <td>{domain.fluxType || 'No'}</td>
                          <td>{domain.isMalicious ? 'Yes' : 'No'}</td>
                          <td>{domain.firstSeen || 'N/A'}</td>
                          <td>{domain.lastSeen || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {addonData.relatedDomain.length > RECORDS_LIMIT && (
                  <button 
                    className="arecord-show-all-button" 
                    onClick={() => setShowAllRelatedDomain(!showAllRelatedDomain)}
                  >
                    {showAllRelatedDomain ? 'Show Less' : `Show All (${addonData.relatedDomain.length} records)`}
                  </button>
                )}
              </>
              ) : (
                <p className="arecord-related-empty">No related domains found</p>
              )}
            </div>
          )}

          {/* Related Nameserver Table */}
          {activeTab === 'nameserver' && addonData && (
            <div className="arecord-related-content">
              <h4 className="arecord-related-title">
                [IP : {aRecordData.ipReuseInfo.find((i: any) => i.ipId === selectedIpId)?.ipAddress}] Related Nameserver
                {addonData.relatedNameserver && addonData.relatedNameserver.length > RECORDS_LIMIT && (
                  <span className="arecord-record-count"> ({addonData.relatedNameserver.length} records)</span>
                )}
              </h4>
              
              {addonData.relatedNameserver && addonData.relatedNameserver.length > 0 ? (
                <>
                  <div className="arecord-table-content">
                    <table className="arecord-table">
                      <thead>
                        <tr>
                          <th>Nameserver ↑↓</th>
                          <th>Lowest TTL ↑↓</th>
                          <th>Latest TTL ↑↓</th>
                          <th>First Seen ↑↓</th>
                          <th>Last Seen ↑↓</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllRelatedNameserver ? addonData.relatedNameserver : addonData.relatedNameserver.slice(0, RECORDS_LIMIT)).map((ns: any, index: number) => (
                          <tr key={ns.nameserverId || index}>
                            <td>{ns.nameserverName || 'N/A'}</td>
                            <td>{ns.lowestTtl || 'N/A'}</td>
                            <td>{ns.latestTtl || 'N/A'}</td>
                            <td>{ns.firstSeen || 'N/A'}</td>
                            <td>{ns.lastSeen || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {addonData.relatedNameserver.length > RECORDS_LIMIT && (
                    <button 
                      className="arecord-show-all-button" 
                      onClick={() => setShowAllRelatedNameserver(!showAllRelatedNameserver)}
                    >
                      {showAllRelatedNameserver ? 'Show Less' : `Show All (${addonData.relatedNameserver.length} records)`}
                    </button>
                  )}
                </>
              ) : (
                <p className="arecord-related-empty">No related nameservers found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
