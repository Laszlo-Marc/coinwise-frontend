export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculatePercentage = (current: number, target: number) => {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Math.max(0, percentage));
};
