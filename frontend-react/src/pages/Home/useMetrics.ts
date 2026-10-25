// Metrics-specific SSE functionality for the Home page
import { useSSE, useSSESelector, isSSERunning } from '../../hooks/useSSE';
import { API_ENDPOINTS } from '../../constants';
import logger from '@/utils/logger';

const log = logger.module('useMetrics');


// Metrics-specific types
export type MetricsData = {
  status: string;
  remark: string;
  data: {
    ts: string;
    dns_lookups: number;
    unique_domains: number;
    unique_ns: number;
    unique_ips: number;
    total_tasks: number;
    total_sources: number;
    unique_malicious_domains: number;
    unique_fastflux_domains: number;
    single_flux: number;
    name_flux: number;
    double_flux: number;
    domains_with_3_ips_change: number;
    domains_with_4_ips_change: number;
    domains_with_5_ips_change: number;
    fetch_timestamp: string;
  };
};

// Metrics endpoint constant
const METRICS_ENDPOINT = API_ENDPOINTS.STREAM_METRICS;

// Metrics-specific selector hook
export function useMetricSelector<T>(selector: (s: any) => T): T {
  return useSSESelector(METRICS_ENDPOINT, selector, true);
}

// Metrics SSE hook (backwards compatible with existing Stats.tsx)
export function useMetricsSSE(opts?: { enabled?: boolean; onMessage?: (data: any) => void }) {
  log.debug('useMetricsSSE called with endpoint:', METRICS_ENDPOINT);
  
  return useSSE({
    endpoint: METRICS_ENDPOINT,
    requireAuth: true,
    ...opts
  });
}

// Convenience hooks for specific metrics
export function useMetricsData(): MetricsData | null {
  return useMetricSelector((s: any) => s);
}

export function useMetricsLastUpdated(): string | null {
  return useMetricSelector((s: any) => s?._meta?.lastUpdated ?? null);
}

export function useMetricsRunning(): boolean {
  // Use the isSSERunning utility function
  return isSSERunning(METRICS_ENDPOINT);
}

// Individual metric selectors with fallback data
const fallbackData = {
  dns_lookups: 1970,
  unique_domains: 29523,
  unique_ns: 7383,
  unique_ips: 24869,
  total_tasks: 97,
  total_sources: 4,
  unique_malicious_domains: 27664,
  unique_fastflux_domains: 1550,
  single_flux: 2500,
  name_flux: 1200,
  double_flux: 2000,
  domains_with_3_ips_change: 1200,
  domains_with_4_ips_change: 1000,
  domains_with_5_ips_change: 500,
};

export function useDNSLookups(): number {
//   log.debug('useDNSLookups called');
  return useMetricSelector((s: any) => {
    // log.debug('DNS lookups selector, data:', s?.data?.dns_lookups);
    return s?.data?.dns_lookups ?? fallbackData.dns_lookups;
  });
}

export function useTotalTasks(): number {
  return useMetricSelector((s: any) => s?.data?.total_tasks ?? fallbackData.total_tasks);
}

export function useUniqueDomains(): number {
  return useMetricSelector((s: any) => s?.data?.unique_domains ?? fallbackData.unique_domains);
}

export function useUniqueNameservers(): number {
  return useMetricSelector((s: any) => s?.data?.unique_ns ?? fallbackData.unique_ns);
}

export function useUniqueIPs(): number {
  return useMetricSelector((s: any) => s?.data?.unique_ips ?? fallbackData.unique_ips);
}

export function useTotalSources(): number {
  return useMetricSelector((s: any) => s?.data?.total_sources ?? fallbackData.total_sources);
}

export function useUniqueMaliciousDomains(): number {
  return useMetricSelector((s: any) => s?.data?.unique_malicious_domains ?? fallbackData.unique_malicious_domains);
}

export function useUniqueFastfluxDomains(): number {
  return useMetricSelector((s: any) => s?.data?.unique_fastflux_domains ?? fallbackData.unique_fastflux_domains);
}

export function useSingleFlux(): number {
  return useMetricSelector((s: any) => s?.data?.single_flux ?? fallbackData.single_flux);
}

export function useNameFlux(): number {
  return useMetricSelector((s: any) => s?.data?.name_flux ?? fallbackData.name_flux);
}

export function useDoubleFlux(): number {
  return useMetricSelector((s: any) => s?.data?.double_flux ?? fallbackData.double_flux);
}

export function useDomainsWith3IPsChange(): number {
  return useMetricSelector((s: any) => s?.data?.domains_with_3_ips_change ?? fallbackData.domains_with_3_ips_change);
}

export function useDomainsWith4IPsChange(): number {
  return useMetricSelector((s: any) => s?.data?.domains_with_4_ips_change ?? fallbackData.domains_with_4_ips_change);
}

export function useDomainsWith5IPsChange(): number {
  return useMetricSelector((s: any) => s?.data?.domains_with_5_ips_change ?? fallbackData.domains_with_5_ips_change);
}

export default useMetricsSSE;
