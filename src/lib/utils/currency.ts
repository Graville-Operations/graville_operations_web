export const formatKes = (n: number) =>
  n?.toLocaleString('en-KE', { minimumFractionDigits: 0 });
export function fmtKES(n: number): string {
  return `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}