import { useState } from 'react';
import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { DOMAIN_FLUX_HISTORY } from '@/constants/graphql';
import { DomainFluxHistoryData } from '@/types/graphql';

/**
 * Custom hook for Domain Flux History
 * Handles all GraphQL logic for fetching historical domain status and flux records
 */
export function useDomainFluxHistory() {
  const [domainName, setDomainName] = useState('');
  const [fromDatetime, setFromDatetime] = useState('');
  const [untilDatetime, setUntilDatetime] = useState('');

  const [executeHistory, { data, loading, error }] = useLazyGraphQL<DomainFluxHistoryData>(
    DOMAIN_FLUX_HISTORY,
    {
      onCompleted: (result) => {
        console.log('Domain flux history completed:', result);
      },
      onError: (err) => {
        console.error('Domain flux history error:', err);
      }
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName || !domainName.trim()) {
      console.error('Domain name is required');
      return;
    }
    
    // Convert datetime-local format to ISO format with timezone
    const formatDateToISO = (datetimeLocalValue: string): string | undefined => {
      if (!datetimeLocalValue) return undefined;
      
      // datetime-local format: "2024-11-03T14:30"
      // Convert to: "2024-11-03T14:30:00+08:00"
      
      // Add seconds if not present
      const withSeconds = datetimeLocalValue.includes(':') && datetimeLocalValue.split(':').length === 2
        ? `${datetimeLocalValue}:00`
        : datetimeLocalValue;
      
      const timezoneOffset = '+08:00';
      return `${withSeconds}${timezoneOffset}`;
    };
    
    executeHistory({
      variables: {
        domainName: domainName.trim(),
        fromDatetime: formatDateToISO(fromDatetime),
        untilDatetime: formatDateToISO(untilDatetime),
      }
    });
  };

  const result = data?.domainFluxHistory;

  // Helper function to get sorted records as array
  const getSortedStatusRecords = () => {
    if (!result?.domainStatus) return [];
    return Object.entries(result.domainStatus)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([_, record]) => record);
  };

  const getSortedFluxRecords = () => {
    if (!result?.domainFlux) return [];
    return Object.entries(result.domainFlux)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([_, record]) => record);
  };

  return {
    // Input state
    domainName,
    setDomainName,
    fromDatetime,
    setFromDatetime,
    untilDatetime,
    setUntilDatetime,
    
    // Actions
    handleSearch,
    executeHistory, // Expose the execute function
    
    // Query state
    result,
    loading,
    error,
    
    // Helper functions
    getSortedStatusRecords,
    getSortedFluxRecords,
  };
}

/**
 * Usage Example:
 * 
 * import { useDomainFluxHistory } from '../../hooks/useDomainFluxHistory';
 * 
 * const DomainFluxHistoryPage: React.FC = () => {
 *   const {
 *     domainName,
 *     setDomainName,
 *     fromDatetime,
 *     setFromDatetime,
 *     untilDatetime,
 *     setUntilDatetime,
 *     handleSearch,
 *     result,
 *     loading,
 *     error,
 *     getSortedStatusRecords,
 *     getSortedFluxRecords,
 *   } = useDomainFluxHistory();
 * 
 *   return (
 *     <div>
 *       <form onSubmit={handleSearch}>
 *         <input
 *           value={domainName}
 *           onChange={(e) => setDomainName(e.target.value)}
 *           placeholder="Enter domain name"
 *         />
 *         <input
 *           type="datetime-local"
 *           value={fromDatetime}
 *           onChange={(e) => setFromDatetime(e.target.value)}
 *           placeholder="From datetime"
 *         />
 *         <input
 *           type="datetime-local"
 *           value={untilDatetime}
 *           onChange={(e) => setUntilDatetime(e.target.value)}
 *           placeholder="Until datetime"
 *         />
 *         <button type="submit" disabled={loading}>
 *           {loading ? 'Loading...' : 'Search'}
 *         </button>
 *       </form>
 * 
 *       {loading && <div>Loading...</div>}
 *       {error && <div>Error: {error}</div>}
 *       
 *       {result && (
 *         <div>
 *           <h2>Domain ID: {result.domainId}</h2>
 *           
 *           <h3>Status History</h3>
 *           <table>
 *             <thead>
 *               <tr>
 *                 <th>Time</th>
 *                 <th>Status</th>
 *               </tr>
 *             </thead>
 *             <tbody>
 *               {getSortedStatusRecords().map((record, idx) => (
 *                 <tr key={idx}>
 *                   <td>{new Date(record.updatedAt).toLocaleString()}</td>
 *                   <td>{record.status}</td>
 *                 </tr>
 *               ))}
 *             </tbody>
 *           </table>
 *           
 *           <h3>Flux History</h3>
 *           <table>
 *             <thead>
 *               <tr>
 *                 <th>Time</th>
 *                 <th>Flux Type</th>
 *               </tr>
 *             </thead>
 *             <tbody>
 *               {getSortedFluxRecords().map((record, idx) => (
 *                 <tr key={idx}>
 *                   <td>{new Date(record.updatedAt).toLocaleString()}</td>
 *                   <td>{record.fluxType}</td>
 *                 </tr>
 *               ))}
 *             </tbody>
 *           </table>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 */