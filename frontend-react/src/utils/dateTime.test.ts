/**
 * DateTime Utility Test Examples
 * 
 * This file demonstrates how the datetime utilities work with timezone display
 */

import { 
  formatTableDate, 
  formatToLocalDateTime, 
  getUserTimezone 
} from './dateTime';

// Example ISO string from the backend
const exampleISOString = "2025-08-24T08:57:46.149674Z";

// Test the timezone functionality
console.log('=== DateTime Timezone Test ===');

// Get user timezone info
const timezoneInfo = getUserTimezone();
console.log('User Timezone:', timezoneInfo);
// Example output: { timezone: 'Asia/Singapore', offset: 480, offsetString: 'UTC+8:00' }

// Format for table display
const tableDate = formatTableDate(exampleISOString);
console.log('Table Date Display:', tableDate.display);
console.log('Table Date Tooltip:', tableDate.tooltip);
// Example output:
// Display: "Aug 24, 2025"
// Tooltip: "Aug 24, 2025, 4:57 PM UTC+8:00 (2 hours ago)"

// Format with timezone
const dateTimeWithTZ = formatToLocalDateTime(exampleISOString, undefined, true);
console.log('DateTime with Timezone:', dateTimeWithTZ);
// Example output: "Aug 24, 2025, 4:57 PM UTC+8:00"

// Format without timezone
const dateTimeWithoutTZ = formatToLocalDateTime(exampleISOString);
console.log('DateTime without Timezone:', dateTimeWithoutTZ);
// Example output: "Aug 24, 2025, 4:57 PM"

/*
Expected behavior for different timezones:

UTC+0 (London):    "Aug 24, 2025, 8:57 AM UTC+0:00"
UTC+8 (Singapore): "Aug 24, 2025, 4:57 PM UTC+8:00"
UTC-5 (New York):  "Aug 24, 2025, 3:57 AM UTC-5:00"
UTC-8 (LA):        "Aug 24, 2025, 12:57 AM UTC-8:00"
*/
