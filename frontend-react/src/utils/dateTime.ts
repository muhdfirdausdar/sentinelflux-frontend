/**
 * Date/Time Utility Functions
 * Handles timezone conversion and formatting for the application
 */

/**
 * Converts server UTC datetime string to user's local timezone
 * Forward conversion: Server (UTC) → User's Local Time
 * 
 * @param serverDateTime - Server datetime string in UTC format (e.g., "2025-08-11T05:44:22.749350+00:00")
 * @returns Date object in user's local timezone
 * 
 * @example
 * const serverTime = "2025-08-11T05:44:22.749350+00:00";
 * const localDate = utcToLocal(serverTime);
 * // If user is in UTC+8: localDate will represent 2025-08-11 13:44:22
 */
export const utcToLocal = (serverDateTime: string): Date => {
  try {
    // Parse the server datetime (handles various UTC formats)
    const date = new Date(serverDateTime);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // The Date object automatically converts to user's local timezone
    return date;
  } catch (error) {
    console.error('Invalid server datetime string:', serverDateTime, error);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Converts server UTC datetime to ISO string with user's local timezone offset
 * 
 * @param serverDateTime - Server datetime string in UTC format
 * @returns ISO string with timezone offset (e.g., "2025-08-11T13:44:22.75+08")
 * 
 * @example
 * const serverTime = "2025-08-11T05:44:22.749350+00:00";
 * const localISO = utcToLocalISO(serverTime);
 * // Returns: "2025-08-11T13:44:22.75+08" (if user is in UTC+8)
 */
export const utcToLocalISO = (serverDateTime: string): string => {
  try {
    const date = utcToLocal(serverDateTime);
    
    // Get timezone offset in minutes
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    // Format date parts
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    // Get milliseconds and round to 2 decimal places (centiseconds)
    const ms = date.getMilliseconds();
    const centiseconds = Math.floor(ms / 10).toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${centiseconds}${offsetString}`;
  } catch (error) {
    console.error('Error converting to local ISO:', serverDateTime, error);
    return serverDateTime; // Return original on error
  }
};

/**
 * Converts user's local datetime to server UTC format
 * Backward conversion: User's Local Time → Server (UTC)
 * 
 * @param localDate - Date object or datetime string in user's local timezone
 * @returns ISO 8601 datetime string in UTC format matching server format
 * 
 * @example
 * const localDate = new Date(); // User's local time
 * const serverFormat = localToUtc(localDate);
 * // Returns: "2025-08-11T05:44:22.749350+00:00"
 */
export const localToUtc = (localDate: Date | string): string => {
  try {
    const date = typeof localDate === 'string' ? new Date(localDate) : localDate;
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Convert to ISO string and ensure it ends with +00:00 format
    const isoString = date.toISOString();
    
    // Transform from "2025-08-11T05:44:22.749Z" to "2025-08-11T05:44:22.749350+00:00"
    const withMicroseconds = isoString.replace('Z', '000+00:00');
    
    return withMicroseconds;
  } catch (error) {
    console.error('Invalid local datetime:', localDate, error);
    // Return current time in server format as fallback
    return new Date().toISOString().replace('Z', '000+00:00');
  }
};

/**
 * Formats server UTC datetime to user's local datetime string
 * 
 * @param serverDateTime - Server datetime string in UTC format
 * @param format - Format type: 'full' | 'date' | 'time' | 'custom'
 * @param customOptions - Custom Intl.DateTimeFormatOptions
 * @returns Formatted datetime string in user's timezone
 * 
 * @example
 * const serverTime = "2025-08-11T05:44:22.749350+00:00";
 * formatServerDateTime(serverTime, 'full');
 * // Returns: "Aug 11, 2025, 1:44:22 PM" (if user is in UTC+8)
 */
export const formatServerDateTime = (
  serverDateTime: string,
  format: 'full' | 'date' | 'time' | 'custom' = 'full',
  customOptions?: Intl.DateTimeFormatOptions
): string => {
  const localDate = utcToLocal(serverDateTime);
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    full: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    },
    date: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    },
    custom: customOptions || {}
  };
  
  return localDate.toLocaleString(undefined, formatOptions[format]);
};

/**
 * Converts ISO string to user's local timezone
 * @param isoString - ISO 8601 datetime string (e.g., "2025-08-24T08:57:46.149674Z")
 * @returns Date object in user's local timezone
 * @deprecated Use utcToLocal instead for better clarity
 */
export const convertToUserTimezone = (isoString: string): Date => {
  return utcToLocal(isoString);
};

/**
 * Formats date to user's local date string
 * @param isoString - ISO 8601 datetime string
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string in user's locale
 */
export const formatToLocalDate = (
  isoString: string, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = convertToUserTimezone(isoString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Formats date to user's local datetime string
 * @param isoString - ISO 8601 datetime string
 * @param options - Intl.DateTimeFormatOptions for customization
 * @param includeTimezone - Whether to include timezone information
 * @returns Formatted datetime string in user's locale
 */
export const formatToLocalDateTime = (
  isoString: string,
  options?: Intl.DateTimeFormatOptions,
  includeTimezone: boolean = false
): string => {
  const date = convertToUserTimezone(isoString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  const formattedDate = date.toLocaleDateString(undefined, defaultOptions);
  
  if (includeTimezone) {
    const { offsetString } = getUserTimezone();
    return `${formattedDate} ${offsetString}`;
  }
  
  return formattedDate;
};

/**
 * Formats date to user's local time string only
 * @param isoString - ISO 8601 datetime string
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted time string in user's locale
 */
export const formatToLocalTime = (
  isoString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = convertToUserTimezone(isoString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };
  
  return date.toLocaleTimeString(undefined, defaultOptions);
};

/**
 * Gets relative time string (e.g., "2 hours ago", "3 days ago")
 * @param isoString - ISO 8601 datetime string
 * @returns Relative time string
 */
export const getRelativeTime = (isoString: string): string => {
  const date = convertToUserTimezone(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } else if (diffWeeks > 0) {
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Gets user's timezone information
 * @returns Object with timezone name and offset
 */
export const getUserTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const offsetHours = Math.floor(offset / 60);
  const offsetMinutes = offset % 60;
  const offsetString = `UTC${offset >= 0 ? '+' : ''}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
  
  return {
    timezone,
    offset,
    offsetString
  };
};

/**
 * Validates if a string is a valid ISO 8601 datetime
 * @param isoString - String to validate
 * @returns Boolean indicating if string is valid ISO datetime
 */
export const isValidISOString = (isoString: string): boolean => {
  try {
    const date = new Date(isoString);
    return date instanceof Date && !isNaN(date.getTime()) && isoString.includes('T');
  } catch {
    return false;
  }
};

/**
 * Formats date for table display with hover tooltip
 * @param isoString - ISO 8601 datetime string
 * @returns Object with display text and tooltip
 */
export const formatTableDate = (isoString: string) => {
  return {
    display: formatToLocalDate(isoString),
    tooltip: `${formatToLocalDateTime(isoString, undefined, true)} (${getRelativeTime(isoString)})`
  };
};

/**
 * Formats datetime for table display with hover tooltip
 * @param isoString - ISO 8601 datetime string
 * @returns Object with display text and tooltip
 */
export const formatTableDateTime = (isoString: string) => {
  return {
    display: formatToLocalDateTime(isoString),
    tooltip: `${formatToLocalDateTime(isoString, undefined, true)} (${getRelativeTime(isoString)})`
  };
};
