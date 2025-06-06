import { colors } from "@/constants/colors";
import { formatCurrency } from "@/hooks/goals-helpers";
import { BudgetModel } from "@/models/budget";
import { GoalModel } from "@/models/goal";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  items: (GoalModel | BudgetModel)[];
  type: "goal" | "budget";
  navigateTo: string;
  onCreatePress?: () => void;
};

export default function ProgressCardSection({
  title,
  items,
  type,
  navigateTo,
  onCreatePress,
}: Props) {
  const isGoal = type === "goal";

  const renderProgress = (item: GoalModel | BudgetModel) => {
    const progress = isGoal
      ? (item as GoalModel).current_amount / (item as GoalModel).target_amount
      : (item as BudgetModel).spent / (item as BudgetModel).amount;

    const percentage = Math.min(progress * 100, 100);
    const isAtRisk = !isGoal && percentage > 80;

    return (
      <View key={item.id} style={styles.cardItem}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={styles.itemTitle}>
              {isGoal
                ? (item as GoalModel).title
                : (item as BudgetModel).category}
            </Text>
            <Text style={styles.itemAmount}>
              {isGoal
                ? `${formatCurrency(
                    (item as GoalModel).current_amount
                  )} of ${formatCurrency((item as GoalModel).target_amount)}`
                : `${formatCurrency(
                    (item as BudgetModel).spent
                  )} of ${formatCurrency((item as BudgetModel).amount)}`}
            </Text>
          </View>
          <Text style={[styles.itemPercentage, isAtRisk && styles.itemAtRisk]}>
            {Math.round(percentage)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: isGoal
                  ? "#3B82F6"
                  : isAtRisk
                  ? "#EF4444"
                  : "#22C55E",
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderPlaceholder = () => (
    <View style={styles.goalPlaceholder}>
      {isGoal ? (
        <Feather name="target" size={40} color={colors.textSecondary} />
      ) : (
        <AntDesign name="creditcard" size={40} color={colors.textSecondary} />
      )}
      <Text style={styles.statPlaceholderText}>
        {isGoal
          ? "Set your first savings goal"
          : "Create a budget to manage expenses"}
      </Text>
      <TouchableOpacity onPress={onCreatePress} style={styles.createButton}>
        <Text style={styles.createButtonText}>
          {isGoal ? "Create Goal" : "Create Budget"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => router.replace(navigateTo as any)}
        style={styles.sectionHeaderButton}
      >
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Entypo name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {items && items.length > 0
        ? items.map(renderProgress)
        : renderPlaceholder()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  cardItem: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  itemAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  itemAtRisk: {
    color: "#EF4444",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  goalPlaceholder: {
    alignItems: "center",
    marginTop: 16,
  },
  statPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
