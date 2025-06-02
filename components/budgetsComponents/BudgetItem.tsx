import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

type Props = {
  budget: BudgetModel;
  onEdit: (budget: BudgetModel) => void;
  onDelete: (budgetId: string) => void;
  progressAnimation?: Animated.AnimatedInterpolation<number>;
};

const { width: screenWidth } = Dimensions.get("window");

const BudgetItem = ({ budget, onEdit, onDelete, progressAnimation }: Props) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const progressRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progressValue = Math.min(budget.spent / budget.amount, 1);
    Animated.spring(progressRef, {
      toValue: progressValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [budget.spent, budget.amount]);

  const calculateRemainingDays = () => {
    if (!budget.end_date) return 0;
    const endDate = new Date(budget.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isPotentiallyOverspending = () => {
    if (!budget.start_date || !budget.end_date) return false;
    const start = new Date(budget.start_date);
    const end = new Date(budget.end_date);
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
    if (percentage < 90) return "#FF9500"; // Orange
    return colors.error;
  };

  const getSpentPercentage = () => {
    return Math.min((budget.spent / budget.amount) * 100, 100);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const renderRightActions = () => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        style={[styles.swipeAction, styles.editAction]}
        onPress={() => onEdit(budget)}
        activeOpacity={0.8}
      >
        <View style={styles.actionIconContainer}>
          <Feather name="edit-2" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={() => onDelete(budget.id || "")}
        activeOpacity={0.8}
      >
        <View style={styles.actionIconContainer}>
          <Feather name="trash-2" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const remainingDays = calculateRemainingDays();

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
      <Animated.View
        style={[styles.budgetCard, { transform: [{ scale: scaleAnimation }] }]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardContent}
          onPress={() => router.push(`./budgets/budget-details/${budget.id}`)}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.budgetTitle} numberOfLines={1}>
                {budget.title}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{budget.category}</Text>
              </View>
            </View>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>
                {getSpentPercentage().toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressRef.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: getProgressColor(),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.amountsSection}>
            <View style={styles.amountRow}>
              <Text style={styles.spentLabel}>Spent</Text>
              <Text style={styles.spentAmount}>
                {formatCurrency(budget.spent)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetAmount}>
                {formatCurrency(budget.amount)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountRow}>
              <Text style={styles.remainingLabel}>Remaining</Text>
              <Text
                style={[
                  styles.remainingAmount,
                  {
                    color:
                      budget.amount - budget.spent >= 0
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {formatCurrency(budget.amount - budget.spent)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.daysContainer}>
              <Feather
                name="calendar"
                size={14}
                color={colors.textSecondary}
                style={styles.calendarIcon}
              />
              <Text style={styles.daysText}>
                {remainingDays} {remainingDays === 1 ? "day" : "days"} left
              </Text>
            </View>
            {isPotentiallyOverspending() && (
              <View style={styles.warningIndicator}>
                <Feather name="alert-triangle" size={12} color="#FF9500" />
              </View>
            )}
          </View>

          {/* Warning Banner */}
          {isPotentiallyOverspending() && (
            <View style={styles.warningBanner}>
              <Feather name="trending-up" size={14} color="#FF9500" />
              <Text style={styles.warningText}>Spending ahead of schedule</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary[500] + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[500] + "30",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  percentageContainer: {
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    alignItems: "center",
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  amountsSection: {
    backgroundColor: colors.backgroundDark + "60",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  spentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.backgroundDark,
    marginVertical: 8,
  },
  remainingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  daysText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  warningIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF9500" + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9500" + "15",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9500",
  },
  warningText: {
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  swipeAction: {
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginHorizontal: 4,
  },
  editAction: {
    backgroundColor: colors.primary[500],
  },
  deleteAction: {
    backgroundColor: colors.error,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default BudgetItem;
