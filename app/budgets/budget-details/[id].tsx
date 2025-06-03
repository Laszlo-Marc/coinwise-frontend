import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useBudgets } from "@/contexts/BudgetsContext";

import { BudgetModel } from "@/models/budget";
import { TransactionModel } from "@/models/transaction";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const BudgetDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { budgets, updateBudget } = useBudgets();
  const { transactions = [], addTransaction } = useTransactionContext();
  const [budget, setBudget] = useState<BudgetModel | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [expenseMerchant, setExpenseMerchant] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const getBudgetTransactions = (): TransactionModel[] => {
    if (!budget?.transactions?.length) return [];

    return transactions
      .filter((transaction: TransactionModel) =>
        budget.transactions?.includes(transaction.id!)
      )
      .sort(
        (a: TransactionModel, b: TransactionModel) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  };

  const budgetTransactions = getBudgetTransactions();

  useEffect(() => {
    console.log(budgets);
    const foundBudget = budgets.find((b) => b.id === id);

    if (foundBudget) {
      setBudget(foundBudget);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: foundBudget.spent / foundBudget.amount,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Alert.alert("Error", "Budget not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [id, budgets, transactions]);

  if (!budget) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.text, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const progressPercentage = (budget.spent / budget.amount) * 100;
  const daysLeft = Math.ceil(
    (new Date(budget.end_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const dailyBudget = budget.remaining / Math.max(daysLeft, 1);

  const handleAddExpense = async () => {
    if (
      !expenseAmount.trim() ||
      !expenseDescription.trim() ||
      !expenseMerchant.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const newTransaction: TransactionModel = {
        amount,
        description: expenseDescription,
        date: new Date().toISOString(),
        category: budget.category,
        type: "expense",
        currency: "RON",
        merchant: expenseMerchant,
      };

      const transactionId = await addTransaction(newTransaction);

      const updatedTransactionIds = [
        ...(budget.transactions || []),
        transactionId,
      ].filter((id): id is string => typeof id === "string");
      console.log("Updated Transaction IDs:", updatedTransactionIds);
      const updatedBudget: BudgetModel = {
        ...budget,
        spent: budget.spent + amount,
        remaining: budget.remaining - amount,
        transactions: updatedTransactionIds,
      };
      console.log("Updated Budget:", updatedBudget);
      await updateBudget(Array.isArray(id) ? id[0] : id, updatedBudget);
      setBudget(updatedBudget);

      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseMerchant("");
      setShowAddExpenseModal(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add expense");
    }
  };

  const getStatusColor = () => {
    if (progressPercentage <= 50) return "#4ECDC4";
    if (progressPercentage <= 80) return "#FECA57";
    return "#FF6B6B";
  };

  const getSpendingData = () => {
    const now = new Date();
    let filteredTransactions = [];

    switch (selectedTimeframe) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = budgetTransactions.filter(
          (t) => new Date(t.date) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = budgetTransactions.filter(
          (t) => new Date(t.date) >= monthAgo
        );
        break;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredTransactions = budgetTransactions.filter(
          (t) => new Date(t.date) >= yearAgo
        );
        break;
      default:
        filteredTransactions = budgetTransactions;
    }

    const dailySpending: { [key: string]: number } = {};
    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        const date = new Date(t.date).toLocaleDateString();
        dailySpending[date] = (dailySpending[date] || 0) + t.amount;
      }
    });

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .slice(-7);
  };

  const GlassCard = ({
    children,
    style = {},
  }: {
    children: React.ReactNode;
    style?: any;
  }) => (
    <View style={[styles.glassCard, style]}>
      <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
        {children}
      </BlurView>
    </View>
  );

  const spendingData = getSpendingData();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary[500] + "60", colors.background]}
        style={styles.container}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary[300], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Budget Details
              </Text>
            </View>

            <View style={styles.budgetIconHeader}>
              <MaterialIcons
                name="account-balance-wallet"
                size={24}
                color="white"
              />
            </View>
          </View>

          <View style={styles.budgetInfo}>
            <View style={styles.budgetDetails}>
              <Text style={[styles.budgetTitle, { color: colors.text }]}>
                {budget.title}
              </Text>
              <Text style={styles.budgetSubtitle}>
                {budget.category} •{" "}
                {budget.is_recurring ? "Recurring" : "One-time"}
              </Text>
            </View>
          </View>

          {budget.description && (
            <Text style={styles.budgetDescription}>{budget.description}</Text>
          )}
        </LinearGradient>

        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Overview */}
          <GlassCard>
            <View style={styles.overviewHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Budget Overview
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {progressPercentage.toFixed(1)}% Used
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: getStatusColor(),
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "0%",
                          `${Math.min(100, progressPercentage)}%`,
                        ],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Amount Details */}
            <View style={styles.amountRow}>
              <View style={styles.amountItem}>
                <Text
                  style={[styles.amountLabel, { color: colors.textSecondary }]}
                >
                  Spent
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  RON {budget.spent.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.amountItem, styles.amountItemCenter]}>
                <Text
                  style={[styles.amountLabel, { color: colors.textSecondary }]}
                >
                  Remaining
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    { color: budget.remaining >= 0 ? "#4ECDC4" : "#FF6B6B" },
                  ]}
                >
                  RON {budget.remaining.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.amountItem, styles.amountItemEnd]}>
                <Text
                  style={[styles.amountLabel, { color: colors.textSecondary }]}
                >
                  Total
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  RON {budget.amount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Time & Daily Budget */}
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text
                  style={[styles.amountLabel, { color: colors.textSecondary }]}
                >
                  Days Left
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {daysLeft > 0 ? daysLeft : "Expired"}
                </Text>
              </View>
              <View style={[styles.timeItem, styles.timeItemEnd]}>
                <Text
                  style={[styles.amountLabel, { color: colors.textSecondary }]}
                >
                  Daily Budget
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  RON {dailyBudget.toFixed(2)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setShowAddExpenseModal(true)}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.primary[500] + "20",
                    borderColor: colors.primary[500] + "40",
                  },
                ]}
              >
                <Feather name="plus" size={24} color={colors.primary[500]} />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: colors.primary[500] },
                  ]}
                >
                  Add Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/budgets`)}
                style={styles.actionButtonSecondary}
              >
                <Feather name="edit-3" size={24} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Edit Budget
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Recent Transactions */}
          {budgetTransactions.length > 0 && (
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Transactions
              </Text>

              {budgetTransactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text
                      style={[
                        styles.transactionDescription,
                        { color: colors.text },
                      ]}
                    >
                      {transaction.description}
                    </Text>
                    <Text
                      style={[
                        styles.transactionDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.merchant && ` • ${transaction.merchant}`}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "expense"
                            ? "#FF6B6B"
                            : "#4ECDC4",
                      },
                    ]}
                  >
                    {transaction.type === "expense" ? "-" : "+"}
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </Text>
                </View>
              ))}

              {budgetTransactions.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text
                    style={[styles.viewAllText, { color: colors.primary[500] }]}
                  >
                    View All Transactions ({budgetTransactions.length})
                  </Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          )}
        </Animated.ScrollView>

        {/* Add Expense Modal */}
        <Modal visible={showAddExpenseModal} transparent animationType="slide">
          <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Add Expense
                </Text>
                <TouchableOpacity onPress={() => setShowAddExpenseModal(false)}>
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Amount (RON)
                </Text>
                <TextInput
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={[
                    styles.amountInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.primary[500] + "40",
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Description
                </Text>
                <TextInput
                  value={expenseDescription}
                  onChangeText={setExpenseDescription}
                  placeholder="What did you spend on?"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.descriptionInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.primary[500] + "40",
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Merchant
                </Text>
                <TextInput
                  value={expenseMerchant}
                  onChangeText={setExpenseMerchant}
                  placeholder="Where did you spend?"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.descriptionInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.primary[500] + "40",
                    },
                  ]}
                  onFocus={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setShowAddExpenseModal(false)}
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.textSecondary + "20",
                      borderColor: colors.textSecondary + "40",
                    },
                  ]}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddExpense}
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.primary[500] },
                  ]}
                >
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Montserrat",
  },
  budgetIconHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  budgetInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  budgetDetails: {
    alignItems: "center",
  },
  budgetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  budgetSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  budgetDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  glassCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  glassCardBlur: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountItem: {
    flex: 1,
  },
  amountItemCenter: {
    alignItems: "center",
  },
  amountItemEnd: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeItem: {
    flex: 1,
  },
  timeItemEnd: {
    alignItems: "flex-end",
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeframeButtons: {
    flexDirection: "row",
  },
  timeframeButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  descriptionInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minHeight: 80,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BudgetDetailsScreen;
