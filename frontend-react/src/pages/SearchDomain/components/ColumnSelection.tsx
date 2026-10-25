import React from 'react';
import { AVAILABLE_FIELDS, AvailableField } from '../types/fieldSelection';

interface ColumnSelectionProps {
  tempSelectedFields: AvailableField[];
  onFieldToggle: (fieldKey: AvailableField) => void;
  maxColumns: number;
  breakpointLabel: string;
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({
  tempSelectedFields,
  onFieldToggle,
  maxColumns,
  breakpointLabel
}) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm" style={{ color: 'var(--card-foreground)' }}>
          Column Selection
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Select up to {maxColumns} columns for {breakpointLabel.toLowerCase()} view. 
          Domain name is always visible.
        </p>
      </div>

      {/* Checkbox Flex Grid */}
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_FIELDS.map((field) => {
          const isSelected = tempSelectedFields.indexOf(field.key) >= 0;
          const isAlwaysVisible = field.alwaysVisible;
          const isDisabled = isAlwaysVisible || (!isSelected && tempSelectedFields.length >= maxColumns);

          return (
            <label
              key={field.key}
              className={`
                flex items-start gap-2 p-3 rounded-md border transition-colors cursor-pointer
                w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)]
                min-h-[4rem] flex-shrink-0
                ${isDisabled && !isAlwaysVisible ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                backgroundColor: isSelected ? 'var(--primary)/10' : 'var(--card)'
              }}
              onMouseEnter={(e) => {
                if (!isDisabled || isAlwaysVisible) {
                  e.currentTarget.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border)';
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onFieldToggle(field.key)}
                disabled={isDisabled}
                className="mt-0.5 h-4 w-4 rounded focus:ring-2 flex-shrink-0"
                style={{
                  accentColor: 'var(--primary)',
                  borderColor: 'var(--border)'
                }}
              />
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-medium text-sm truncate" style={{ color: 'var(--card-foreground)' }}>
                    {field.label}
                  </span>
                  {isAlwaysVisible && (
                    <span 
                      className="text-xs px-1 py-0.5 rounded flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                    {field.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnSelection;
