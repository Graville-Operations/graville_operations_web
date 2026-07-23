
export function formatPermitDate(val: string | null | undefined): string {
  if (!val || val === "null" || val === "undefined") return "—";
  return val;
}