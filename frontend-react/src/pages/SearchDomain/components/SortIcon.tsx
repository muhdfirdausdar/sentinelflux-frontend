import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Column } from '@tanstack/react-table';

interface SortIconProps {
  column: Column<any, unknown>;
}

export const SortIcon: React.FC<SortIconProps> = ({ column }) => {
  const sorted = column.getIsSorted();
  
  if (sorted === 'asc') return <ChevronUp className="w-4 h-4" />;
  if (sorted === 'desc') return <ChevronDown className="w-4 h-4" />;
  return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
};
