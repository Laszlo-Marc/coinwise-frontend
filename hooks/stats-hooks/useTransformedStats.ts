import { colors } from "@/constants/colors";
import { ExpenseStats, IncomeStats, StatsOverview } from "@/models/stats";
import { useMemo } from "react";

// Used for chart rendering in the stats screen
export const useTransformedStats = ({
  activeTab,
  expenseStats,
  incomeStats,
  statsOverview,
  cashFlowData,
}: {
  activeTab: "spending" | "income" | "savings";
  expenseStats: ExpenseStats | null;
  incomeStats: IncomeStats | null;
  statsOverview: StatsOverview | null;
  cashFlowData: { period: string; net_flow: number }[];
}) => {
  // Unified trend selection
  const trendData = useMemo(() => {
    if (activeTab === "spending") return expenseStats?.trend || [];
    if (activeTab === "income") return incomeStats?.trend || [];
    if (activeTab === "savings") {
      return cashFlowData.map((d) => ({
        period: d.period,
        amount: d.net_flow,
        count: 0,
      }));
    }
    return [];
  }, [activeTab, expenseStats, incomeStats, cashFlowData]);

  // Format trendData for chart rendering
  const chartData = useMemo(() => {
    if (!trendData.length) {
      return {
        labels: ["No Data"],
        datasets: [
          { data: [0], color: () => colors.primary[400], strokeWidth: 2 },
        ],
      };
    }

    return {
      labels: trendData.map((item) => {
        const date = new Date(item.period + "-01");
        return date.toLocaleDateString("en-US", { month: "short" });
      }),
      datasets: [
        {
          data: trendData.map((item) => Math.abs(item.amount)),
          color: () => colors.primary[400],
          strokeWidth: 2,
        },
      ],
    };
  }, [trendData]);

  // Extract current tab total value and optionally change %
  const currentStats = useMemo(() => {
    if (!statsOverview) return { total: 0, change: 0 };

    switch (activeTab) {
      case "spending":
        return { total: statsOverview.totalExpenses, change: 0 };
      case "income":
        return { total: statsOverview.totalIncome, change: 0 };
      case "savings":
        return { total: statsOverview.balance, change: 0 };
      default:
        return { total: 0, change: 0 };
    }
  }, [statsOverview, activeTab]);

  // Format topCategories into pie chart format
  const pieData = useMemo(() => {
    const palette = [
      colors.primary[300],
      colors.secondary[300],
      "#E1B733",
      "#336060",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
    ];

    return (
      expenseStats?.topCategories?.slice(0, 8).map((category, index) => ({
        name: category.category,
        amount: category.totalSpent,
        color: palette[index % palette.length],
        legendFontColor: colors.text,
        legendFontSize: 12,
        percentage: Math.round(category.percentageOfTotal),
      })) || []
    );
  }, [expenseStats]);

  return {
    chartData,
    pieData,
    currentStats,
  };
};
