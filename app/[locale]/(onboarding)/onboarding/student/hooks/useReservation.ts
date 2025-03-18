import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook return type for reservation management
 */
interface UseReservationReturn {
  currentReservation: string | null;
  reservationExpiry: Date | null;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
  createReservation: (slotId: string) => Promise<void>;
  cancelReservation: () => Promise<void>;
  handleRefreshAvailability: () => Promise<void>;
}

/**
 * Custom hook for managing time slot reservations
 * @param refreshCallback - Callback function to refresh availability data
 * @returns {UseReservationReturn} The reservation state and handlers
 */
export function useReservation(
  refreshCallback: () => Promise<void>
): UseReservationReturn {
  const [currentReservation, setCurrentReservation] = useState<string | null>(null);
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  // Store the expiry timer
  const expiryTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Clear the reservation when it expires
  const clearReservation = useCallback(() => {
      setCurrentReservation(null);
      setReservationExpiry(null);
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = undefined;
    }
  }, []);

  // Create a new reservation
  const createReservation = useCallback(async (slotId: string) => {
    try {
      // Clear any existing reservation first
      clearReservation();
      
      // Set a mock reservation for development
      // In a real app, this would call a server action
      console.log(`Creating reservation for slot: ${slotId}`);
      
      // Set temporary reservation data (in production this would come from API)
      setCurrentReservation(slotId);
      
      // Create expiry time (10 minutes from now)
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 10);
      setReservationExpiry(expiry);
      
      // Set up timer to clear reservation when it expires
      if (expiryTimer.current) {
        clearTimeout(expiryTimer.current);
      }
      
      expiryTimer.current = setTimeout(() => {
        clearReservation();
      }, 10 * 60 * 1000); // 10 minutes
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      clearReservation();
    }
  }, [clearReservation]);

  // Cancel the current reservation
  const cancelReservation = useCallback(async () => {
    if (!currentReservation) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/reservations/${currentReservation}`, {
        method: "DELETE"
      });
      
      clearReservation();
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      throw new Error("Failed to cancel reservation");
    }
  }, [currentReservation, clearReservation]);

  // Handle refreshing availability
  const handleRefreshAvailability = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await refreshCallback();
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Error refreshing availability:", err);
      throw new Error("Failed to refresh availability");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshCallback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (expiryTimer.current) {
        clearTimeout(expiryTimer.current);
      }
    };
  }, []);

  return {
    currentReservation,
    reservationExpiry,
    isRefreshing,
    lastRefreshTime,
    createReservation,
    cancelReservation,
    handleRefreshAvailability
  };
} 