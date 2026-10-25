import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTop10Stats, GeoIPLocation } from '../Top10/getTop10';
import './Top3FastFluxInfo.css';

interface TopItem {
  value: string;
  count?: number;
}

const Top3FastFluxInfo: React.FC = () => {
  const { data, loading } = useTop10Stats();

  const { topCountries, topIPAddresses, topNameServers } = useMemo(() => {
    if (!data) {
      return {
        topCountries: [],
        topIPAddresses: [],
        topNameServers: [],
      };
    }

    // Extract top 3 countries from top10_geoip
    const topCountries: TopItem[] = data.top10_geoip
      ? Object.entries(data.top10_geoip)
          .slice(0, 3)
          .map(([_, location]) => ({ 
            value: (location as GeoIPLocation).country 
          }))
      : [];

    // Extract top 3 IPs from top10_ips
    const topIPAddresses: TopItem[] = data.top10_ips
      ? Object.entries(data.top10_ips)
          .slice(0, 3)
          .map(([_, ip]) => ({ 
            value: ip as string
          }))
      : [];

    // Extract top 3 name servers from top10_nameserver
    const topNameServers: TopItem[] = data.top10_nameserver
      ? Object.entries(data.top10_nameserver)
          .slice(0, 3)
          .map(([_, ns]) => ({ 
            value: ns as string
          }))
      : [];

    return {
      topCountries,
      topIPAddresses,
      topNameServers,
    };
  }, [data]);

  // Show loading state
  if (loading) {
    return (
      <div className="top3-fastflux-container">
        <div className="top3-section">
          <div className="top3-loading">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="top3-fastflux-container">
      {/* Top Fast Flux Originated Countries */}
      <div className="top3-section">
        <h3 className="top3-title">Top Fast Flux Originated Countries</h3>
        <div className="top3-header">
          <p className="top3-subtitle">Most active Fast Flux origin countries</p>
          <Link to="/top-10#countries" className="top3-more-link">More Info</Link>
        </div>
        <div className="top3-list">
          {topCountries.length > 0 ? (
            topCountries.map((item, index) => (
              <div key={item.value} className="top3-item">
                <div className="top3-item-content">
                  <div className="top3-item-header">
                    <div className="top3-item-icon country-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="3" fill="currentColor" opacity="0.8"/>
                        <rect x="4" y="11" width="16" height="3" fill="currentColor" opacity="0.6"/>
                        <rect x="4" y="16" width="16" height="3" fill="currentColor" opacity="0.4"/>
                      </svg>
                    </div>
                    <span className="top3-rank">{index + 1}</span>
                    <span className="top3-value">{item.value}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="top3-no-data">No data available</div>
          )}
        </div>
      </div>

      {/* Top IP Address Used In Fast Flux */}
      <div className="top3-section">
        <h3 className="top3-title">Top IP Address Used In Fast Flux</h3>
        <div className="top3-header">
          <p className="top3-subtitle">IP address that frequently used</p>
          <Link to="/top-10#ips" className="top3-more-link">More Info</Link>
        </div>
        <div className="top3-list">
          {topIPAddresses.length > 0 ? (
            topIPAddresses.map((item, index) => (
              <div key={item.value} className="top3-item">
                <div className="top3-item-content">
                  <div className="top3-item-header">
                    <div className="top3-item-icon ip-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      </svg>
                    </div>
                    <span className="top3-rank">{index + 1}</span>
                    <span className="top3-value ip-address">{item.value}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="top3-no-data">No data available</div>
          )}
        </div>
      </div>

      {/* Top Name Server Used In Fast Flux */}
      <div className="top3-section">
        <h3 className="top3-title">Top Name Server Used In Fast Flux</h3>
        <div className="top3-header">
          <p className="top3-subtitle">Name server that frequently used</p>
          <Link to="/top-10#nameservers" className="top3-more-link">More Info</Link>
        </div>
        <div className="top3-list">
          {topNameServers.length > 0 ? (
            topNameServers.map((item, index) => (
              <div key={item.value} className="top3-item">
                <div className="top3-item-content">
                  <div className="top3-item-header">
                    <div className="top3-item-icon nameserver-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span className="top3-rank">{index + 1}</span>
                    <span className="top3-value domain-name">{item.value}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="top3-no-data">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Top3FastFluxInfo;
