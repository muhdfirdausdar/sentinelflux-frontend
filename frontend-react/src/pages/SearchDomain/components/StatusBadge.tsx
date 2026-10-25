import React from 'react';
import { cn } from '@/lib/utils';
import { StatusTag } from '../types/domain';

interface StatusBadgeProps {
  tags: StatusTag[];
  maxTags?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tags, maxTags = 3 }) => {
  // Get CSS class for status type using CSS variables
  const getStatusClass = (label: string): string => {
    const normalizedLabel = label.toLowerCase().replace(/[^a-z]/g, '');
    return `status-badge--${normalizedLabel}`;
  };

  // Fallback function for custom colors not in CSS variables
  const getCustomStyle = (tag: StatusTag) => {
    if (tag.color && tag.color.startsWith('#')) {
      return {
        color: tag.color,
        backgroundColor: `${tag.color}20`,
        borderColor: `${tag.color}40`,
      };
    }
    return {};
  };

  // Limit the number of tags displayed
  const displayTags = tags.slice(0, maxTags);
  const hasMoreTags = tags.length > maxTags;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className={cn(
            'status-badge',
            getStatusClass(tag.label)
          )}
          style={getCustomStyle(tag)}
          title={`Status: ${tag.label}`}
        >
          {tag.label}
        </span>
      ))}
      {hasMoreTags && (
        <span
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
          title={`+${tags.length - maxTags} more tags`}
        >
          +{tags.length - maxTags}
        </span>
      )}
    </div>
  );
};
