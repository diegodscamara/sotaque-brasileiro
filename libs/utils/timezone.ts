/**
 * Timezone detection utility functions
 */

import { timezones } from '@/data/timezones';

/**
 * Convert UTC offset to closest IANA timezone
 * @param {string} utcOffset - UTC offset (e.g., 'UTC-08:00')
 * @returns {string} IANA timezone ID
 */
const convertUTCOffsetToTimezone = (utcOffset: string): string => {
  try {
    console.log(`Converting UTC offset: ${utcOffset}`);
    
    // Direct mapping for common UTC offsets
    const directMapping: Record<string, string> = {
      'UTC-12:00': 'Etc/GMT+12',  // Note: Etc/GMT+ is opposite of UTC-
      'UTC-11:00': 'Etc/GMT+11',
      'UTC-10:00': 'Pacific/Honolulu',
      'UTC-09:00': 'America/Anchorage',
      'UTC-08:00': 'America/Los_Angeles',
      'UTC-07:00': 'America/Denver',
      'UTC-06:00': 'America/Chicago',
      'UTC-05:00': 'America/New_York',
      'UTC-04:00': 'America/Halifax',
      'UTC-03:00': 'America/Sao_Paulo',
      'UTC-02:00': 'Etc/GMT+2',
      'UTC-01:00': 'Atlantic/Azores',
      'UTC+00:00': 'Etc/UTC',
      'UTC+01:00': 'Europe/London',
      'UTC+02:00': 'Europe/Paris',
      'UTC+03:00': 'Europe/Moscow',
      'UTC+04:00': 'Asia/Dubai',
      'UTC+05:00': 'Asia/Karachi',
      'UTC+05:30': 'Asia/Kolkata',
      'UTC+06:00': 'Asia/Dhaka',
      'UTC+07:00': 'Asia/Bangkok',
      'UTC+08:00': 'Asia/Shanghai',
      'UTC+09:00': 'Asia/Tokyo',
      'UTC+10:00': 'Australia/Sydney',
      'UTC+11:00': 'Pacific/Noumea',
      'UTC+12:00': 'Pacific/Auckland',
      'UTC+13:00': 'Pacific/Apia',
    };
    
    // Check if we have a direct mapping for this UTC offset
    if (directMapping[utcOffset]) {
      console.log(`Found direct mapping for ${utcOffset}: ${directMapping[utcOffset]}`);
      return directMapping[utcOffset];
    }
    
    // Extract hours and minutes from UTC offset
    const match = utcOffset.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) {
      console.log(`No match found for UTC offset: ${utcOffset}, returning Etc/UTC`);
      return 'Etc/UTC';
    }

    const [, sign, hoursStr, minutesStr = '00'] = match;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.log(`Invalid hours or minutes in UTC offset: ${utcOffset}, returning Etc/UTC`);
      return 'Etc/UTC';
    }
    
    const totalMinutes = hours * 60 + minutes;
    const offsetMinutes = sign === '-' ? totalMinutes : -totalMinutes;
    
    console.log(`Parsed offset: ${sign}${hours}:${minutes}, total minutes: ${offsetMinutes}`);
    
    // Map common UTC offsets directly to IANA timezones
    const commonOffsets: Record<string, string> = {
      '-12:00': 'Etc/GMT+12',  // Note: Etc/GMT+ is opposite of UTC-
      '-11:00': 'Etc/GMT+11',
      '-10:00': 'Pacific/Honolulu',
      '-09:00': 'America/Anchorage',
      '-08:00': 'America/Los_Angeles',
      '-07:00': 'America/Denver',
      '-06:00': 'America/Chicago',
      '-05:00': 'America/New_York',
      '-04:00': 'America/Halifax',
      '-03:00': 'America/Sao_Paulo',
      '-02:00': 'Etc/GMT+2',
      '-01:00': 'Atlantic/Azores',
      '+00:00': 'Etc/UTC',
      '+01:00': 'Europe/London',
      '+02:00': 'Europe/Paris',
      '+03:00': 'Europe/Moscow',
      '+04:00': 'Asia/Dubai',
      '+05:00': 'Asia/Karachi',
      '+05:30': 'Asia/Kolkata',
      '+06:00': 'Asia/Dhaka',
      '+07:00': 'Asia/Bangkok',
      '+08:00': 'Asia/Shanghai',
      '+09:00': 'Asia/Tokyo',
      '+10:00': 'Australia/Sydney',
      '+11:00': 'Pacific/Noumea',
      '+12:00': 'Pacific/Auckland',
      '+13:00': 'Pacific/Apia',
    };
    
    const offsetKey = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    if (commonOffsets[offsetKey]) {
      console.log(`Found common offset mapping for ${offsetKey}: ${commonOffsets[offsetKey]}`);
      return commonOffsets[offsetKey];
    }
    
    // If not a common offset, find the closest timezone by offset
    console.log(`Finding closest timezone for offset: ${offsetMinutes} minutes`);
    
    // Use Etc/GMT+X or Etc/GMT-X for exact hour offsets
    if (minutes === 0 && hours <= 12) {
      // Note: Etc/GMT+ is opposite of UTC-
      const etcGmtSign = sign === '-' ? '+' : '-';
      const etcTimezone = `Etc/GMT${etcGmtSign}${hours}`;
      console.log(`Using Etc timezone: ${etcTimezone}`);
      return etcTimezone;
    }
    
    // For other offsets, find the closest match from our timezone list
    const now = new Date();
    let closestTimezone = { id: 'Etc/UTC', offset: 0, difference: 24 * 60 }; // Max difference is 24 hours
    
    for (const tz of timezones) {
      try {
        // Skip non-IANA timezones
        if (!tz.id.includes('/')) continue;
        
        // Get the timezone offset in minutes
        const tzDate = new Date(now);
        const formatter = new Intl.DateTimeFormat('en-US', { 
          timeZone: tz.id, 
          timeZoneName: 'longOffset' 
        });
        
        const formattedDate = formatter.format(tzDate);
        const tzOffsetMatch = formattedDate.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        
        if (!tzOffsetMatch) continue;
        
        const [, tzSign, tzHoursStr, tzMinutesStr = '00'] = tzOffsetMatch;
        const tzHours = parseInt(tzHoursStr, 10);
        const tzMinutes = parseInt(tzMinutesStr, 10);
        
        if (isNaN(tzHours) || isNaN(tzMinutes)) continue;
        
        const tzTotalMinutes = tzHours * 60 + tzMinutes;
        const tzOffsetMinutes = tzSign === '-' ? tzTotalMinutes : -tzTotalMinutes;
        
        const difference = Math.abs(tzOffsetMinutes - offsetMinutes);
        
        if (difference < closestTimezone.difference) {
          closestTimezone = { 
            id: tz.id, 
            offset: tzOffsetMinutes, 
            difference 
          };
          
          // If exact match, break early
          if (difference === 0) break;
        }
      } catch (err) {
        // Skip this timezone if there's an error
        continue;
      }
    }
    
    console.log(`Closest timezone found: ${closestTimezone.id} with offset difference of ${closestTimezone.difference} minutes`);
    return closestTimezone.id;
  } catch (error) {
    console.error('Error converting UTC offset:', error);
    return 'Etc/UTC';
  }
};

