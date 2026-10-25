import { gql } from '@apollo/client';

/**
 * Domain Fast Flux Lookup Query
 */
export const DOMAIN_FLUX_LOOKUP = gql`
  query DomainFluxLookup($domainName: String!) {
    domainFluxLookup(domainName: $domainName) {
      domainId
      status
      fastFluxFirstAnalysis
      fastFluxLastAnalysis
      fastFluxType
      everFastFlux
      reuseInfo {
        ipId
        totalDomainReused
      }
    }
  }
`;

export const DOMAIN_FLUX_HISTORY = gql`
  query DomainFluxHistory($domainName: String!, $fromDatetime: String, $untilDatetime: String) {
    domainFluxHistory(
      domainName: $domainName,
      fromDatetime: $fromDatetime,
      untilDatetime: $untilDatetime
    ) {
      domainId
      domainStatus
      domainFlux
    }
  }
`;

/**
 * Domain Details Summary Query
 */
export const DOMAIN_DETAILS_SUMMARY = gql`
  query DomDetailsSummary($domainId: Int!) {
    domDetailsSummary(domainId: $domainId) {
      id
      domainName
      domainStatus
      sourceDomain
      isFastFlux
      fluxType
      domFirstSeen
      domLastSeen
      isMalicious
      sourceMalicious
      maliciousType
      lastMalUpdated
      totalARecords
      totalNsRecords
      totalNsIps
      aChangeFrequencyPerWeek
      nsChangeFrequencyPerWeek
    }
  }
`;

/**
 * A Record Info Query
 */
export const A_RECORD_INFO = gql`
  query ARecordInfo($domainId: Int!) {
    aRecordInfo(domainId: $domainId) {
      aRecords {
        id
        ipId
        ipAddress
        ttl
        lowestTtl
        highestTtl
        firstSeen
        lastSeen
        lowestTtlTime
        country
        asnAso
        latitudeLongitude
        maliciousTypes
        maliciousSources
      }
      ipReuseInfo {
        ipId
        ipAddress
        totalRelationWithOtherDomains
        totalRelationWithOtherNs
      }
    }
  }
`;

/**
 * A Record Addon Query
 */
export const A_RECORD_ADDON = gql`
  query ARecordAddon($ipId: Int!, $domainId: Int!) {
    aRecordAddon(ipId: $ipId, domainId: $domainId) {
      relatedDomain {
        domainId
        domainName
        firstSeen
        lastSeen
        fluxType
        isMalicious
      }
      relatedNameserver {
        nameserverId
        nameserverName
        firstSeen
        lastSeen
        lowestTtl
        latestTtl
      }
    }
  }
`;

/**
 * NS Record Info Query
 */
export const NS_RECORD_INFO = gql`
  query NsRecordInfo($domainId: Int!) {
    nsRecordInfo(domainId: $domainId) {
      nsRecords {
        id
        nameserverId
        nameserver
        ttl
        lowestTtl
        firstSeen
        lastSeen
        lowestTtlTime
      }
      nsToIpsInfo {
        ipId
        ipAddress
        nsId
        nameserver
        ipNsTtl
        ipNsLowestTtl
        firstSeen
        lastSeen
        ipNsLowestTtlTime
        country
        asnAso
      }
    }
  }
`;

/**
 * IP Hopping Visualization Query
 */
export const IP_HOPPING_VISUALIZATION = gql`
  query IpHoppingVisualization($domainId: Int!, $daysBack: Int!) {
    ipHoppingVisualization(domainId: $domainId, daysBack: $daysBack) {
      domainId
      timeGroups {
        timestamp
        ips {
          ipAddress
          latitude
          longitude
        }
      }
    }
  }
`;
