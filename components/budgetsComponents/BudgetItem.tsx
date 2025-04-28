// components/budgets/BudgetItem.tsx

import { colors } from "@/constants/colors";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export type Budget = {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: "weekly" | "monthly" | "custom";
  startDate?: string;
  endDate?: string;
  threshold?: number;
  subBudgets?: SubBudget[];
  createdAt: string;
};

export type SubBudget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
};

type Props = {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  progressAnimation: Animated.AnimatedInterpolation<number>;
};

const BudgetItem = ({ budget, onEdit, onDelete, progressAnimation }: Props) => {
  const calculateRemainingDays = () => {
    if (!budget.endDate) return 0;
    const endDate = new Date(budget.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isPotentiallyOverspending = () => {
    if (!budget.startDate || !budget.endDate) return false;
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    const today = new Date();

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed =
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const percentTimePassed = (daysPassed / totalDays) * 100;
    const percentSpent = (budget.spent / budget.amount) * 100;

    return percentTimePassed < 50 && percentSpent > 70;
  };

  const getProgressColor = () => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage < 50) return colors.success;
    if (percentage < 75) return colors.primary[400];
    return colors.error;
  };

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, styles.editAction]}
        onPress={() => onEdit(budget)}
      >
        <Feather name="edit-2" size={20} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={() => onDelete(budget.id)}
      >
        <Feather name="trash-2" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.budgetCard}>
        <View style={styles.budgetCardHeader}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text style={styles.budgetCategory}>{budget.category}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: progressAnimation, backgroundColor: getProgressColor() },
            ]}
          />
        </View>

        <View style={styles.budgetCardFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.spentAmount}>
              {formatCurrency(budget.spent)}
            </Text>
            <Text style={styles.totalAmount}>
              {" "}
              / {formatCurrency(budget.amount)}
            </Text>
          </View>

          <Text style={styles.daysRemaining}>
            {calculateRemainingDays()}{" "}
            {calculateRemainingDays() === 1 ? "day" : "days"} left
          </Text>
        </View>

        {isPotentiallyOverspending() && (
          <View style={styles.warningBanner}>
            <Feather
              name="alert-triangle"
              size={14}
              color={colors.primary[500]}
            />
            <Text style={styles.warningText}>
              Spending faster than planned!
            </Text>
          </View>
        )}

        {budget.subBudgets && budget.subBudgets.length > 0 && (
          <View style={styles.subBudgetsPreview}>
            <Text style={styles.subBudgetsLabel}>Sub-budgets:</Text>
            {budget.subBudgets.map((sub) => (
              <View key={sub.id} style={styles.subBudgetPreviewItem}>
                <Text style={styles.subBudgetPreviewName}>{sub.name}</Text>
                <Text style={styles.subBudgetPreviewAmount}>
                  {formatCurrency(sub.spent)} / {formatCurrency(sub.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  // Copy only relevant styles from your big StyleSheet
  budgetCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  budgetCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  budgetCategory: {
    fontSize: 14,
    color: colors.primary[400],
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  budgetCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  totalAmount: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  daysRemaining: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: colors.primary[500],
    marginLeft: 8,
  },
  subBudgetsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  subBudgetsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  subBudgetPreviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  subBudgetPreviewName: {
    fontSize: 14,
    color: colors.text,
  },
  subBudgetPreviewAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    height: "100%",
  },
  swipeAction: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editAction: {
    backgroundColor: colors.secondary[500],
  },
  deleteAction: {
    backgroundColor: colors.error,
  },
});

export default BudgetItem;
