import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDomainFluxLookup } from './FastFluxLookup/useDomainFluxLookup';
import { useDomainFluxHistory } from './FastFluxLookup/useDomainFluxHistory';
import { ROUTES } from '../../constants';
import './FastFluxLookup.css';
import { sanitizeDomainSearch } from '../../utils/inputSanitizer';

const FastFluxLookup: React.FC = () => {
  const navigate = useNavigate();
  
  // Generate latest 4 years dynamically
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 4 }, (_, i) => currentYear - i);
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedDomain, setSearchedDomain] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    domainName,
    setDomainName,
    result: lookupResult,
    loading: lookupLoading,
    error: lookupError,
    executeLookup,
  } = useDomainFluxLookup();

  const {
    result: historyResult,
    loading: historyLoading,
    executeHistory,
  } = useDomainFluxHistory();

  // Don't auto-load any domain on mount - let user search
  useEffect(() => {
    // Component mounted, ready for user input
  }, []);

  const handleSearch = () => {
    const candidate = domainName.trim();
    if (!candidate) return;

    try {
      sanitizeDomainSearch(candidate);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid domain name');
      return;
    }

    setHasSearched(true);
    setSearchedDomain(candidate);
    executeLookup({ variables: { domainName: candidate } });

    // Fetch history for the selected year
    const fromDatetime = `${selectedYear}-01-01T00:00:00+08:00`;
    const untilDatetime = `${selectedYear}-12-31T23:59:59+08:00`;
    executeHistory({
      variables: {
        domainName: candidate,
        fromDatetime,
        untilDatetime,
      }
    });
  };

  // Process history data to generate monthly chart data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultData = months.map((month, index) => ({
      month,
      monthIndex: index,
      status: 'unknown' as 'fastflux' | 'not-fastflux' | 'inactive' | 'unknown',
      height: 40,
    }));

    if (!historyResult?.domainFlux) return defaultData;

    // Process flux records
    const fluxRecords = Object.values(historyResult.domainFlux);
    const yearData = months.map((month, index) => {
      // Filter records for this month
      const monthRecords = fluxRecords.filter(record => {
        const date = new Date(record.updatedAt);
        return date.getFullYear() === parseInt(selectedYear) && date.getMonth() === index;
      });

      if (monthRecords.length === 0) {
        return { month, monthIndex: index, status: 'inactive' as const, height: 40 };
      }

      // Check if any record in this month shows fast flux
      const hasFlux = monthRecords.some(record => 
        record.fluxType && record.fluxType !== 'UNKNOWN' && record.fluxType !== 'NOT_FAST_FLUX'
      );
      
      const isNotFlux = monthRecords.some(record => 
        record.fluxType === 'NOT_FAST_FLUX'
      );

      if (hasFlux) {
        return { month, monthIndex: index, status: 'fastflux' as const, height: 90 };
      } else if (isNotFlux) {
        return { month, monthIndex: index, status: 'not-fastflux' as const, height: 40 };
      } else {
        return { month, monthIndex: index, status: 'inactive' as const, height: 40 };
      }
    });

    return yearData;
  }, [historyResult, selectedYear]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Refetch history when year changes
  useEffect(() => {
    const candidate = domainName.trim();
    if (!candidate) return;

    try {
      sanitizeDomainSearch(candidate);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid domain name');
      return;
    }

    const fromDatetime = `${selectedYear}-01-01T00:00:00+08:00`;
    const untilDatetime = `${selectedYear}-12-31T23:59:59+08:00`;
    executeHistory({
      variables: {
        domainName: candidate,
        fromDatetime,
        untilDatetime,
      }
    });
  }, [selectedYear]);

  // Check if domain was searched but not found - only show after user has performed a search
  // Also check that the current input matches the searched domain to prevent showing stale results
  const domainNotFound = hasSearched && !lookupLoading && searchedDomain && !lookupResult && !lookupError;

  return (
    <div className="flux-lookup-page">
      <div className="container">
        <header>
          <h1>Fast Flux History Lookup</h1>
          <p>Has This Domain Ever Fluxed? Fast Flux behavior leaves traces. Search now and reveal any suspicious past!</p>
        </header>

        <div className="search-row" role="search" aria-label="domain search">
          <input 
            className="search-input" 
            type="text" 
            placeholder="Enter domain name (e.g., example.com)"
            value={domainName}
            onChange={(e) => {
              setDomainName(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="search-btn" 
            aria-label="search"
            onClick={handleSearch}
            disabled={lookupLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 21l-4.35-4.35" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

  {domainName && <div className="subtext">You searched "{domainName}"</div>}
  {error && <div className="subtext" style={{ color: 'var(--red)' }}>{error}</div>}
        {!domainName && !lookupResult && (
          <div className="subtext" style={{color: 'var(--muted)', fontStyle: 'italic'}}>
            Enter a domain name above to check its Fast Flux history
          </div>
        )}

        {lookupLoading && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading...</div>}
        {lookupError && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--red)' }}>Error: {lookupError}</div>}

        {/* Domain Not Found State */}
        {domainNotFound && (
          <div className="not-found" role="status">
            <div className="not-found-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            <h2>Domain Not Found</h2>
            <p>
              We couldn't find any historical data for <strong>{searchedDomain}</strong>. 
              This domain hasn't been analyzed yet or doesn't exist in our database.
            </p>

            <div className="not-found-actions">
              <button 
                className="not-found-btn primary" 
                onClick={() => navigate(ROUTES.AUTODNSDIG)}
              >
                Request Analysis
              </button>
              <button 
                className="not-found-btn secondary" 
                onClick={() => {
                  setDomainName('');
                  setHasSearched(false);
                  setSearchedDomain('');
                }}
              >
                Try Another Domain
              </button>
            </div>

            <div className="not-found-suggestions">
              <h3>What does this mean?</h3>
              <ul>
                <li>The domain may be new and not yet in our system</li>
                <li>It might not have been flagged for Fast Flux analysis</li>
                <li>The domain could be inactive or recently registered</li>
                <li>Try searching for a different domain to see results</li>
              </ul>
            </div>
          </div>
        )}

        {lookupResult && (
          <div className="main" role="main">
            {/* Left info card */}
            <section className="left-card" aria-labelledby="domain-info-title">

              <div className="row">
                <span className="label">Domain:</span>
                <span className="value">{searchedDomain}</span>
              </div>
              <div className="row">
                <span className="label">Current Status:</span>
                <span className="value">{lookupResult.status || 'N/A'}</span>
              </div>
              <div className="row">
                <span className="label">Ever Fast Flux:</span>
                <span className="value">{lookupResult.everFastFlux ? 'Yes' : 'No'}</span>
              </div>
              <div className="row">
                <span className="label">Fast Flux Type:</span>
                <span className="value">{lookupResult.fastFluxType || 'N/A'}</span>
              </div>
              <div className="row">
                <span className="label">Total Shared IPs:</span>
                <span className="value">
                  {lookupResult.reuseInfo?.length > 0 
                    ? `${lookupResult.reuseInfo.length} reused across multiple domains` 
                    : 'No shared IPs detected'}
                </span>
              </div>
              <div className="row">
                <span className="label">First Analysis:</span>
                <span className="value">{lookupResult.fastFluxFirstAnalysis || 'N/A'}</span>
              </div>
              <div className="row">
                <span className="label">Last Analysis:</span>
                <span className="value">{lookupResult.fastFluxLastAnalysis || 'N/A'}</span>
              </div>

              <button 
                onClick={() => navigate(`${ROUTES.DOMAIN_DETAILS}?dom_id=${lookupResult.domainId}`)} 
                className="cta" 
                role="button"
              >
                See More Domain Details
              </button>
            </section>

            {/* Right column a*/}
            <aside className="right-col">
              {lookupResult.everFastFlux && (
                <div className="alert" role="status">
                  This domain has been detected as part of a Fast Flux network<br/>
                  <small style={{opacity:.9, fontWeight:600, display:'block', marginTop:'6px', fontSize:'13px'}}>
                    Last Fast Flux Activity: {lookupResult.fastFluxLastAnalysis || 'Unknown'}
                  </small>
                </div>
              )}

              <div className="chart-card" aria-label="activity chart">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div className="legend" aria-hidden="true">
                    <div className="key"><span className="box red"></span> Fast-Flux</div>
                    <div className="key"><span className="box green"></span> Not Fast-Flux</div>
                    <div className="key"><span className="box grey"></span> No Data</div>
                  </div>

                  <select 
                    className="year-select" 
                    aria-label="select year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {historyLoading ? (
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'140px', color:'#0b1220aa'}}>
                    Loading chart data...
                  </div>
                ) : (
                  <>
                    <div className="chart-area" role="img" aria-label="fast flux timeline placeholder">

                  <div className="bars">
                    {monthlyData.map((data, index) => {
                      let barClass = 'bar ';
                      let tooltipText = '';
                      
                      if (data.status === 'fastflux') {
                        barClass += 'medium';
                        tooltipText = `${data.month} - Fast-Flux`;
                      } else if (data.status === 'not-fastflux') {
                        barClass += 'green';
                        tooltipText = `${data.month} - Not Fast-Flux`;
                      } else {
                        barClass += 'grey';
                        tooltipText = `${data.month} - No Info`;
                      }
                      
                      return (
                        <div 
                          key={index}
                          className={barClass}
                          style={{ height: `${data.height}px` }}
                          title={tooltipText}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                <div className="month-labels" style={{display:'flex', gap:'6px', fontSize:'11px', color:'#0b1220cc', fontWeight: 600, paddingLeft: '8px'}}>
                  {monthlyData.map((data, index) => (
                    <div key={index} style={{flex: '1 1 0', textAlign: 'center', minWidth: 0}}>{data.month}</div>
                  ))}
                </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastFluxLookup;
