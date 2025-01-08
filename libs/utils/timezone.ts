export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}; 