/**
 * Get user's timezone based on browser's timezone
 * @returns {string} Timezone ID (e.g., 'America/New_York')
 */
export const getBrowserTimezone = (): string => {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`Browser detected timezone: ${detectedTimezone}`);
    
    // Handle UTC offset format
    if (detectedTimezone.startsWith('UTC')) {
      const convertedTimezone = convertUTCOffsetToTimezone(detectedTimezone);
      console.log(`Converted UTC offset to IANA timezone: ${convertedTimezone}`);
      return convertedTimezone;
    }
    
    // Find the matching timezone in our options
    const matchingTimezone = timezones.find(tz => tz.id === detectedTimezone);
    if (matchingTimezone) {
      return matchingTimezone.id;
    }
    
    // If no exact match, try to find a timezone in the same region
    const region = detectedTimezone.split('/')[0];
    const fallbackTimezone = timezones.find(tz => tz.id.startsWith(`${region}/`));
    if (fallbackTimezone) {
      return fallbackTimezone.id;
    }

    console.log(`No matching timezone found, using Etc/UTC`);
    return 'Etc/UTC';
  } catch (error) {
    console.error('Error getting browser timezone:', error);
    return 'Etc/UTC';
  }
};

/**
 * Get the user's timezone using the browser's Intl API
 * @returns {Promise<{ timezone: string; error?: string }>} The detected timezone or an error
 */
export const getUserTimezone = async () => {
  try {
    const timezone = getBrowserTimezone();
    
    if (!timezone) {
      return { timezone: 'Etc/UTC', error: "Could not detect timezone" };
    }

    return { timezone };
  } catch (error) {
    console.error("Error detecting timezone:", error);
    return { timezone: 'Etc/UTC', error: "Failed to detect timezone" };
  }
};

/**
 * Standardizes a date by converting it to UTC
 * @param {Date} date - The date to standardize
 * @returns {Date} The standardized date in UTC
 */
export function standardizeDate(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ));
}

/**
 * Safely converts a timezone string to a valid IANA timezone
 * @param {string} timezone - The timezone to convert
 * @returns {string} A valid IANA timezone
 */
