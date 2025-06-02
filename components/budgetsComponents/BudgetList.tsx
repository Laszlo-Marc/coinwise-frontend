// components/budgets/BudgetList.tsx

import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BudgetItem from "./BudgetItem";

type Props = {
  budgets: BudgetModel[];
  onEditBudget: (budget: BudgetModel) => void;
  onDeleteBudget: (budgetId: string) => void;
  onAddBudget: () => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");

const BudgetList = ({
  budgets,
  onEditBudget,
  onDeleteBudget,
  onAddBudget,
  onRefresh,
  isLoading = false,
}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const summarySlideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(summarySlideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  const calculateTotalSpent = () => {
    return budgets.reduce((total, budget) => total + budget.spent, 0);
  };

  const calculateTotalRemaining = () => {
    return calculateTotalBudget() - calculateTotalSpent();
  };

  const getOverallProgress = () => {
    const total = calculateTotalBudget();
    if (total === 0) return 0;
    return (calculateTotalSpent() / total) * 100;
  };

  const renderSummaryCard = () => {
    const totalBudget = calculateTotalBudget();
    const totalSpent = calculateTotalSpent();
    const totalRemaining = calculateTotalRemaining();
    const overallProgress = getOverallProgress();

    if (budgets.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.summaryCard,
          {
            transform: [{ translateY: summarySlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Budget Overview</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {overallProgress.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.summaryProgressContainer}>
          <View style={styles.summaryProgressBar}>
            <Animated.View
              style={[
                styles.summaryProgressFill,
                {
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor:
                    overallProgress > 90
                      ? colors.error
                      : overallProgress > 75
                      ? "#FF9500"
                      : colors.success,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Budget</Text>
            <Text style={styles.statValue}>{formatCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statValue, { color: colors.primary[400] }]}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text
              style={[
                styles.statValue,
                { color: totalRemaining >= 0 ? colors.success : colors.error },
              ]}
            >
              {formatCurrency(totalRemaining)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyStateIconContainer}>
        <Feather name="pie-chart" size={64} color={colors.primary[400]} />
      </View>
      <Text style={styles.emptyStateTitle}>No Budgets Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first budget to start tracking your spending and reach your
        financial goals.
      </Text>
      <TouchableOpacity
        style={styles.createFirstBudgetButton}
        onPress={onAddBudget}
      >
        <Feather
          name="plus"
          size={20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.createFirstBudgetText}>
          Create Your First Budget
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBudgetItem = ({
    item,
    index,
  }: {
    item: BudgetModel;
    index: number;
  }) => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 + index * 20],
              }),
            },
          ],
        },
      ]}
    >
      <BudgetItem
        budget={item}
        onEdit={onEditBudget}
        onDelete={onDeleteBudget}
      />
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>{renderSummaryCard()}</View>
  );

  if (budgets.length === 0) {
    return <View style={styles.container}>{renderEmptyState()}</View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id || ""}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          ) : undefined
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 100,
  },
  headerContainer: {
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  progressBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryProgressContainer: {
    marginBottom: 20,
  },
  summaryProgressBar: {
    height: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 4,
    overflow: "hidden",
  },
  summaryProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.backgroundDark,
    marginHorizontal: 16,
  },
  itemSeparator: {
    height: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[500] + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstBudgetButton: {
    backgroundColor: colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createFirstBudgetText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default BudgetList;
