import { GlobeFilters } from "./GlobeSvgDefs";

/*
    Designing data structure
    - id: number
    - ip_address: string
    - country: string
    - total_domains: number
    - last_active: string
    - total_single_flux_domain: number
    - total_double_flux_domain: number
    - total_name_flux_domain: number
    - coords: [lon, lat]
    - color: string
    - circle_radius: number
    - glow_intensity: GlobeFilters (enum) { SUBTLE_GLOW, GLOW[default], PULSING_GLOW, STRONG_GLOW, ULTRA_GLOW }
*/

export interface Location {
  id: number;
  ip_address: string;
  country: string;
  total_domains: number;
  last_active: string;
  total_single_flux_domain: number;
  total_double_flux_domain: number;
  total_name_flux_domain: number;
  coords: [number, number]; // [lon, lat]
  color: string;
  circle_radius: number;
  glow_intensity: typeof GlobeFilters[keyof typeof GlobeFilters];
}

export const locations: Location[] = [
  { id: 1, ip_address: "102.165.0.1", country: "Kuala Lumpur", total_domains: 5, last_active: "2023-10-01", total_single_flux_domain: 2, total_double_flux_domain: 1, total_name_flux_domain: 2, coords: [101.6869, 3.1390], color: "#bbfc08ff", circle_radius: 3.0, glow_intensity: GlobeFilters.ULTRA_GLOW },
  { id: 2, ip_address: "102.165.0.2", country: "London", total_domains: 3, last_active: "2023-10-02", total_single_flux_domain: 3, total_double_flux_domain: 0, total_name_flux_domain: 0, coords: [-0.1276, 51.5074], color: "#bbfc08ff", circle_radius: 2.0, glow_intensity: GlobeFilters.STRONG_GLOW },
  { id: 3, ip_address: "102.165.0.3", country: "Tokyo", total_domains: 4, last_active: "2023-10-03", total_single_flux_domain: 2, total_double_flux_domain: 1, total_name_flux_domain: 1, coords: [139.6917, 35.6895], color: "#bbfc08ff", circle_radius: 2.0, glow_intensity: GlobeFilters.GLOW },
  { id: 4, ip_address: "102.165.0.4", country: "New York", total_domains: 6, last_active: "2023-10-04", total_single_flux_domain: 3, total_double_flux_domain: 2, total_name_flux_domain: 1, coords: [-74.006, 40.7128], color: "#bbfc08ff", circle_radius: 2.0, glow_intensity: GlobeFilters.PULSING_GLOW },
  { id: 5, ip_address: "102.165.0.5", country: "Sydney", total_domains: 2, last_active: "2023-10-05", total_single_flux_domain: 1, total_double_flux_domain: 0, total_name_flux_domain: 1, coords: [151.2093, -33.8688], color: "#bbfc08ff", circle_radius: 2.0, glow_intensity: GlobeFilters.SUBTLE_GLOW },
];
