export const isDateBookable = (date: Date) => {
  const now = new Date();
  const earliestBookableDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return date >= earliestBookableDate;
}; 