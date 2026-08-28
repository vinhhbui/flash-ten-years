export const TARGET_TIME = new Date("2026-08-30T10:00:00+07:00").getTime();
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const HOUR_IN_MS = 60 * 60 * 1000;
export const MINUTE_IN_MS = 60 * 1000;

export type CountdownUnit = {
  label: "DAYS" | "HOURS" | "MINUTES" | "SECONDS";
  value: number;
};

export function getRemainingSeconds(now: number, debugOffset: number) {
  return Math.max(0, Math.ceil((TARGET_TIME - now - debugOffset) / 1000));
}

export function getVisibleUnits(totalSeconds: number): CountdownUnit[] {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return [
      { label: "DAYS", value: days },
      { label: "HOURS", value: hours },
      { label: "MINUTES", value: minutes },
      { label: "SECONDS", value: seconds },
    ];
  }

  if (hours > 0) {
    return [
      { label: "HOURS", value: hours },
      { label: "MINUTES", value: minutes },
      { label: "SECONDS", value: seconds },
    ];
  }

  return [
    { label: "MINUTES", value: minutes },
    { label: "SECONDS", value: seconds },
  ];
}
