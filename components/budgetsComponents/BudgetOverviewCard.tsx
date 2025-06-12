import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  budgets: BudgetModel[];
  progressAnim: Animated.Value;
}

const EnhancedBudgetOverviewCard: React.FC<Props> = ({
  budgets,
  progressAnim,
}) => {
  const budgetSummary = useMemo(() => {
    if (!budgets.length) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        progressPercentage: 0,
        activeBudgets: 0,
        expiredBudgets: 0,
        nearLimitBudgets: 0,
        averageDailySpending: 0,
        projectedMonthlySpending: 0,
        topSpendingCategory: null,
        daysUntilNextExpiry: null,
      };
    }

    const now = new Date();
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const progressPercentage =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Active vs expired budgets
    const activeBudgets = budgets.filter(
      (b) => new Date(b.end_date) >= now
    ).length;
    const expiredBudgets = budgets.length - activeBudgets;

    // Budgets near limit (>80% spent)
    const nearLimitBudgets = budgets.filter(
      (b) => b.amount > 0 && b.spent / b.amount > 0.8
    ).length;

    // Calculate average daily spending for active budgets
    const activeBudgetsData = budgets.filter(
      (b) => new Date(b.end_date) >= now
    );
    let totalDaysActive = 0;
    let totalSpentActive = 0;

    activeBudgetsData.forEach((budget) => {
      const startDate = new Date(budget.start_date);
      const daysSinceStart = Math.max(
        1,
        Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      totalDaysActive += daysSinceStart;
      totalSpentActive += budget.spent;
    });

    const averageDailySpending =
      totalDaysActive > 0 ? totalSpentActive / totalDaysActive : 0;
    const projectedMonthlySpending = averageDailySpending * 30;

    // Find top spending category
    const categorySpending = budgets.reduce((acc, budget) => {
      acc[budget.category] = (acc[budget.category] || 0) + budget.spent;
      return acc;
    }, {} as Record<string, number>);

    const topSpendingCategory =
      Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      null;

    // Days until next budget expires
    const upcomingExpiries = activeBudgetsData
      .map((b) =>
        Math.ceil(
          (new Date(b.end_date).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
      .filter((days) => days > 0)
      .sort((a, b) => a - b);

    const daysUntilNextExpiry = upcomingExpiries[0] || null;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      progressPercentage,
      activeBudgets,
      expiredBudgets,
      nearLimitBudgets,
      averageDailySpending,
      projectedMonthlySpending,
      topSpendingCategory,
      daysUntilNextExpiry,
    };
  }, [budgets]);

  const getStatusColor = () => {
    if (budgetSummary.progressPercentage <= 50) return "#4ECDC4";
    if (budgetSummary.progressPercentage <= 80) return "#FECA57";
    return "#FF6B6B";
  };

  const getStatusText = () => {
    if (budgetSummary.progressPercentage <= 50) return "On Track";
    if (budgetSummary.progressPercentage <= 80) return "Moderate";
    if (budgetSummary.progressPercentage <= 100) return "High Usage";
    return "Over Budget";
  };

  const formatCurrency = (amount: number) =>
    `RON ${Math.abs(amount).toFixed(2)}`;

  if (!budgets.length) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Feather name="pie-chart" size={48} color={colors.primary[400]} />
          <Text style={styles.emptyTitle}>No Budget Data</Text>
          <Text style={styles.emptySubtitle}>
            Create budgets to see your spending overview
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header with Status */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Budget Overview
          </Text>
          <Text style={styles.budgetCount}>
            {budgetSummary.activeBudgets} Active •{" "}
            {budgetSummary.expiredBudgets} Expired
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Total Progress</Text>
          <Text
            style={[styles.progressPercentage, { color: getStatusColor() }]}
          >
            {budgetSummary.progressPercentage.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(),
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    "0%",
                    `${Math.min(100, budgetSummary.progressPercentage)}%`,
                  ],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Main Amounts */}
      <View style={styles.amountsRow}>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Total Budget</Text>
          <Text style={styles.value}>
            {formatCurrency(budgetSummary.totalBudget)}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Spent</Text>
          <Text style={[styles.value, { color: "#FF6B6B" }]}>
            {formatCurrency(budgetSummary.totalSpent)}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Remaining</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  budgetSummary.totalRemaining >= 0 ? "#4ECDC4" : "#FF6B6B",
              },
            ]}
          >
            {budgetSummary.totalRemaining >= 0 ? "" : "-"}
            {formatCurrency(budgetSummary.totalRemaining)}
          </Text>
        </View>
      </View>

      {/* Insights Row */}
      <View style={styles.insightsRow}>
        <View style={styles.insightItem}>
          <View style={styles.insightIconContainer}>
            <Feather name="trending-up" size={16} color="#FECA57" />
          </View>
          <Text style={styles.insightLabel}>Daily Avg</Text>
          <Text style={styles.insightValue}>
            {formatCurrency(budgetSummary.averageDailySpending)}
          </Text>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightIconContainer}>
            <Feather name="calendar" size={16} color="#9B59B6" />
          </View>
          <Text style={styles.insightLabel}>Monthly Proj</Text>
          <Text style={styles.insightValue}>
            {formatCurrency(budgetSummary.projectedMonthlySpending)}
          </Text>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightIconContainer}>
            <Feather name="alert-triangle" size={16} color="#FF6B6B" />
          </View>
          <Text style={styles.insightLabel}>Near Limit</Text>
          <Text style={styles.insightValue}>
            {budgetSummary.nearLimitBudgets}
          </Text>
        </View>
      </View>

      {/* Additional Insights */}
      <View style={styles.additionalInsights}>
        {budgetSummary.topSpendingCategory && (
          <View style={styles.insightRow}>
            <Feather name="pie-chart" size={14} color={colors.textSecondary} />
            <Text style={styles.insightText}>
              Top category:{" "}
              <Text style={styles.insightHighlight}>
                {budgetSummary.topSpendingCategory}
              </Text>
            </Text>
          </View>
        )}

        {budgetSummary.daysUntilNextExpiry && (
          <View style={styles.insightRow}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.insightText}>
              Next budget expires in{" "}
              <Text style={styles.insightHighlight}>
                {budgetSummary.daysUntilNextExpiry} days
              </Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  budgetCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  progressSection: {
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },

  progressTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  amountColumn: {
    flex: 1,
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  insightsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  insightItem: {
    flex: 1,
    alignItems: "center",
  },

  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  insightLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: "center",
  },

  insightValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },

  additionalInsights: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 16,
    gap: 8,
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },

  insightHighlight: {
    color: colors.text,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default EnhancedBudgetOverviewCard;
