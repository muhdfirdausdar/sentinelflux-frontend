
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DomainDataProvider, useDomainData } from './data/varData';
import { SummaryDataProvider, useSummaryData } from './data/summaryData';
import { ARecordInfoDataProvider, useARecordInfoData } from './data/aRecordInfoData';
import { ARecordAddonDataProvider } from './data/aRecordAddonData';
import { NSRecordInfoDataProvider, useNSRecordInfoData } from './data/nsRecordInfoData';
import { IPHoppingVisualizationDataProvider } from './data/ipHoppingVisualizationData';
import { SummaryInfo } from './ui/SummaryInfo';
import { ARecordInfo } from './ui/ARecordInfo';
import { NSRecordInfo } from './ui/NSRecordInfo';
import { Visualization } from './ui/Visualization';
import { exportAsCSV, exportAsJSON } from '@/utils/exportData';
import './DomainDetails.css';

/**
 * View options for domain details tabs
 */
type ViewType = 'summary' | 'arecord' | 'nsrecord' | 'visualization';

/**
 * Inner component that uses the domain data context
 */
const DomainDetailsContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { getDomainId, setDomainId } = useDomainData();
  const { getSummary } = useSummaryData();
  const { getARecordInfo } = useARecordInfoData();
  const { getNSRecordInfo } = useNSRecordInfoData();
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('summary');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Check for dom_id query parameter
    const domIdParam = searchParams.get('dom_id');
    
    if (domIdParam) {
      const domainId = parseInt(domIdParam, 10);
      
      if (!isNaN(domainId)) {
        // Store the domain ID in varData
        setDomainId(domainId);
        // console.log('✅ Domain ID loaded from URL:', domainId);
      } else {
        console.warn('⚠️ Invalid dom_id parameter - must be a number:', domIdParam);
      }
    } else {
      console.warn('⚠️ No dom_id parameter in URL - add ?dom_id=<number> to the URL');
    }
    
    setIsLoading(false);
  }, [searchParams, setDomainId]);

  // Get current domain ID from varData
  const currentDomainId = getDomainId();

  /**
   * Handle CSV export
   */
  const handleExportCSV = async () => {
    if (!currentDomainId) {
      alert('No domain ID available for export');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all data
      const [summary, aRecordInfo, nsRecordInfo] = await Promise.all([
        getSummary(currentDomainId),
        getARecordInfo(currentDomainId),
        getNSRecordInfo(currentDomainId)
      ]);

      const domainName = summary?.domainName || `domain_${currentDomainId}`;

      // Export as CSV
      exportAsCSV({ summary, aRecordInfo, nsRecordInfo }, domainName);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data as CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle JSON export
   */
  const handleExportJSON = async () => {
    if (!currentDomainId) {
      alert('No domain ID available for export');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all data
      const [summary, aRecordInfo, nsRecordInfo] = await Promise.all([
        getSummary(currentDomainId),
        getARecordInfo(currentDomainId),
        getNSRecordInfo(currentDomainId)
      ]);

      const domainName = summary?.domainName || `domain_${currentDomainId}`;

      // Export as JSON
      exportAsJSON({ summary, aRecordInfo, nsRecordInfo }, domainName);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export data as JSON. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="domain-loading">
        <h1>Domain Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentDomainId) {
    return (
      <div className="domain-error">
        <h1>Domain Details</h1>
        <div>
          <p className="domain-error-message">
            ⚠️ No domain ID provided
          </p>
          <p className="domain-error-instructions">
            Please add a domain ID to the URL. Example:
          </p>
          <code className="domain-error-code">
            /domain-details?dom_id=1
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-details-page">
      {/* Tab Navigation */}
      <div className="domain-tabs-container">
        <div className="domain-tabs">
          <button
            className={`domain-tab ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView('summary')}
          >
            Summary
          </button>

          <button
            className={`domain-tab ${activeView === 'arecord' ? 'active' : ''}`}
            onClick={() => setActiveView('arecord')}
          >
            A Record Info
          </button>

          <button
            className={`domain-tab ${activeView === 'nsrecord' ? 'active' : ''}`}
            onClick={() => setActiveView('nsrecord')}
          >
            NS  Record Info
          </button>

          <button
            className={`domain-tab ${activeView === 'visualization' ? 'active' : ''}`}
            onClick={() => setActiveView('visualization')}
          >
            Visualisation
          </button>
        </div>

        <div className="domain-export-section">
          <span className="domain-export-label">Export as:</span>
          <button 
            className="domain-export-button" 
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'CSV'}
          </button>
          <button 
            className="domain-export-button" 
            onClick={handleExportJSON}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'JSON'}
          </button>
        </div>
      </div>

      {/* Content Area - Shows component based on selected tab */}
      <div className="domain-content-wrapper">
        {activeView === 'summary' && <SummaryInfo />}
        {activeView === 'arecord' && <ARecordInfo />}
        {activeView === 'nsrecord' && <NSRecordInfo />}
        {activeView === 'visualization' && <Visualization />}
      </div>
    </div>
  );
};

/**
 * Main DomainDetails component with all providers
 * Automatically reads dom_id from URL query parameter and stores in varData
 * 
 * @example
 * Navigate to: /domain-details?dom_id=5
 */
const DomainDetails: React.FC = () => {
  return (
    <DomainDataProvider>
      <SummaryDataProvider>
        <ARecordInfoDataProvider>
          <ARecordAddonDataProvider>
            <NSRecordInfoDataProvider>
              <IPHoppingVisualizationDataProvider>
                <DomainDetailsContent />
              </IPHoppingVisualizationDataProvider>
            </NSRecordInfoDataProvider>
          </ARecordAddonDataProvider>
        </ARecordInfoDataProvider>
      </SummaryDataProvider>
    </DomainDataProvider>
  );
};

export default DomainDetails;