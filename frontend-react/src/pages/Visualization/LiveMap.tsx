import StaticMap from './LiveMap/StaticMap';
import Legend from './LiveMap/Legend';
import Top3FastFluxInfo from './LiveMap/Top3FastFluxInfo';
import { useEffect, useState } from 'react';
import { useSSELiveMap } from './LiveMap/services/useSSELiveMap';
import { useLiveMapLocations } from './LiveMap/services/useLiveMapLocations';
import './LiveMap.css';

const LiveMap = () => {
  // Connect to SSE and manage LiveMapData in store
  const { data: liveMapData, running: sseRunning } = useSSELiveMap();
  
  // Automatically transform LiveMapData → Location[] for Globe rendering
  const locations = useLiveMapLocations();
  
  // Track initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);

  useEffect(() => {
    // console.log('🌍 LiveMap Page Status:');
    // console.log('  SSE Connection:', sseRunning ? '✅ Connected' : '❌ Disconnected');
    // console.log('  LiveMapData domains:', liveMapData ? Object.keys(liveMapData).length : 0);
    // console.log('  Transformed locations:', locations.length);
    
    // Check if we have received initial data
    if (liveMapData && Object.keys(liveMapData).length > 0 && !hasInitialData) {
      setHasInitialData(true);
      setIsInitialLoading(false);
    }
    
    // Also check locations as backup
    if (locations && locations.length > 0 && !hasInitialData) {
      setHasInitialData(true);
      setIsInitialLoading(false);
    }
  }, [liveMapData, sseRunning, locations, hasInitialData]);

  return (
    <div className="live-map-page">
      {/* Header Section */}
      <div className="live-map-header">
        <h1 className="live-map-title">
          <span className="title-highlight">Fast Flux</span> World Map
        </h1>
        <p className="live-map-description">
          Track malicious activity where it happens. Fast Flux map reveals how attackers hide behind constantly shifting IP addresses over the past week.
        </p>
      </div>

      {/* Loading State */}
      {isInitialLoading && (
        <div className="live-map-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h2>Loading Live Map Data...</h2>
            <p>Connecting to real-time Fast Flux monitoring system</p>
            <div className="loading-status">
              <div className="status-item">
                <span className="status-indicator" style={{ backgroundColor: sseRunning ? '#10b981' : '#ef4444' }}></span>
                <span>SSE Connection: {sseRunning ? 'Connected' : 'Connecting...'}</span>
              </div>
              <div className="status-item">
                <span className="status-indicator" style={{ backgroundColor: liveMapData ? '#10b981' : '#6b7280' }}></span>
                <span>Data Stream: {liveMapData ? 'Receiving' : 'Waiting...'}</span>
              </div>
              <div className="status-item">
                <span className="status-indicator" style={{ backgroundColor: locations.length > 0 ? '#10b981' : '#6b7280' }}></span>
                <span>Map Data: {locations.length > 0 ? `${locations.length} locations loaded` : 'Processing...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Map + Sidebar - Only show after initial load */}
      {!isInitialLoading && (
        <div className="live-map-content">
          {/* Map Container */}
          <div className="live-map-container">
            <StaticMap />
            
            {/* Legend: positioned within map */}
            <div className="live-map-legend-wrapper">
              <Legend />
            </div>
          </div>

          {/* Right Sidebar with Statistics */}
          <div className="live-map-sidebar">
            <Top3FastFluxInfo />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
