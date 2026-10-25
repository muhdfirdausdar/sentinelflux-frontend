import { useEffect, useState } from 'react';
import { useSummaryData } from '../data/summaryData';
import './summary.css';

/**
 * Summary Info Component
 * Displays domain summary information in a simple layout
 */
export function SummaryInfo() {
  const { getSummary, isLoading, getError } = useSummaryData();
  const [summary, setSummary] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Fetch summary data when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLocalLoading(true);
      const data = await getSummary();
      
      // Only update state if component is still mounted
      if (isMounted) {
        if (data) {
          setSummary(data);
        }
        setLocalLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [getSummary]);

  // Manual refresh function
  const handleRefresh = async () => {
    setLocalLoading(true);
    setSummary(null); // Clear current data to show fresh loading
    const data = await getSummary();
    if (data) {
      setSummary(data);
    }
    setLocalLoading(false);
  };

  if (localLoading || isLoading()) {
    return (
      <div className="summary-loading">
        <p>Loading summary...</p>
      </div>
    );
  }

  if (getError()) {
    return (
      <div className="summary-error">
        <p className="summary-error-text">Error: {getError()}</p>
        <button className="summary-retry-button" onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-empty">
        <p>No summary data available</p>
        <button className="summary-retry-button" onClick={handleRefresh}>Load Summary</button>
      </div>
    );
  }

  return (
    <div className="summary-container">
      <button className="summary-refresh-button" onClick={handleRefresh}>
        Refresh Summary
      </button>

      {/* Basic Information Section */}
      <div className="summary-section">
        <h3 className="summary-section-header">
          Basic Information
        </h3>
        
        <div className="summary-section-content">
          <div className="summary-info-grid">
            <div className="summary-info-label">Domain Name:</div>
            <div className="summary-info-value">{summary.domainName || 'N/A'}</div>

            <div className="summary-info-label">Domain Status:</div>
            <div className="summary-info-value">{summary.domainStatus || 'N/A'}</div>

            <div className="summary-info-label">Source Domain:</div>
            <div className="summary-info-value">{summary.sourceDomain || 'N/A'}</div>

            <div className="summary-info-label">Is Fast Flux:</div>
            <div className="summary-info-value">{summary.isFastFlux ? 'Yes' : 'No'}</div>

            <div className="summary-info-label">Type Fast Flux:</div>
            <div className="summary-info-value">{summary.fluxType || 'N/A'}</div>

            <div className="summary-info-label">First Seen:</div>
            <div className="summary-info-value">{summary.domFirstSeen || 'N/A'}</div>

            <div className="summary-info-label">Last Seen:</div>
            <div className="summary-info-value">{summary.domLastSeen || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Malicious Information Section */}
      <div className="summary-section">
        <h3 className="summary-section-header">
          Malicious Information
        </h3>
        
        <div className="summary-section-content">
          <div className="summary-info-grid">
            <div className="summary-info-label">Is Malicious Domain:</div>
            <div className="summary-info-value">{summary.isMalicious ? 'Yes' : 'No'}</div>

            <div className="summary-info-label">Source(s):</div>
            <div className="summary-info-value">{summary.sourceMalicious || 'N/A'}</div>

            <div className="summary-info-label">Type(s):</div>
            <div className="summary-info-value">{summary.maliciousType?.join(', ') || 'N/A'}</div>

            <div className="summary-info-label">Detected Period:</div>
            <div className="summary-info-value">{summary.lastMalUpdated || 'N/A'}</div>

            <div className="summary-info-label">Last Updated:</div>
            <div className="summary-info-value">{summary.lastMalUpdated || 'N/A'}</div>
          </div>
          
          {/* VirusTotal Button */}
          <div className="summary-virustotal-container">
            <a 
              href={`https://www.virustotal.com/gui/domain/${summary.domainName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="summary-virustotal-button"
            >
              View on VirusTotal
            </a>
          </div>
        </div>
      </div>

      {/* DNS Record Summary Section */}
      <div className="summary-section">
        <h3 className="summary-section-header">
          DNS Record Summary
        </h3>
        
        <div className="summary-section-content">
          <div className="summary-info-grid">
            <div className="summary-info-label">Total A Records:</div>
            <div className="summary-info-value">{summary.totalARecords || 0}</div>

            <div className="summary-info-label">Total NS Records:</div>
            <div className="summary-info-value">{summary.totalNsRecords || 0}</div>

            <div className="summary-info-label">NS IPs Total:</div>
            <div className="summary-info-value">{summary.totalNsIps || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
