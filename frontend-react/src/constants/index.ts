// Application constants

// Type definitions
export type DomainType = 'malicious' | 'benign' | 'singleflux' | 'doubleflux' | 'nameflux';

export type StatLabel = 
  | 'total_unprocessed'
  | 'total_malicious' 
  | 'total_benign'
  | 'total_digged'
  | 'total_singleflux'
  | 'total_doubleflux'
  | 'total_nameflux'
  | 'total_nameserver'
  | 'total_ipaddress'
  | 'total_sourcedata'
  | 'total_domain_indb';

export const DOMAIN_TYPES: Record<string, DomainType> = {
  MALICIOUS: 'malicious',
  BENIGN: 'benign',
  SINGLEFLUX: 'singleflux',
  DOUBLEFLUX: 'doubleflux',
  NAMEFLUX: 'nameflux',
} as const;

export const STAT_LABELS: Record<StatLabel, string> = {
  total_unprocessed: "Total Domain Waiting to be Processed",
  total_malicious: "Total Malicious Domains",
  total_benign: "Total Non-Malicious Domains",
  total_digged: "Total DNS Digging Operations",
  total_singleflux: "Total Single-Flux Domains",
  total_doubleflux: "Total Double-Flux Domains",
  total_nameflux: "Total Name-Flux Domains",
  total_nameserver: "Total Nameservers",
  total_ipaddress: "Total IP Addresses",
  total_sourcedata: "Total Source Data",
  total_domain_indb: "Total Domains in Database",
} as const;

export const ROUTES: Record<string, string> = {
  HOME: '/',
  ABOUT_US: '/about-us',
  ABOUT_FASTFLUX: '/about-fastflux',
  SEARCH_DOMAIN: '/search-domain',
  AUTODNSDIG: '/auto-dns-dig',
  FASTFLUXLOOKUP: '/fast-flux-lookup',
  LIVEMAP: '/live-map',
  TOP10: '/top-10',
  DOMAIN_DETAILS: '/domain-details',

} as const;

export const API_ENDPOINTS: Record<string, string> = {
  TEST_ROOT: '/',
  STREAM_METRICS: '/dnflux/metrics',
  STREAM_LIVEMAP: '/visualize/live-map',
  TOP_10_STATS: '/visualize/top-stats',
  FETCH_SESSION_TOKEN: 'fetchSessionToken',
  POST_DNS_DIG_REQUEST: '/dnflux/task-create',
  GET_DNS_DIG_RESULT: '/dnflux/user-task',
} as const;

// This should eventually come from the API or environment variables
export const HARDCODED_OVERRIDES: Record<string, number> = {
  total_malicious: 0,
  total_singleflux: 914,
  total_doubleflux: 220,
  total_nameflux: 3955,
} as const;

export const API_BASE_URL: string = 'https://api-sf01.sentinelflux.software';
export const NETLIFY_API_BASE: string = '/api';

// Below is for developement purposes only
// export const API_BASE_URL: string = 'http://localhost:5252';