export function ensureValidTimezone(timezone: string): string {
  // If it's a UTC offset, convert it
  if (timezone.startsWith('UTC')) {
    try {
      const ianaTimezone = convertUTCOffsetToTimezone(timezone);
      console.log(`Converted ${timezone} to ${ianaTimezone}`);
      return ianaTimezone;
    } catch (error) {
      console.error(`Error converting ${timezone}:`, error);
      return 'Etc/UTC';
    }
  }
  
  // Verify it's a valid IANA timezone
  try {
    // This will throw if the timezone is invalid
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return timezone;
  } catch (e) {
    console.error(`Invalid timezone: ${timezone}, falling back to Etc/UTC`);
    return 'Etc/UTC';
  }
}

/**
 * Converts a date from UTC to a specific timezone
 * @param {Date} utcDate - The UTC date to convert
 * @param {string} timezone - The timezone to convert to (e.g., 'America/New_York')
 * @returns {Date} The date in the specified timezone
 */
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  try {
    // Ensure we have a valid IANA timezone
    const validTimezone = ensureValidTimezone(timezone);
    
    // Create a formatter with the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: validTimezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    
    // Format the date in the target timezone
    const parts = formatter.formatToParts(utcDate);
    
    // Extract the parts
    const year = parseInt(parts.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(parts.find(part => part.type === 'month')?.value || '0') - 1; // Months are 0-indexed
    const day = parseInt(parts.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(part => part.type === 'second')?.value || '0');
    
    // Create a new date with the timezone-adjusted values
    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.error('Error converting to timezone:', error);
    // Return the original date if conversion fails
    return utcDate;
  }
}

/**
 * Formats a date according to the user's timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - The user's timezone
 * @param {string} format - The format to use (e.g., 'HH:mm', 'yyyy-MM-dd')
 * @returns {string} The formatted date
 */
export function formatDateInTimezone(date: Date, timezone: string, format: string = 'HH:mm'): string {
  try {
    // Ensure we have a valid IANA timezone
    const validTimezone = ensureValidTimezone(timezone);
    
    // Convert the date to the user's timezone
    const dateInTimezone = convertToTimezone(date, validTimezone);
    
    // Format the date according to the specified format
    if (format === 'HH:mm') {
      return `${dateInTimezone.getHours().toString().padStart(2, '0')}:${dateInTimezone.getMinutes().toString().padStart(2, '0')}`;
    } else if (format === 'yyyy-MM-dd') {
      return `${dateInTimezone.getFullYear()}-${(dateInTimezone.getMonth() + 1).toString().padStart(2, '0')}-${dateInTimezone.getDate().toString().padStart(2, '0')}`;
    }
    
    // Default to ISO string
    return dateInTimezone.toISOString();
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    // Return a fallback format if conversion fails
    return date.toISOString();
  }
}

/**
 * Creates a time slot ID that is consistent regardless of time zone
 * @param {string} dateStr - The date string (YYYY-MM-DD)
 * @param {Date} startDateTime - The start date and time
 * @param {Date} endDateTime - The end date and time
 * @returns {string} The time slot ID
 */
export function createTimeSlotId(dateStr: string, startDateTime: Date, endDateTime: Date): string {
  // Format times in UTC to ensure consistency
  const startHour = startDateTime.getUTCHours().toString().padStart(2, '0');
  const startMinute = startDateTime.getUTCMinutes().toString().padStart(2, '0');
  const endHour = endDateTime.getUTCHours().toString().padStart(2, '0');
  const endMinute = endDateTime.getUTCMinutes().toString().padStart(2, '0');
  
  return `${dateStr}-${startHour}:${startMinute}-${endHour}:${endMinute}`;
}

/**
 * Creates a consistent representation of a time slot with both UTC and local times
 * @param {Date} startDateTime - The start date and time in UTC
 * @param {Date} endDateTime - The end date and time in UTC
 * @param {string} timezone - The timezone to display local times in
 * @returns {Object} An object with UTC and local time representations
 */
export function createTimeSlotRepresentation(
  startDateTime: Date, 
  endDateTime: Date, 
  timezone: string
): {
  utcStart: string;
  utcEnd: string;
  localStart: string;
  localEnd: string;
  localDate: string;
  displayTime: string;
} {
  // Ensure dates are in UTC
  const utcStart = standardizeDate(startDateTime);
  const utcEnd = standardizeDate(endDateTime);
  
  // Format local times
  const localStart = formatDateInTimezone(utcStart, timezone, 'HH:mm');
  const localEnd = formatDateInTimezone(utcEnd, timezone, 'HH:mm');
  const localDate = formatDateInTimezone(utcStart, timezone, 'yyyy-MM-dd');
  
  return {
    utcStart: utcStart.toISOString(),
    utcEnd: utcEnd.toISOString(),
    localStart,
    localEnd,
    localDate,
    displayTime: `${localStart}-${localEnd}`
  };
} 