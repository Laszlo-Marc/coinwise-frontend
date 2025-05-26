// Calculate percentage progress: current / target * 100, capped at 100%
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0; // avoid division by zero
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

// Format number as currency (e.g., $1,234.56), using Intl API
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
