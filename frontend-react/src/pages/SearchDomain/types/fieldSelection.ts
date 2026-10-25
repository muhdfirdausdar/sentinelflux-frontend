// Field selection types and utilities

export type AvailableField = 
  | 'domain_name'      // Always visible
  | 'status_tags'      // Combined from is_malicious, dom_status, flux_type
  | 'dom_last_seen'
  | 'num_ips'
  | 'num_ns'
  | 'domip_avg_ttl'
  | 'domip_lowest_ttl'
  | 'domip_highest_ttl'
  | 'domip_last_seen'
  | 'domns_avg_ttl'
  | 'domns_lowest_ttl'
  | 'domns_highest_ttl'
  | 'domns_last_seen'
  | 'source_name';

export interface FieldOption {
  key: AvailableField;
  label: string;
  description?: string;
  alwaysVisible?: boolean;
}

export const AVAILABLE_FIELDS: FieldOption[] = [
  {
    key: 'domain_name',
    label: 'Domain Name',
    description: 'The domain name',
    alwaysVisible: true
  },
  {
    key: 'status_tags',
    label: 'Status/Tags',
    description: 'Malicious status, domain status, and flux type'
  },
  {
    key: 'dom_last_seen',
    label: 'Last Seen',
    description: 'When the domain was last observed'
  },
  {
    key: 'num_ips',
    label: 'Total IPs',
    description: 'Number of IP addresses associated'
  },
  {
    key: 'num_ns',
    label: 'Total NS',
    description: 'Number of name servers'
  },
  {
    key: 'domip_avg_ttl',
    label: 'Avg IP TTL',
    description: 'Average TTL for IP records'
  },
  {
    key: 'domip_lowest_ttl',
    label: 'Min IP TTL',
    description: 'Lowest TTL for IP records'
  },
  {
    key: 'domip_highest_ttl',
    label: 'Max IP TTL',
    description: 'Highest TTL for IP records'
  },
  {
    key: 'domip_last_seen',
    label: 'IP Last Seen',
    description: 'When IP records were last seen'
  },
  {
    key: 'domns_avg_ttl',
    label: 'Avg NS TTL',
    description: 'Average TTL for NS records'
  },
  {
    key: 'domns_lowest_ttl',
    label: 'Min NS TTL',
    description: 'Lowest TTL for NS records'
  },
  {
    key: 'domns_highest_ttl',
    label: 'Max NS TTL',
    description: 'Highest TTL for NS records'
  },
  {
    key: 'domns_last_seen',
    label: 'NS Last Seen',
    description: 'When NS records were last seen'
  },
  {
    key: 'source_name',
    label: 'Source',
    description: 'Data source name'
  }
];

// Default field selections by breakpoint
export const DEFAULT_FIELDS: Record<string, AvailableField[]> = {
  mobile: ['domain_name', 'status_tags', 'dom_last_seen', 'num_ips', 'num_ns'],
  md: ['domain_name', 'status_tags', 'dom_last_seen', 'num_ips', 'num_ns', 'domip_avg_ttl', 'source_name'],
  lg: ['domain_name', 'status_tags', 'dom_last_seen', 'num_ips', 'num_ns', 'domip_avg_ttl', 'domip_last_seen', 'domns_avg_ttl', 'source_name']
};

// Column limits by breakpoint
export const COLUMN_LIMITS = {
  mobile: 5,  // Below md
  md: 7,      // md and above
  lg: 9       // lg and above (desktop)
};

// Get current breakpoint based on window width
export const getCurrentBreakpoint = (): 'mobile' | 'md' | 'lg' => {
  if (typeof window === 'undefined') return 'lg'; // SSR fallback
  
  const width = window.innerWidth;
  if (width >= 1024) return 'lg';   // lg breakpoint
  if (width >= 768) return 'md';    // md breakpoint
  return 'mobile';
};

// Get default fields for current breakpoint
export const getDefaultFieldsForBreakpoint = (breakpoint?: 'mobile' | 'md' | 'lg'): AvailableField[] => {
  const bp = breakpoint || getCurrentBreakpoint();
  return DEFAULT_FIELDS[bp];
};

// Filter fields based on limits and ensure domain_name is always included
export const validateFieldSelection = (
  selectedFields: AvailableField[], 
  breakpoint?: 'mobile' | 'md' | 'lg'
): AvailableField[] => {
  const bp = breakpoint || getCurrentBreakpoint();
  const limit = COLUMN_LIMITS[bp];
  
  // Always include domain_name
  const fieldsWithDomain: AvailableField[] = selectedFields.includes('domain_name') 
    ? [...selectedFields] 
    : ['domain_name', ...selectedFields];
  
  // Respect column limit
  return fieldsWithDomain.slice(0, limit);
};

// Get field option by key
export const getFieldOption = (key: AvailableField): FieldOption | undefined => {
  return AVAILABLE_FIELDS.find(field => field.key === key);
};
