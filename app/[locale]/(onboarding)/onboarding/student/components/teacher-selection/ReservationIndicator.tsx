import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timer, ArrowsClockwise } from "@phosphor-icons/react";

interface ReservationIndicatorProps {
  t: ReturnType<typeof useTranslations>;
  reservationExpiry: Date;
  refreshAvailabilityData: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: Date;
  timeZone: string;
}

/**
 * Component for displaying the reservation status and expiry time
 * @param {ReservationIndicatorProps} props - Component props
 * @returns {React.JSX.Element} The reservation indicator component
 */
export default function ReservationIndicator({
  t,
  reservationExpiry,
  refreshAvailabilityData,
  isRefreshing,
  lastRefreshTime,
  timeZone
}: ReservationIndicatorProps): React.JSX.Element {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = reservationExpiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [reservationExpiry]);

  return (
    <Alert>
      <Timer className="w-4 h-4" />
      <AlertTitle>{t("step2.reservation.title")}</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <p>
            {t("step2.reservation.description", {
              timeLeft,
              timeZone
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAvailabilityData}
              disabled={isRefreshing}
              className="w-fit"
            >
              <ArrowsClockwise className="mr-2 w-4 h-4" />
              {t("step2.reservation.refreshButton")}
            </Button>
            {lastRefreshTime && (
              <span className="text-muted-foreground text-sm">
                {t("step2.reservation.lastRefresh", {
                  time: lastRefreshTime.toLocaleTimeString()
                })}
              </span>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
} 