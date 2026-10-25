# DateTime Utility Module

## Overview
This module provides comprehensive datetime handling utilities for converting ISO 8601 datetime strings to the user's local timezone.

## Key Features

### Timezone Conversion
- Automatically detects user's local timezone
- Converts UTC timestamps to local time
- Handles ISO 8601 format strings like `2025-08-24T08:57:46.149674Z`

### Formatting Options
- **Local Date**: `Aug 24, 2025`
- **Local DateTime**: `Aug 24, 2025, 2:57 PM`
- **Local Time**: `2:57:46 PM`
- **Relative Time**: `2 hours ago`, `3 days ago`

### Table Integration
- Optimized for table display
- Includes hover tooltips with full datetime, timezone, and relative time
- Consistent formatting across all date columns
- **Timezone Display**: Shows user's timezone offset (e.g., UTC+8:00, UTC-5:00)

## Usage Examples

```typescript
import { 
  formatTableDate, 
  formatToLocalDateTime, 
  getRelativeTime 
} from '@/utils/dateTime';

// For table cells
const dateInfo = formatTableDate('2025-08-24T08:57:46.149674Z');
// Returns: { 
//   display: 'Aug 24, 2025', 
//   tooltip: 'Aug 24, 2025, 4:57 PM UTC+8:00 (2 hours ago)' 
// }

// For detailed datetime display with timezone
const localDateTime = formatToLocalDateTime('2025-08-24T08:57:46.149674Z', undefined, true);
// Returns: 'Aug 24, 2025, 4:57 PM UTC+8:00'

// For detailed datetime display without timezone
const localDateTime = formatToLocalDateTime('2025-08-24T08:57:46.149674Z');
// Returns: 'Aug 24, 2025, 4:57 PM'

// For relative time
const relativeTime = getRelativeTime('2025-08-24T08:57:46.149674Z');
// Returns: '2 hours ago'
```

## Timezone Examples

For input `2025-08-24T08:57:46.149674Z` (UTC), different users will see:

- **UTC+0 (London)**: `Aug 24, 2025, 8:57 AM UTC+0:00`
- **UTC+8 (Singapore)**: `Aug 24, 2025, 4:57 PM UTC+8:00`
- **UTC-5 (New York)**: `Aug 24, 2025, 3:57 AM UTC-5:00`
- **UTC-8 (Los Angeles)**: `Aug 24, 2025, 12:57 AM UTC-8:00`

## Functions

### `convertToUserTimezone(isoString)`
Converts ISO string to Date object in user's timezone.

### `formatToLocalDate(isoString, options?)`
Formats to local date string (no time).

### `formatToLocalDateTime(isoString, options?, includeTimezone?)`
Formats to local datetime string with optional timezone display.

### `formatToLocalTime(isoString, options?)`
Formats to time string only.

### `getRelativeTime(isoString)`
Returns human-readable relative time.

### `getUserTimezone()`
Gets user's timezone information including offset string.

### `formatTableDate(isoString)`
Optimized for table display with timezone-aware tooltip.

### `formatTableDateTime(isoString)`
Optimized for table datetime display with timezone-aware tooltip.

## Implementation in Columns

Updated both `last_seen` and `ip_last_seen` columns to use:
```typescript
cell: (info) => {
  const dateInfo = formatTableDate(info.getValue());
  return (
    <div 
      className="text-sm text-gray-600 dark:text-gray-400"
      title={dateInfo.tooltip}
    >
      {dateInfo.display}
    </div>
  );
}
```

## Benefits

1. **User Experience**: Dates display in user's local timezone
2. **Consistency**: Standardized formatting across the application
3. **Accessibility**: Clear tooltips with full information
4. **Internationalization**: Respects user's locale settings
5. **Error Handling**: Graceful fallbacks for invalid dates
