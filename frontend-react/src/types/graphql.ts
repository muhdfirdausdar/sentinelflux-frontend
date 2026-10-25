export interface IPReuseData {
  ipId: number;
  totalDomainReused: number;
}

export interface DomainFluxLookupResult {
  domainId: number;
  status: string;
  fastFluxFirstAnalysis: string | null;
  fastFluxLastAnalysis: string | null;
  fastFluxType: string;
  everFastFlux: boolean;
  reuseInfo: IPReuseData[];
}

export interface DomainFluxLookupData {
  domainFluxLookup: DomainFluxLookupResult | null;
}

export interface DomainStatusRecord {
  updatedAt: string;
  status: string;
}

export interface DomainFluxRecord {
  updatedAt: string;
  fluxType: string;
}

export interface DomainFluxHistoryResult {
  domainId: number;
  domainStatus: Record<string, DomainStatusRecord>;
  domainFlux: Record<string, DomainFluxRecord>;
}

export interface DomainFluxHistoryData {
  domainFluxHistory: DomainFluxHistoryResult | null;
}

// Domain Details Summary Types
export interface DomainDetailsSummary {
  id: number;
  domainName: string;
  domainStatus: string;
  sourceDomain: string | null;
  isFastFlux: boolean;
  fluxType: string | null;
  domFirstSeen: string;
  domLastSeen: string;
  isMalicious: boolean;
  sourceMalicious: string | null;
  maliciousType: string | null;
  lastMalUpdated: string | null;
  totalARecords: number;
  totalNsRecords: number;
  totalNsIps: number;
  aChangeFrequencyPerWeek: number;
  nsChangeFrequencyPerWeek: number;
}

export interface DomainDetailsSummaryData {
  domDetailsSummary: DomainDetailsSummary | null;
}

// A Record Info Types
export interface ARecord {
  id: number;
  ipId: number;
  ipAddress: string;
  ttl: number;
  lowestTtl: number;
  highestTtl: number;
  firstSeen: string;
  lastSeen: string;
  lowestTtlTime: string;
  country: string | null;
  asnAso: string | null;
  latitudeLongitude: string | null;
  maliciousTypes: string[] | null;
  maliciousSources: string[] | null;
}

export interface IPReuseInfo {
  ipId: number;
  ipAddress: string;
  totalRelationWithOtherDomains: number;
  totalRelationWithOtherNs: number;
}

export interface ARecordInfoResult {
  aRecords: ARecord[];
  ipReuseInfo: IPReuseInfo[];
}

export interface ARecordInfoData {
  aRecordInfo: ARecordInfoResult | null;
}

// A Record Addon Types
export interface RelatedDomain {
  domainId: number;
  domainName: string;
  firstSeen: string;
  lastSeen: string;
  fluxType: string | null;
  isMalicious: boolean;
}

export interface RelatedNameserver {
  nameserverId: number;
  nameserverName: string;
  firstSeen: string;
  lastSeen: string;
  lowestTtl: number;
  latestTtl: number;
}

export interface ARecordAddonResult {
  relatedDomain: RelatedDomain[];
  relatedNameserver: RelatedNameserver[];
}

export interface ARecordAddonData {
  aRecordAddon: ARecordAddonResult | null;
}

// NS Record Info Types
export interface NSRecord {
  id: number;
  nameserverId: number;
  nameserver: string;
  ttl: number;
  lowestTtl: number;
  firstSeen: string;
  lastSeen: string;
  lowestTtlTime: string;
}

export interface NSToIPInfo {
  ipId: number;
  ipAddress: string;
  nsId: number;
  nameserver: string;
  ipNsTtl: number;
  ipNsLowestTtl: number;
  firstSeen: string;
  lastSeen: string;
  ipNsLowestTtlTime: string;
  country: string | null;
  asnAso: string | null;
}

export interface NSRecordInfoResult {
  nsRecords: NSRecord[];
  nsToIpsInfo: NSToIPInfo[];
}

export interface NSRecordInfoData {
  nsRecordInfo: NSRecordInfoResult | null;
}

// IP Hopping Visualization Types
export interface IPLocation {
  ipAddress: string;
  latitude: number;
  longitude: number;
}

export interface TimeGroup {
  timestamp: string;
  ips: IPLocation[];
}

export interface IPHoppingVisualizationResult {
  domainId: number;
  timeGroups: TimeGroup[];
}

export interface IPHoppingVisualizationData {
  ipHoppingVisualization: IPHoppingVisualizationResult | null;
}