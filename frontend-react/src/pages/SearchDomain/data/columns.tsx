import { ColumnDef, CellContext } from '@tanstack/react-table';
import { DomainData, generateStatusTags } from '../types/domain';
import { StatusBadge } from '../components/StatusBadge';
import { formatTableDate } from '../../../utils/dateTime';
import { AvailableField } from '../types/fieldSelection';
import { Link } from 'react-router-dom';

// Utility function to format TTL seconds into a readable format
const formatTTLTooltip = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes} minutes ${remainingSeconds} seconds`
      : `${minutes} minutes`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0
      ? `${hours} hours ${remainingMinutes} minutes`
      : `${hours} hours`;
  } else {
    const days = Math.floor(seconds / 86400);
    const remainingHours = Math.floor((seconds % 86400) / 3600);
    return remainingHours > 0
      ? `${days} days ${remainingHours} hours`
      : `${days} days`;
  }
};

// Base column definitions for all available fields
const ALL_COLUMNS: Record<AvailableField, ColumnDef<DomainData>> = {
  domain_name: {
    accessorKey: 'domain_name',
    header: 'Domain',
    cell: ({ row }: CellContext<DomainData, unknown>) => (
      <Link 
        to={`/domain-details?dom_id=${row.original.id}`}
        className="font-medium font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        {row.getValue('domain_name')}
      </Link>
    ),
    enableSorting: true,
  },
  
  dom_last_seen: {
    accessorKey: 'dom_last_seen',
    header: 'Last Seen',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const dateInfo = formatTableDate(row.getValue('dom_last_seen'));
      return (
        <div 
          className="text-sm"
          style={{ color: 'var(--table-text-secondary)' }}
          title={dateInfo.tooltip}
        >
          {dateInfo.display}
        </div>
      );
    },
    enableSorting: true,
  },
  
  num_ips: {
    accessorKey: 'num_ips',
    header: 'IP Count',
    cell: ({ row }: CellContext<DomainData, unknown>) => (
      <div className="text-left">
        <span 
          className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)'
          }}
        >
          {row.getValue('num_ips')}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  
  num_ns: {
    accessorKey: 'num_ns',
    header: 'NS Count',
    cell: ({ row }: CellContext<DomainData, unknown>) => (
      <div className="text-left">
        <span 
          className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full"
          style={{
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)'
          }}
        >
          {row.getValue('num_ns')}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  
  domip_avg_ttl: {
    accessorKey: 'domip_avg_ttl',
    header: 'Avg IP TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domip_avg_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },

  domip_lowest_ttl: {
    accessorKey: 'domip_lowest_ttl',
    header: 'Min IP TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domip_lowest_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },

  domip_highest_ttl: {
    accessorKey: 'domip_highest_ttl',
    header: 'Max IP TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domip_highest_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },
  
  domip_last_seen: {
    accessorKey: 'domip_last_seen',
    header: 'IP Last Seen',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const dateInfo = formatTableDate(row.getValue('domip_last_seen'));
      return (
        <div 
          className="text-sm"
          style={{ color: 'var(--table-text-secondary)' }}
          title={dateInfo.tooltip}
        >
          {dateInfo.display}
        </div>
      );
    },
    enableSorting: true,
  },
  
  domns_avg_ttl: {
    accessorKey: 'domns_avg_ttl',
    header: 'Avg NS TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domns_avg_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },

  domns_lowest_ttl: {
    accessorKey: 'domns_lowest_ttl',
    header: 'Min NS TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domns_lowest_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },

  domns_highest_ttl: {
    accessorKey: 'domns_highest_ttl',
    header: 'Max NS TTL',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const ttlValue = row.getValue('domns_highest_ttl') as number;
      return (
        <div 
          className="text-sm text-left font-mono"
          style={{ color: 'var(--table-text-primary)' }}
          title={formatTTLTooltip(ttlValue)}
        >
          {ttlValue}s
        </div>
      );
    },
    enableSorting: true,
  },
  
  domns_last_seen: {
    accessorKey: 'domns_last_seen',
    header: 'NS Last Seen',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const dateInfo = formatTableDate(row.getValue('domns_last_seen'));
      return (
        <div 
          className="text-sm"
          style={{ color: 'var(--table-text-secondary)' }}
          title={dateInfo.tooltip}
        >
          {dateInfo.display}
        </div>
      );
    },
    enableSorting: true,
  },
  
  source_name: {
    accessorKey: 'source_name',
    header: 'Source',
    cell: ({ row }: CellContext<DomainData, unknown>) => (
      <div 
        className="text-sm max-w-32 truncate"
        style={{ color: 'var(--table-text-primary)' }}
        title={row.getValue('source_name') as string}
      >
        {row.getValue('source_name')}
      </div>
    ),
    enableSorting: true,
  },
  
  status_tags: {
    id: 'status_tags',
    header: 'Status/Tags',
    cell: ({ row }: CellContext<DomainData, unknown>) => {
      const tags = generateStatusTags(row.original);
      return <StatusBadge tags={tags} />;
    },
    enableSorting: false,
  },
};

// Function to create dynamic columns based on selected fields
export const createDynamicColumns = (selectedFields: AvailableField[]): ColumnDef<DomainData>[] => {
  return selectedFields.map(fieldKey => ALL_COLUMNS[fieldKey]).filter(Boolean);
};

// Export the original columns for backward compatibility
export const domainColumns = Object.values(ALL_COLUMNS);
