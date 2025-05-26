import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";
import { BudgetModel } from "@/models/budget";
import { GoalModel } from "@/models/goal";
import { TransactionModel } from "@/models/transaction";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "../components/mainComponents/BottomBar";
import { colors } from "../constants/colors";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAuth();
  const { goals } = useGoals();
  const { budgets } = useBudgets();
  const { transactions, fetchTransactions } = useTransactionContext();
  const { fetchGoals, fetchContributions } = useGoals();
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchGoals();
        await fetchContributions();
        await fetchTransactions();
      } catch (e) {
        console.error("Failed to initialize goals", e);
      }
    };

    initializeData();
  }, []);
  useEffect(() => {
    const checkUser = async () => {
      if (!state.userToken || !state.user) {
        router.replace("/auth/sign-in");
      }
    };
    checkUser();
  }, [state.userToken, state.user]);

  // Calculate recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .sort(
        (
          a: { date: string | number | Date },
          b: { date: string | number | Date }
        ) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [transactions]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const last3Months = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate()
    );

    const calculateTotals = (startDate: Date | null = null) => {
      const filteredTransactions = startDate
        ? transactions.filter(
            (t: { date: string | number | Date }) =>
              new Date(t.date) >= startDate
          )
        : transactions;

      const income = filteredTransactions
        .filter((t: { type: string }) => t.type === "income")
        .reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);

      const expenses = filteredTransactions
        .filter((t: { type: string }) => t.type === "expense")
        .reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);

      return { income, expenses };
    };

    return {
      allTime: calculateTotals(),
      lastMonth: calculateTotals(lastMonth),
      last3Months: calculateTotals(last3Months),
    };
  }, [transactions]);

  // Calculate balance
  const currentBalance = useMemo(() => {
    return transactions.reduce(
      (balance: number, transaction: { type: string; amount: number }) => {
        return transaction.type === "income"
          ? balance + transaction.amount
          : balance - transaction.amount;
      },
      0
    );
  }, [transactions]);

  // Get closest goals to achievement
  const closestGoals = useMemo(() => {
    return goals
      .filter((goal: GoalModel) => goal.current_amount < goal.target_amount)
      .sort((a: GoalModel, b: GoalModel) => {
        const progressA = (a.current_amount / a.target_amount) * 100;
        const progressB = (b.current_amount / b.target_amount) * 100;
        return progressB - progressA;
      })
      .slice(0, 3);
  }, [goals]);

  // Get budgets closest to being broken
  const riskiestBudgets = useMemo(() => {
    const now = new Date();
    return budgets
      .filter((budget: BudgetModel) => {
        // Calculate spent amount for current period
        const periodStart =
          budget.period === "monthly"
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : budget.period === "weekly"
            ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            : new Date(now.getFullYear(), 0, 1);

        const spent = transactions
          .filter(
            (t: TransactionModel) =>
              t.type === "expense" &&
              t.category === budget.category &&
              new Date(t.date) >= periodStart
          )
          .reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);

        budget.spent = spent;
        return spent < budget.limit;
      })
      .sort((a: BudgetModel, b: BudgetModel) => {
        const percentageA = (a.spent / a.limit) * 100;
        const percentageB = (b.spent / b.limit) * 100;
        return percentageB - percentageA;
      })
      .slice(0, 3);
  }, [budgets, transactions]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const formatCurrency = (amount: string | number | bigint) => {
    const numericAmount = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("ro-RO", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Main Balance Section with Gradient */}
        <LinearGradient
          colors={["rgba(253, 187, 45, 1)", "rgba(34, 193, 195, 1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceSection}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.replace("/settings")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push("/profile")}
                  activeOpacity={0.7}
                >
                  <Feather name="user" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Main · RON</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(currentBalance)}
            </Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.replace("./transactions")}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="wallet-outline" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Feather name="archive" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Archive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <SimpleLineIcons
                  name="paper-plane"
                  size={24}
                  color={colors.text}
                />
              </View>
              <Text style={styles.actionText}>Travel account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Feather name="list" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Recent Transactions Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => router.replace("./transactions")}
          >
            <Text style={styles.sectionHeaderText}>Recent Transactions</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          {recentTransactions.length > 0 ? (
            <View>
              {recentTransactions.map(
                (transaction: TransactionModel, index: any) => (
                  <View
                    key={transaction.id || index}
                    style={styles.transactionItem}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              transaction.type === "income"
                                ? "#4CAF50"
                                : "#F44336",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            transaction.type === "income"
                              ? "arrow-down"
                              : "arrow-up"
                          }
                          size={16}
                          color="white"
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>
                          {transaction.description || transaction.category}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.date)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.type === "income"
                              ? "#4CAF50"
                              : "#F44336",
                        },
                      ]}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                )
              )}
            </View>
          ) : (
            <View style={styles.transactionsEmptyState}>
              <View style={styles.emptyStateIcon}>
                <Text style={styles.emptyStateIconText}>🧩</Text>
              </View>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Summary</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryPeriod}>
              <Text style={styles.summaryPeriodTitle}>All Time</Text>
              <View style={styles.summaryAmounts}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
                    {formatCurrency(summaryData.allTime.income)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={[styles.summaryAmount, { color: "#F44336" }]}>
                    {formatCurrency(summaryData.allTime.expenses)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryPeriod}>
              <Text style={styles.summaryPeriodTitle}>Last Month</Text>
              <View style={styles.summaryAmounts}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
                    {formatCurrency(summaryData.lastMonth.income)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={[styles.summaryAmount, { color: "#F44336" }]}>
                    {formatCurrency(summaryData.lastMonth.expenses)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryPeriod}>
              <Text style={styles.summaryPeriodTitle}>Last 3 Months</Text>
              <View style={styles.summaryAmounts}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
                    {formatCurrency(summaryData.last3Months.income)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={[styles.summaryAmount, { color: "#F44336" }]}>
                    {formatCurrency(summaryData.last3Months.expenses)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Statistics</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Feather name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.statLabel}>Avg Monthly Income</Text>
              <Text style={styles.statValue}>
                {formatCurrency(summaryData.last3Months.income / 3)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="trending-down" size={24} color="#F44336" />
              <Text style={styles.statLabel}>Avg Monthly Expenses</Text>
              <Text style={styles.statValue}>
                {formatCurrency(summaryData.last3Months.expenses / 3)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="savings" size={24} color="#2196F3" />
              <Text style={styles.statLabel}>Savings Rate</Text>
              <Text style={styles.statValue}>
                {summaryData.allTime.income > 0
                  ? Math.round(
                      ((summaryData.allTime.income -
                        summaryData.allTime.expenses) /
                        summaryData.allTime.income) *
                        100
                    )
                  : 0}
                %
              </Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="calendar" size={24} color="#FF9800" />
              <Text style={styles.statLabel}>Total Transactions</Text>
              <Text style={styles.statValue}>{transactions.length}</Text>
            </View>
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => router.replace("./financial-goals")}
          >
            <Text style={styles.sectionHeaderText}>Financial Goals</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          {closestGoals.length > 0 ? (
            <View>
              {closestGoals.map((goal: GoalModel, index: any) => {
                const progress =
                  (goal.current_amount / goal.target_amount) * 100;
                return (
                  <View key={goal.id || index} style={styles.goalItem}>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalProgress}>
                        {formatCurrency(goal.current_amount)} of{" "}
                        {formatCurrency(goal.target_amount)}
                      </Text>
                    </View>
                    <View style={styles.goalProgressContainer}>
                      <View style={styles.goalProgressBar}>
                        <View
                          style={[
                            styles.goalProgressFill,
                            { width: `${Math.min(progress, 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.goalPercentage}>
                        {Math.round(progress)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.goalPlaceholder}>
              <Feather name="target" size={40} color={colors.textSecondary} />
              <Text style={styles.statPlaceholderText}>
                Set your first savings goal
              </Text>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Budgets Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Budgets</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          {riskiestBudgets.length > 0 ? (
            <View>
              {riskiestBudgets.map((budget: BudgetModel, index: any) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isAtRisk = percentage > 80;
                return (
                  <View key={budget.id || index} style={styles.budgetItem}>
                    <View style={styles.budgetInfo}>
                      <Text style={styles.budgetTitle}>{budget.category}</Text>
                      <Text style={styles.budgetAmount}>
                        {formatCurrency(budget.spent)} of{" "}
                        {formatCurrency(budget.limit)}
                      </Text>
                    </View>
                    <View style={styles.budgetProgressContainer}>
                      <View style={styles.budgetProgressBar}>
                        <View
                          style={[
                            styles.budgetProgressFill,
                            {
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: isAtRisk ? "#F44336" : "#4CAF50",
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.budgetPercentage,
                          { color: isAtRisk ? "#F44336" : colors.text },
                        ]}
                      >
                        {Math.round(percentage)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.goalPlaceholder}>
              <AntDesign
                name="creditcard"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.statPlaceholderText}>
                Create a budget to manage expenses
              </Text>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom spacing for scrolling past the bottom bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  balanceLabel: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Montserrat",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  // Transaction styles
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionsEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateIconText: {
    fontSize: 28,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  // Summary styles
  summaryContainer: {
    gap: 16,
  },
  summaryPeriod: {
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
    paddingBottom: 16,
  },
  summaryPeriodTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  // Stats styles
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: `${colors.backgroundDark}10`,
    borderRadius: 12,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  // Goal styles
  goalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
  },
  goalInfo: {
    marginBottom: 8,
  },
  goalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  goalProgress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  goalProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: `${colors.backgroundDark}20`,
    borderRadius: 4,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  goalPercentage: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
  goalPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  statPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
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
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  // Budget styles
  budgetItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
  },
  budgetInfo: {
    marginBottom: 8,
  },
  budgetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  budgetAmount: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  budgetProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  budgetProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: `${colors.backgroundDark}20`,
    borderRadius: 4,
    overflow: "hidden",
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
  bottomPadding: {
    height: 100,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.backgroundLight}40`,
  },
});
