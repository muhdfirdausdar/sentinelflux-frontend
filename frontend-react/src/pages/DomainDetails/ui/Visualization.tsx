import { IPHopping } from './vis_components/IPHopping';
import { IPAddressTTLComparison } from './vis_components/IPAddressTTLComparison';
import { CompleteDomainData } from './vis_components/CompleteDomainData';
import './visualization.css';

/**
 * Visualization Component
 * Main container for all visualization components
 */
export function Visualization() {
  return (
    <div className="visualization-container">
      {/* Content Area */}
      <div className="visualization-content">
        {/* IP Hopping Section */}
        <div className="visualization-section">
          <div className="visualization-section-header">
            <div>
              <h3 className="visualization-section-title">Domain IP Address Hopping</h3>
              <p className="visualization-section-description">
                This section provides a visual map showing the path of the domain's IP address. It traces the geographical movement or routing of the IP from its origin to its current location, helping to identify where the server or service is located.
              </p>
            </div>
          </div>
          <div className="visualization-map-container">
            <IPHopping />
          </div>
        </div>

        {/* IP Address TTL Comparison Section */}
        <div className="visualization-section">
          <div className="visualization-section-header">
            <div>
              <h3 className="visualization-section-title">IP Address TTL Comparison</h3>
              <p className="visualization-section-description">
                This bar chart displays the frequency of TTL (Time to Live) values for different IP addresses associated with the domain. TTL refers to the time a packet is allowed to exist in a network before being discarded. The chart compares IPs with the lowest and highest TTL values, allowing insights into the distribution of TTL in the network traffic.
              </p>
            </div>
          </div>
          <IPAddressTTLComparison />
        </div>

        {/* Complete Domain Data Section */}
        <div className="visualization-section">
          <div className="visualization-section-header">
            <h3 className="visualization-section-title">Complete Domain Data</h3>
          </div>
          <div className="visualization-data-container">
            <CompleteDomainData />
          </div>
        </div>
      </div>
    </div>
  );
}
