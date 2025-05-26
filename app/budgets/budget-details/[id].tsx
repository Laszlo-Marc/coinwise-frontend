// screens/BudgetDetailsScreen.tsx

import { colors } from "@/constants/colors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: "expense" | "income";
}

interface SubBudget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: "weekly" | "monthly" | "yearly" | "custom";
  createdAt: string;
  startDate: string;
  endDate: string;
  threshold?: number;
  subBudgets?: SubBudget[];
  description?: string;
  currency: string;
  icon: string;
  color: string;
  autoReset: boolean;
  notifications: boolean;
  recurringType?: "fixed" | "rollover";
  tags: string[];
  priority: "low" | "medium" | "high";
  transactions?: Transaction[];
}

const BudgetDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { budget: initialBudget } = route.params;

  const [budget, setBudget] = useState<Budget>(initialBudget);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week"); // week, month, year

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: budget.spent / budget.amount,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [budget]);

  const progressPercentage = (budget.spent / budget.amount) * 100;
  const remainingAmount = budget.amount - budget.spent;
  const daysLeft = Math.ceil(
    (new Date(budget.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const dailyBudget = remainingAmount / Math.max(daysLeft, 1);

  const handleAddExpense = () => {
    if (!expenseAmount.trim() || !expenseDescription.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      amount,
      description: expenseDescription,
      date: new Date().toISOString(),
      category: budget.category,
      type: "expense",
    };

    setBudget((prev) => ({
      ...prev,
      spent: prev.spent + amount,
      transactions: [...(prev.transactions || []), newTransaction],
    }));

    setExpenseAmount("");
    setExpenseDescription("");
    setShowAddExpenseModal(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getStatusColor = () => {
    if (progressPercentage <= 50) return "#4ECDC4";
    if (progressPercentage <= 80) return "#FECA57";
    return "#FF6B6B";
  };

  const getSpendingData = () => {
    const transactions = budget.transactions || [];
    const now = new Date();
    let filteredTransactions = [];

    switch (selectedTimeframe) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= monthAgo
        );
        break;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(
          (t) => new Date(t.date) >= yearAgo
        );
        break;
      default:
        filteredTransactions = transactions;
    }

    // Group by day for chart
    const dailySpending = {};
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString();
      dailySpending[date] = (dailySpending[date] || 0) + t.amount;
    });

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .slice(-7); // Last 7 data points
  };

  const GlassCard = ({ children, style = {} }) => (
    <BlurView
      intensity={15}
      tint="light"
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );

  const spendingData = getSpendingData();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[budget.color + "60", colors.background]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[budget.color, colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("BudgetForm", { budget, isEdit: true })
              }
            >
              <Feather name="edit-3" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <MaterialIcons
                name={budget.icon || "wallet"}
                size={24}
                color="white"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}
              >
                {budget.name}
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                {budget.category} • {budget.period}
              </Text>
            </View>
          </View>

          {budget.description && (
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.9)",
                marginBottom: 12,
              }}
            >
              {budget.description}
            </Text>
          )}

          {/* Tags */}
          {budget.tags?.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {budget.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <Animated.ScrollView
          style={{
            flex: 1,
            opacity: fadeAnim,
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Overview */}
          <GlassCard>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
              >
                Budget Overview
              </Text>
              <View
                style={{
                  backgroundColor: getStatusColor() + "20",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: getStatusColor(),
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {progressPercentage.toFixed(1)}% Used
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  height: 12,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    height: "100%",
                    backgroundColor: getStatusColor(),
                    borderRadius: 6,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        "0%",
                        `${Math.min(100, progressPercentage)}%`,
                      ],
                    }),
                  }}
                />
              </View>
            </View>

            {/* Amount Details */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Spent
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  {budget.currency} {budget.spent.toFixed(2)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Remaining
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: remainingAmount >= 0 ? "#4ECDC4" : "#FF6B6B",
                  }}
                >
                  {budget.currency} {remainingAmount.toFixed(2)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  {budget.currency} {budget.amount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Time & Daily Budget */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Days Left
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  {daysLeft > 0 ? daysLeft : "Expired"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Daily Budget
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  {budget.currency} {dailyBudget.toFixed(2)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Quick Actions
            </Text>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => setShowAddExpenseModal(true)}
                style={{
                  flex: 1,
                  backgroundColor: budget.color + "20",
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: budget.color + "40",
                }}
              >
                <Feather name="plus" size={24} color={budget.color} />
                <Text
                  style={{
                    color: budget.color,
                    fontSize: 14,
                    fontWeight: "600",
                    marginTop: 8,
                  }}
                >
                  Add Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("BudgetForm", { budget, isEdit: true })
                }
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  marginLeft: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Feather name="edit-3" size={24} color={colors.text} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                    marginTop: 8,
                  }}
                >
                  Edit Budget
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Spending Chart */}
          {spendingData.length > 0 && (
            <GlassCard>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Spending Trend
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {["week", "month", "year"].map((timeframe) => (
                    <TouchableOpacity
                      key={timeframe}
                      onPress={() => setSelectedTimeframe(timeframe)}
                      style={{
                        backgroundColor:
                          selectedTimeframe === timeframe
                            ? budget.color + "40"
                            : "rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginLeft: 4,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedTimeframe === timeframe
                              ? budget.color
                              : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {timeframe}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Animated.View style={{ opacity: chartAnim }}>
                <LineChart
                  data={{
                    labels: spendingData.map((d) =>
                      new Date(d.date).getDate().toString()
                    ),
                    datasets: [
                      {
                        data: spendingData.map((d) => d.amount),
                        color: (opacity = 1) =>
                          budget.color + opacity.toString(16).padStart(2, "0"),
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={width - 80}
                  height={200}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                      colors.text + opacity.toString(16).padStart(2, "0"),
                    labelColor: (opacity = 1) =>
                      colors.textSecondary +
                      opacity.toString(16).padStart(2, "0"),
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: budget.color,
                      fill: budget.color,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </Animated.View>
            </GlassCard>
          )}

          {/* Sub-Budgets */}
          {budget.subBudgets && budget.subBudgets.length > 0 && (
            <GlassCard>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Sub-Budgets
              </Text>

              {budget.subBudgets.map((sub) => {
                const subProgress = (sub.spent / sub.amount) * 100;
                return (
                  <View
                    key={sub.id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {sub.name}
                      </Text>
                      <Text
                        style={{ fontSize: 14, color: colors.textSecondary }}
                      >
                        {subProgress.toFixed(1)}%
                      </Text>
                    </View>

                    <View
                      style={{
                        height: 6,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          backgroundColor: budget.color,
                          borderRadius: 3,
                          width: `${Math.min(100, subProgress)}%`,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Spent: {budget.currency} {sub.spent.toFixed(2)}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Budget: {budget.currency} {sub.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </GlassCard>
          )}

          {/* Recent Transactions */}
          {budget.transactions && budget.transactions.length > 0 && (
            <GlassCard>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Recent Transactions
              </Text>

              {budget.transactions
                .slice(-5)
                .reverse()
                .map((transaction) => (
                  <View
                    key={transaction.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {transaction.description}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color:
                          transaction.type === "expense"
                            ? "#FF6B6B"
                            : "#4ECDC4",
                      }}
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {budget.currency} {transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}

              <TouchableOpacity
                style={{
                  alignItems: "center",
                  paddingVertical: 12,
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    color: budget.color,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  View All Transactions
                </Text>
              </TouchableOpacity>
            </GlassCard>
          )}
        </Animated.ScrollView>

        {/* Add Expense Modal */}
        <Modal visible={showAddExpenseModal} transparent animationType="slide">
          <BlurView
            intensity={20}
            tint="dark"
            style={{ flex: 1, justifyContent: "center", padding: 20 }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 24,
                padding: 20,
                maxHeight: "80%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Add Expense
                </Text>
                <TouchableOpacity onPress={() => setShowAddExpenseModal(false)}>
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Amount ({budget.currency})
                </Text>
                <TextInput
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 18,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
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
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    textAlignVertical: "top",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </View>

              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => setShowAddExpenseModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddExpense}
                  style={{
                    flex: 1,
                    backgroundColor: budget.color,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    Add Expense
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      </LinearGradient>
    </View>
  );
};

export default BudgetDetailsScreen;
