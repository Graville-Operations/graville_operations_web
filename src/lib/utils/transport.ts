import { ApiUser } from '@/types/users';

/** Masks a national ID so only the first and last 2 digits are visible, e.g. "40****78". */
export function maskNationalId(id: string): string {
  const digits = id.trim();
  if (digits.length <= 4) return digits;
  const first = digits.slice(0, 2);
  const last = digits.slice(-2);
  const hidden = '*'.repeat(digits.length - 4);
  return `${first}${hidden}${last}`;
}

/** Full name for a driver embedded in a ModeOfTransport response (driver.first_name/last_name). */
export function driverBriefName(d: { first_name: string; last_name: string }): string {
  return `${d.first_name} ${d.last_name}`.trim();
}

/** Full name for a driver picked from the /transport/drivers/list endpoint (ApiUser shape). */
export function apiUserFullName(u: ApiUser): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
}