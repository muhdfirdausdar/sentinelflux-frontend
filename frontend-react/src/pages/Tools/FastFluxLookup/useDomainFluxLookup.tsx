import { useState } from 'react';
import { useLazyGraphQL } from '@/hooks/useGraphQL';
import { DOMAIN_FLUX_LOOKUP } from '@/constants/graphql';
import { DomainFluxLookupData } from '@/types/graphql';

/**
 * Custom hook for Domain Fast Flux Lookup page
 * Handles all GraphQL logic for domain flux lookup
 * 
 */
export function useDomainFluxLookup() {
  const [domainName, setDomainName] = useState('');

  const [executeLookup, { data, loading, error }] = useLazyGraphQL<DomainFluxLookupData>(
    DOMAIN_FLUX_LOOKUP,
    {
      onCompleted: (result) => {
        console.log('Domain flux lookup completed:', result);
      },
      onError: (err) => {
        console.error('Domain flux lookup error:', err);
      }
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainName.trim()) {
      executeLookup({ variables: { domainName: domainName.trim() } });
    }
  };

  const result = data?.domainFluxLookup;

  return {
    // Input state
    domainName,
    setDomainName,
    
    // Actions
    handleSearch,
    executeLookup, // Expose the execute function
    
    // Query state
    result,
    loading,
    error,
  };
}

/**
 * Usage Example:
 * 
 * import { useDomainFluxLookup } from '../../hooks/useDomainFluxLookup';
 * 
 * const FastFluxLookup: React.FC = () => {
 *   const {
 *     domainName,
 *     setDomainName,
 *     handleSearch,
 *     result,
 *     loading,
 *     error
 *   } = useDomainFluxLookup();
 * 
 *   return (
 *     <div>
 *       <form onSubmit={handleSearch}>
 *         <input
 *           value={domainName}
 *           onChange={(e) => setDomainName(e.target.value)}
 *           placeholder="Enter domain name"
 *         />
 *         <button type="submit" disabled={loading}>
 *           {loading ? 'Searching...' : 'Search'}
 *         </button>
 *       </form>
 * 
 *       {loading && <div>Loading...</div>}
 *       {error && <div>Error: {error}</div>}
 *       
 *       {result && (
 *         <div>
 *           <p>Domain ID: {result.domainId}</p>
 *           <p>Status: {result.status}</p>
 *           <p>Flux Type: {result.fastFluxType}</p>
 *           <p>Ever Fast Flux: {result.everFastFlux ? 'Yes' : 'No'}</p>
 *           
 *           {result.reuseInfo.map(ip => (
 *             <div key={ip.ipId}>
 *               IP {ip.ipId}: {ip.totalDomainReused} domains
 *             </div>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 */