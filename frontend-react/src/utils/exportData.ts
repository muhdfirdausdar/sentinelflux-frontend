/**
 * Utility functions for exporting domain data to CSV and JSON formats
 */

import type { 
  DomainDetailsSummary, 
  ARecordInfoResult, 
  NSRecordInfoResult 
} from '@/types/graphql';

/**
 * Combined domain data for export
 */
export interface ExportDomainData {
  summary: DomainDetailsSummary | null;
  aRecordInfo: ARecordInfoResult | null;
  nsRecordInfo: NSRecordInfoResult | null;
}

/**
 * Convert a value to CSV-safe string (handles quotes, commas, newlines)
 */
function csvEscape(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If the string contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Convert array data to CSV format
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => csvEscape(item[header]));
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export domain data as CSV
 */
export function exportAsCSV(data: ExportDomainData, domainName: string): void {
  const lines: string[] = [];
  
  // Summary Section
  if (data.summary) {
    lines.push('=== DOMAIN SUMMARY ===');
    lines.push(`Domain Name,${csvEscape(data.summary.domainName)}`);
    lines.push(`Domain ID,${data.summary.id}`);
    lines.push(`Domain Status,${csvEscape(data.summary.domainStatus)}`);
    lines.push(`Source Domain,${csvEscape(data.summary.sourceDomain)}`);
    lines.push(`Is Fast Flux,${data.summary.isFastFlux}`);
    lines.push(`Flux Type,${csvEscape(data.summary.fluxType)}`);
    lines.push(`First Seen,${csvEscape(data.summary.domFirstSeen)}`);
    lines.push(`Last Seen,${csvEscape(data.summary.domLastSeen)}`);
    lines.push(`Is Malicious,${data.summary.isMalicious}`);
    lines.push(`Malicious Source,${csvEscape(data.summary.sourceMalicious)}`);
    lines.push(`Malicious Type,${csvEscape(data.summary.maliciousType)}`);
    lines.push(`Last Malicious Update,${csvEscape(data.summary.lastMalUpdated)}`);
    lines.push(`Total A Records,${data.summary.totalARecords}`);
    lines.push(`Total NS Records,${data.summary.totalNsRecords}`);
    lines.push(`Total NS IPs,${data.summary.totalNsIps}`);
    lines.push(`A Record Change Frequency (per week),${data.summary.aChangeFrequencyPerWeek}`);
    lines.push(`NS Change Frequency (per week),${data.summary.nsChangeFrequencyPerWeek}`);
    lines.push('');
  }
  
  // A Records Section
  if (data.aRecordInfo && data.aRecordInfo.aRecords.length > 0) {
    lines.push('=== A RECORDS ===');
    const aRecordHeaders = [
      'id', 'ipId', 'ipAddress', 'ttl', 'lowestTtl', 'highestTtl',
      'firstSeen', 'lastSeen', 'lowestTtlTime', 'country', 'asnAso',
      'latitudeLongitude', 'maliciousTypes', 'maliciousSources'
    ];
    
    // Format malicious arrays as strings
    const formattedARecords = data.aRecordInfo.aRecords.map(record => ({
      ...record,
      maliciousTypes: record.maliciousTypes ? record.maliciousTypes.join('; ') : '',
      maliciousSources: record.maliciousSources ? record.maliciousSources.join('; ') : ''
    }));
    
    lines.push(arrayToCSV(formattedARecords, aRecordHeaders));
    lines.push('');
    
    // IP Reuse Info
    if (data.aRecordInfo.ipReuseInfo.length > 0) {
      lines.push('=== IP REUSE INFO ===');
      const ipReuseHeaders = ['ipId', 'ipAddress', 'totalRelationWithOtherDomains', 'totalRelationWithOtherNs'];
      lines.push(arrayToCSV(data.aRecordInfo.ipReuseInfo, ipReuseHeaders));
      lines.push('');
    }
  }
  
  // NS Records Section
  if (data.nsRecordInfo && data.nsRecordInfo.nsRecords.length > 0) {
    lines.push('=== NS RECORDS ===');
    const nsRecordHeaders = [
      'id', 'nameserverId', 'nameserver', 'ttl', 'lowestTtl',
      'firstSeen', 'lastSeen', 'lowestTtlTime'
    ];
    lines.push(arrayToCSV(data.nsRecordInfo.nsRecords, nsRecordHeaders));
    lines.push('');
    
    // NS to IP Info
    if (data.nsRecordInfo.nsToIpsInfo.length > 0) {
      lines.push('=== NS TO IP INFO ===');
      const nsToIpHeaders = [
        'ipId', 'ipAddress', 'nsId', 'nameserver', 'ipNsTtl', 'ipNsLowestTtl',
        'firstSeen', 'lastSeen', 'ipNsLowestTtlTime', 'country', 'asnAso'
      ];
      lines.push(arrayToCSV(data.nsRecordInfo.nsToIpsInfo, nsToIpHeaders));
      lines.push('');
    }
  }
  
  // Create CSV content
  const csvContent = lines.join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${domainName}_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export domain data as JSON
 */
export function exportAsJSON(data: ExportDomainData, domainName: string): void {
  // Create a structured JSON object
  const jsonData = {
    exportDate: new Date().toISOString(),
    domainName: domainName,
    summary: data.summary,
    aRecordInfo: data.aRecordInfo,
    nsRecordInfo: data.nsRecordInfo
  };
  
  // Convert to formatted JSON string
  const jsonContent = JSON.stringify(jsonData, null, 2);
  
  // Create and trigger download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${domainName}_export_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export DNS dig result data as TXT
 */
export function exportDigResultAsTXT(resultData: string, domainName: string, taskId: string): void {
  // Format the result data (replace \\n with actual newlines)
  const formattedData = resultData.replace(/\\n/g, '\n');
  
  // Create text content with header
  const txtContent = `DNS Dig Result Export
=====================
Export Date: ${new Date().toISOString()}
Domain Name: ${domainName}
Task ID: ${taskId}

${formattedData}`;
  
  // Create and trigger download
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${domainName}_dig_result_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
