import { format } from 'date-fns';

/**
 * Formats the date and time for display.
 * @param dateTime - The date string to format.
 * @returns A formatted string representing the date and time.
 */
export const formatDateTime = (dateTime: Date): string => {
    return format(new Date(dateTime), "EEEE, MMMM d, yyyy 'at' h:mm a");
}; 