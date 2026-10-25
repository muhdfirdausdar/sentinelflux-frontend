import { useState } from 'react';
import { DNSDigRequestForm } from './submitDigRequest';
import { DNSDigResultFetch } from './getDigRequest';
import './submitDR.css';
import './getDR.css';

type TabView = 'schedule' | 'result';

export function AutoDNSDigPage() {
  const [activeTab, setActiveTab] = useState<TabView>('schedule');

  return (
    <div className="dns-dig-container">
      {/* Tabs */}
      <div className="dns-dig-tabs">
        <button 
          className={`dns-dig-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule DNS Dig
        </button>
        <button 
          className={`dns-dig-tab ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
        >
          View Result
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'schedule' && <DNSDigRequestForm />}
        {activeTab === 'result' && <DNSDigResultFetch />}
      </div>
    </div>
  );
}

export default AutoDNSDigPage;
