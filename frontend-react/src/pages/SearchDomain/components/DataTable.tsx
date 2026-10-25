import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DomainData } from '../types/domain';
import { createDynamicColumns } from '../data/columns';
import { AvailableField } from '../types/fieldSelection';

interface DataTableProps {
  data: DomainData[];
  selectedFields: AvailableField[];
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
  pagination: PaginationState;
  onPaginationChange: (updater: any) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  // Server pagination info
  totalData?: number;
  atData?: number;
  dataCount?: number;
  nextCursor?: string;
  currentCursor?: string;
  // Navigation handlers
  onFirstPage?: () => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  // Pagination state
  canGoToFirstPage?: boolean;
  canGoToPreviousPage?: boolean;
  canGoToNextPage?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  selectedFields,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  totalData = 0,
  atData = 1,
  dataCount = 0,
  nextCursor,
  currentCursor,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  canGoToFirstPage = true,
  canGoToPreviousPage = true,
  canGoToNextPage = true,
}) => {
  const navigate = useNavigate();
  
  // Create columns using existing function from columns.tsx
  const columns = React.useMemo(
    () => createDynamicColumns(selectedFields),
    [selectedFields]
  );

  // Handler for row click
  const handleRowClick = (domainId: string) => {
    navigate(`/domain-details?dom_id=${domainId}`);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange,
    onPaginationChange,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Remove getSortedRowModel since we're doing server-side sorting
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    // Disable manual sorting since we handle it server-side
    manualSorting: true,
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="table-search-container">
        <div className="overflow-x-auto">
          <table className="table-search-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="table-search-header">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() 
                              ? 'cursor-pointer select-none transition-colors' 
                              : ''
                          }`}
                          style={{
                            color: header.column.getCanSort() ? 'var(--primary)' : 'var(--table-text-primary)'
                          }}
                          onMouseEnter={(e) => {
                            if (header.column.getCanSort()) {
                              e.currentTarget.style.color = 'var(--primary-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (header.column.getCanSort()) {
                              e.currentTarget.style.color = 'var(--primary)';
                            }
                          }}
                          onClick={header.column.getCanSort() ? () => {
                            // Custom sorting handler that triggers server-side sort
                            const currentSort = sorting.find(s => s.id === header.column.id);
                            let newSorting: SortingState;
                            
                            if (!currentSort) {
                              // Not currently sorted, add ascending sort
                              newSorting = [{ id: header.column.id, desc: false }];
                              console.log('🔄 Sorting:', header.column.id, 'ASC');
                            } else if (!currentSort.desc) {
                              // Currently ascending, switch to descending
                              newSorting = [{ id: header.column.id, desc: true }];
                              console.log('🔄 Sorting:', header.column.id, 'DESC');
                            } else {
                              // Currently descending, remove sort
                              newSorting = [];
                              console.log('🔄 Clearing sort');
                            }
                            
                            console.log('📡 Triggering server-side sort with:', newSorting);
                            onSortingChange(newSorting);
                          } : undefined}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <div className="h-4 w-4 opacity-30">
                                  <ChevronsUpDown className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="table-search-row"
                  onClick={() => handleRowClick(row.original.id)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-search-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {table.getRowModel().rows.length === 0 && (
          <div className="table-search-empty">
            No domains found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div 
        className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--table-text-primary)' }}>
            Showing {atData} to {atData + dataCount - 1} of {totalData} results
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFirstPage}
            disabled={!canGoToFirstPage}
            className="px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--table-text-secondary)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              if (!canGoToFirstPage) return;
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent-foreground)';
            }}
            onMouseLeave={(e) => {
              if (!canGoToFirstPage) return;
              e.currentTarget.style.backgroundColor = 'var(--card)';
              e.currentTarget.style.color = 'var(--table-text-secondary)';
            }}
          >
            First
          </button>
          <button
            onClick={onPreviousPage}
            disabled={!canGoToPreviousPage}
            className="px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--table-text-secondary)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              if (!canGoToPreviousPage) return;
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent-foreground)';
            }}
            onMouseLeave={(e) => {
              if (!canGoToPreviousPage) return;
              e.currentTarget.style.backgroundColor = 'var(--card)';
              e.currentTarget.style.color = 'var(--table-text-secondary)';
            }}
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={!canGoToNextPage}
            className="px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--table-text-secondary)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              if (!canGoToNextPage) return;
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent-foreground)';
            }}
            onMouseLeave={(e) => {
              if (!canGoToNextPage) return;
              e.currentTarget.style.backgroundColor = 'var(--card)';
              e.currentTarget.style.color = 'var(--table-text-secondary)';
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
