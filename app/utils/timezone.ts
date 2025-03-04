/**
 * Utility functions for handling time zones consistently across the application
 */

/**
 * Converts a local date to UTC for storage in the database
 * @param {Date} localDate - The local date to convert
 * @returns {Date} The UTC date
 */
export function toUTC(localDate: Date): Date {
  return new Date(localDate.toISOString());
}

/**
 * Converts a UTC date from the database to a date object
 * @param {Date} utcDate - The UTC date to convert
 * @returns {Date} The date object
 */
export function fromUTC(utcDate: Date): Date {
  return new Date(utcDate);
}

/**
 * Standardizes a date by ensuring it's in UTC format
 * This function is used to ensure consistent date handling across the application
 * @param {Date} date - The date to standardize
 * @returns {Date} The standardized date in UTC
 */
export function standardizeDate(date: Date): Date {
  // Ensure we're working with a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  // Return a new Date object with the UTC time
  return new Date(dateObj.toISOString());
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
 * Logs date information for debugging time zone issues
 * @param {string} label - A label for the log
 * @param {Date} date - The date to log
 */
export function logDateInfo(label: string, date: Date): void {
  console.log(`${label}:`);
  console.log(`  - ISO string: ${date.toISOString()}`);
  console.log(`  - Local string: ${date.toString()}`);
  console.log(`  - UTC hours/minutes: ${date.getUTCHours()}:${date.getUTCMinutes()}`);
  console.log(`  - Local hours/minutes: ${date.getHours()}:${date.getMinutes()}`);
  console.log(`  - Browser timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
}

/**
 * Converts a date from UTC to a specific timezone
 * @param {Date} utcDate - The UTC date to convert
 * @param {string} timezone - The timezone to convert to (e.g., 'America/New_York')
 * @returns {Date} The date in the specified timezone
 */
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  // Create a formatter with the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
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
}

/**
 * Converts a date from a specific timezone to UTC
 * @param {Date} localDate - The local date in the specified timezone
 * @param {string} timezone - The timezone of the local date (e.g., 'America/New_York')
 * @returns {Date} The date in UTC
 */
export function convertFromTimezone(localDate: Date, timezone: string): Date {
  // Get the timezone offset for the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  
  // Format the date to get the timezone name
  const formattedDate = formatter.format(localDate);
  
  // Extract the timezone abbreviation
  const tzAbbr = formattedDate.split(' ').pop();
  
  // Create a date string with the timezone
  const dateString = `${localDate.toISOString().split('T')[0]}T${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}:${localDate.getSeconds().toString().padStart(2, '0')} ${tzAbbr}`;
  
  // Parse the date string to get a UTC date
  return new Date(dateString);
}

/**
 * Formats a date according to the user's timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - The user's timezone
 * @param {string} format - The format to use (e.g., 'HH:mm', 'yyyy-MM-dd')
 * @returns {string} The formatted date
 */
export function formatDateInTimezone(date: Date, timezone: string, format: string = 'HH:mm'): string {
  // Convert the date to the user's timezone
  const dateInTimezone = convertToTimezone(date, timezone);
  
  // Format the date according to the specified format
  // This is a simplified implementation - in a real app, you'd use a library like date-fns with timezone support
  if (format === 'HH:mm') {
    return `${dateInTimezone.getHours().toString().padStart(2, '0')}:${dateInTimezone.getMinutes().toString().padStart(2, '0')}`;
  } else if (format === 'yyyy-MM-dd') {
    return `${dateInTimezone.getFullYear()}-${(dateInTimezone.getMonth() + 1).toString().padStart(2, '0')}-${dateInTimezone.getDate().toString().padStart(2, '0')}`;
  }
  
  // Default to ISO string
  return dateInTimezone.toISOString();
}

/**
 * Logs a time conversion between UTC and a specific timezone
 * This is useful for debugging and understanding time conversions
 * @param {Date} utcDate - The UTC date
 * @param {string} timezone - The timezone to convert to
 * @param {string} label - A label for the log
 */
export function logTimeConversion(utcDate: Date, timezone: string, label: string = 'Time conversion'): void {
  const localTime = formatDateInTimezone(utcDate, timezone, 'HH:mm');
  const localDate = formatDateInTimezone(utcDate, timezone, 'yyyy-MM-dd');
  
  console.log(`${label}:`);
  console.log(`  - UTC time: ${utcDate.toISOString()}`);
  console.log(`  - Local time (${timezone}): ${localTime} on ${localDate}`);
  console.log(`  - UTC hours/minutes: ${utcDate.getUTCHours()}:${utcDate.getUTCMinutes()}`);
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