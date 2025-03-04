/**
 * Timezone detection utility functions
 */

import { timezones } from '@/data/timezones';

/**
 * Get user's timezone based on browser's timezone
 * @returns {string} Timezone ID (e.g., 'America/New_York')
 */
export const getBrowserTimezone = (): string => {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
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

    return '';
  } catch (error) {
    console.error('Error getting browser timezone:', error);
    return '';
  }
};

/**
 * Get user's location and timezone using browser's geolocation API
 * @returns {Promise<{ timezone: string; error?: string }>} Object containing timezone and optional error
 */
export const getUserTimezone = async (): Promise<{ timezone: string; error?: string }> => {
  // First try to get timezone directly from browser
  const browserTimezone = getBrowserTimezone();
  if (browserTimezone) {
    return { timezone: browserTimezone };
  }

  // If browser timezone is not available, try geolocation
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      resolve({ timezone: '', error: 'Geolocation is not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          
          // Use the TimeZoneDB API to get timezone from coordinates
          const response = await fetch(
            `https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.NEXT_PUBLIC_TIMEZONEDB_API_KEY}&format=json&by=position&lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch timezone');
          }

          const data = await response.json();
          console.log('TimeZoneDB response:', data);
          
          if (data.status === 'OK' && data.zoneName) {
            // Find matching timezone in our options
            const matchingTimezone = timezones.find(tz => tz.id === data.zoneName);
            if (matchingTimezone) {
              return resolve({ timezone: matchingTimezone.id });
            }
            
            // If no exact match, try to find a timezone in the same region
            const region = data.zoneName.split('/')[0];
            const fallbackTimezone = timezones.find(tz => tz.id.startsWith(`${region}/`));
            if (fallbackTimezone) {
              return resolve({ timezone: fallbackTimezone.id });
            }
          }
          
          throw new Error('Invalid timezone data received');
        } catch (error) {
          console.error('Error getting timezone from coordinates:', error);
          resolve({ timezone: '', error: 'Failed to determine timezone' });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve({ timezone: '', error: 'Location access denied' });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}; 