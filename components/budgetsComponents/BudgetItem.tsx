import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  budget: BudgetModel;
  onEdit: (budget: BudgetModel) => void;
  onDelete: (budgetId: string) => void;
}

const BudgetItem = ({ budget, onEdit, onDelete }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const remaining = budget.amount - budget.spent;
  const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(budget.end_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  useEffect(() => {
    const progress = Math.min(budget.spent / budget.amount, 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [budget.spent, budget.amount]);

  const getProgressColor = () => {
    if (percentage < 50) return colors.success;
    if (percentage < 75) return colors.primary[400];
    if (percentage < 90) return "#FF9500";
    return colors.error;
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/budgets/budget-details/${budget.id}`)}
        activeOpacity={0.9}
        style={styles.cardContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{budget.title}</Text>
            {budget.description && (
              <Text style={styles.description}>{budget.description}</Text>
            )}
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{budget.category}</Text>
              </View>
              {budget.is_recurring && (
                <View style={styles.recurringBadge}>
                  <Feather
                    name="refresh-cw"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.recurringText}>
                    {budget.recurring_frequency}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionsColumn}>
            <TouchableOpacity
              onPress={() => onEdit(budget)}
              style={styles.iconButton}
            >
              <Feather name="edit-2" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(budget.id || "")}
              style={styles.iconButton}
            >
              <Feather name="trash-2" size={16} color={colors.error} />
            </TouchableOpacity>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>
                {percentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.amountsContainer}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Budget</Text>
            <Text style={styles.amount}>{formatCurrency(budget.amount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Spent</Text>
            <Text style={styles.amount}>{formatCurrency(budget.spent)}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.label}>Remaining</Text>
            <Text
              style={[
                styles.amount,
                { color: remaining >= 0 ? colors.success : colors.error },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Feather
            name="calendar"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.footerText}>
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: colors.primary[500] + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    color: colors.primary[500],
    fontWeight: "600",
    fontSize: 12,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recurringText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  actionsColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  percentageBadge: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  percentageText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  progressBarContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.backgroundDark,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  amountsContainer: {
    marginBottom: 16,
    gap: 4,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});

export default BudgetItem;
