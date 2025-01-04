import { addBusinessDays, isBefore, setHours } from "date-fns";

export const isDateBookable = (date: Date) => {
  const now = new Date();
  const earliestBookableDate = setHours(addBusinessDays(now, 1), 9);
  return !isBefore(date, earliestBookableDate);
}; 