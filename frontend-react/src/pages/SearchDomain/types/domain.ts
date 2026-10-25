// Status tag interface with custom colors
export interface StatusTag {
  label: string;
  color: string; // e.g., 'red', 'green', 'orange', 'purple', 'blue', 'gray'
}

// Available status types
export type DomainStatus = 'malicious' | 'benign' | 'singleflux' | 'doubleflux' | 'nameflux' | 'suspicious' | 'clean' | 'unknown';

// Domain data interface matching the API response
export interface DomainData {
  id: string;
  domain_name: string;
  dom_last_seen: string;
  dom_status: string;
  is_malicious: boolean;
  is_unrated: boolean;
  num_ips: number;
  domip_avg_ttl: number;
  domip_last_seen: string;
  domip_lowest_ttl: number;
  domip_highest_ttl: number;
  num_ns: number;
  domns_avg_ttl: number;
  domns_last_seen: string;
  domns_lowest_ttl: number;
  domns_highest_ttl: number;
  flux_type: string;
}

// Function to generate status tags from API data
export const generateStatusTags = (data: DomainData): StatusTag[] => {
  const tags: StatusTag[] = [];
  
  // Add malicious/benign status
  if (data.is_malicious) {
    tags.push({ label: 'Malicious', color: '#dc2626' }); // red
  } else if (data.is_unrated && !data.is_malicious) {
    tags.push({ label: 'Unrated', color: '#f97316' }); // orange
  } else {
    tags.push({ label: 'Benign', color: '#16a34a' }); // green
  }
  
  // Add domain status
  if (data.dom_status) {
    tags.push({ 
      label: data.dom_status.charAt(0).toUpperCase() + data.dom_status.slice(1), 
      color: '#3b82f6' // blue
    });
  }
  
  // Add flux type
  if (data.flux_type) {
    if (data.flux_type === 'unknown') {
      tags.push({ label: 'No Fast Flux', color: '#6b7280' }); // gray
    } else {
      const fluxLabel = data.flux_type === 'single' ? 'Single Flux' :
                       data.flux_type === 'double' ? 'Double Flux' :
                       data.flux_type === 'name' ? 'Name Flux' :
                       data.flux_type.charAt(0).toUpperCase() + data.flux_type.slice(1) + ' Flux';
      tags.push({ label: fluxLabel, color: '#a855f7' }); // purple
    }
  }
  
  return tags;
};

// Table state types
export interface TableFilters {
  global: string;
  status?: DomainStatus;
}

export interface TableState {
  filters: TableFilters;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: Array<{
    id: string;
    desc: boolean;
  }>;
}
