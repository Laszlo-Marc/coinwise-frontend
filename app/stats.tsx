import BottomBar from "@/components/mainComponents/BottomBar";
import { Entypo, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BarChart,
  LineChart,
  PieChart as RNPieChart,
} from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

const screenWidth = Dimensions.get("window").width * 0.9;

const API_BASE_URL = "http://192.168.1.156:5000/api/stats";

const timeRanges = [
  { label: "Week", value: "last_week" },
  { label: "Month", value: "this_month" },
  { label: "3 Months", value: "last_3_months" },
  { label: "6 Months", value: "last_6_months" },
  { label: "Year", value: "this_year" },
];
// Data State
type OverviewStats = {
  total_expenses: number;
  total_income: number;
  net_balance: number;
  total_deposits: number;
  transaction_count: number;
};

type ExpenseCategory = {
  category: string;
  total_amount: number;
  percentage: number;
};

type TrendData = {
  period: string;
  amount: number;
  transaction_count: number;
};

type TopExpense = {
  id: string | number;
  category: string;
  merchant?: string;
  description?: string;
  date: string;
  amount: number;
};

type TransferStats = {
  total_received: number;
  received_count: number;
  total_sent: number;
  sent_count: number;
  net_flow: number;
};

type TopTransferReceiver = {
  receiver: string;
  transaction_count: number;
  total_amount: number;
};

type CashFlowData = {
  period: string;
  net_flow: number;
};

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // UI State
  const [selectedRange, setSelectedRange] = useState("this_month");
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [activeTab, setActiveTab] = useState("spending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(
    null
  );
  const [expensesByCategory, setExpensesByCategory] = useState<
    ExpenseCategory[]
  >([]);
  const [expenseTrend, setExpenseTrend] = useState<TrendData[]>([]);
  const [incomeTrend, setIncomeTrend] = useState<TrendData[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [topTransferReceivers, setTopTransferReceivers] = useState<
    TopTransferReceiver[]
  >([]);
  const [transferStats, setTransferStats] = useState<TransferStats | null>(
    null
  );
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);

  const apiCall = async (
    endpoint: string,
    options: Partial<RequestInit> = {}
  ) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch overview stats
      const overview = await apiCall(`/overview?range=${selectedRange}`);
      setOverviewStats(overview);

      // Fetch expenses by category
      const expenseCategories = await apiCall(
        `/expenses/by-category?range=${selectedRange}`
      );
      setExpensesByCategory(expenseCategories.categories || []);

      // Fetch expense trends
      const expenseTrendData = await apiCall(
        `/expenses/trend?range=${selectedRange}&granularity=monthly`
      );
      setExpenseTrend(expenseTrendData.trend_data || []);

      // Fetch income trends
      const incomeTrendData = await apiCall(
        `/income/trend?range=${selectedRange}&granularity=monthly`
      );
      setIncomeTrend(incomeTrendData.trend_data || []);

      // Fetch top expenses
      const topExpensesData = await apiCall(`/expenses/top?limit=5`);
      setTopExpenses(topExpensesData || []);

      // Fetch transfer
      const transferStatsData = await apiCall(
        `/transfers/sent-received?range=${selectedRange}`
      );
      setTransferStats(transferStatsData);

      // Fetch top transfer receivers
      const topReceiversData = await apiCall(
        `/transfers/top-receivers?limit=3`
      );
      setTopTransferReceivers(topReceiversData || []);

      // Fetch cash flow data
      const cashFlowStats = await apiCall(
        `/cashflow?range=${selectedRange}&granularity=monthly`
      );
      setCashFlowData(cashFlowStats.cash_flow_data || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      Alert.alert("Error", "Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange]);

  // Initial data fetch
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatistics();
  }, [fetchStatistics]);

  // Transform data for charts
  const getCurrentTrendData = () => {
    let trendData;
    if (activeTab === "spending") {
      trendData = expenseTrend;
    } else if (activeTab === "income") {
      trendData = incomeTrend;
    } else {
      // For savings, we'll show net cash flow
      trendData = cashFlowData.map((item) => ({
        period: item.period,
        amount: item.net_flow,
        transaction_count: 0,
      }));
    }

    if (!trendData || trendData.length === 0) {
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
  };

  // Transform category data for pie chart
  const getCategoryPieData = () => {
    if (!expensesByCategory || expensesByCategory.length === 0) {
      return [];
    }

    const colorPalette = [
      colors.primary[300],
      colors.secondary[300],
      "#E1B733",
      "#336060",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
    ];

    return expensesByCategory.slice(0, 8).map((category, index) => ({
      name: category.category,
      amount: category.total_amount,
      color: colorPalette[index % colorPalette.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
      percentage: Math.round(category.percentage),
    }));
  };

  // Get current tab total and change
  const getCurrentTabStats = () => {
    if (!overviewStats) return { total: 0, change: 0 };

    switch (activeTab) {
      case "spending":
        return {
          total: overviewStats.total_expenses,
          change: 0,
        };
      case "income":
        return {
          total: overviewStats.total_income,
          change: 0,
        };
      case "savings":
        return {
          total: overviewStats.net_balance,
          change: 0,
        };
      default:
        return { total: 0, change: 0 };
    }
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.backgroundLight,
    backgroundGradientTo: colors.backgroundLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: colors.primary[500],
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: `${colors.backgroundDark}80`,
    },
  };

  const renderChart = () => {
    const data = getCurrentTrendData();

    if (chartType === "line") {
      return (
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      );
    } else {
      return (
        <BarChart
          data={data}
          width={screenWidth - 32}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
        />
      );
    }
  };

  const currentStats = getCurrentTabStats();
  const pieData = getCategoryPieData();

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={["rgba(34, 193, 195, 1)", "rgba(253, 187, 45, 1)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => console.log("Export statistics")}
          >
            <Feather name="download" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "spending" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("spending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "spending" && styles.activeTabText,
              ]}
            >
              Spending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "income" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("income")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "income" && styles.activeTabText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "savings" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("savings")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "savings" && styles.activeTabText,
              ]}
            >
              Balance
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setTimeRangeModalVisible(true)}
          >
            <Feather name="calendar" size={24} color={colors.primary[400]} />
            <Text style={styles.timeRangeText}>
              {timeRanges.find((r) => r.value === selectedRange)?.label ||
                "Month"}
            </Text>
            <Entypo name="chevron-down" size={24} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Total Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>
              Total{" "}
              {activeTab === "spending"
                ? "Spending"
                : activeTab === "income"
                ? "Income"
                : "Balance"}
            </Text>
            <View style={styles.chartTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "line" && styles.activeChartType,
                ]}
                onPress={() => setChartType("line")}
              >
                <Feather name="trending-up" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "bar" && styles.activeChartType,
                ]}
                onPress={() => setChartType("bar")}
              >
                <Text
                  style={{
                    color:
                      chartType === "bar"
                        ? colors.primary[500]
                        : colors.textSecondary,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  ≡
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountText}>
              ${currentStats.total?.toFixed(2) || "0.00"}
            </Text>
            {currentStats.change !== 0 && (
              <View
                style={[
                  styles.changeIndicator,
                  {
                    backgroundColor:
                      currentStats.change >= 0
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(220, 38, 38, 0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeText,
                    {
                      color:
                        currentStats.change >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {currentStats.change >= 0 ? "+" : ""}
                  {currentStats.change}% vs last period
                </Text>
              </View>
            )}
          </View>

          {renderChart()}
        </View>

        {/* Category Breakdown - Only show for spending */}
        {activeTab === "spending" && pieData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>

            <View style={styles.pieChartContainer}>
              <RNPieChart
                data={pieData}
                width={screenWidth - 32}
                height={180}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
              />
            </View>

            {/* Category List */}
            <View style={styles.categoryList}>
              {pieData.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryNameContainer}>
                    <View
                      style={[
                        styles.categoryColor,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryAmountContainer}>
                    <Text style={styles.categoryAmount}>
                      ${category.amount?.toFixed(2)}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {category.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Expenses */}
        {activeTab === "spending" && topExpenses.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Expenses</Text>

            <View style={styles.merchantsList}>
              {topExpenses.map((expense, index) => (
                <View key={expense.id} style={styles.merchantItem}>
                  <View style={styles.merchantIconContainer}>
                    <Text style={styles.merchantIconText}>
                      {expense.category === "food"
                        ? "🍔"
                        : expense.category === "transport"
                        ? "🚗"
                        : expense.category === "shopping"
                        ? "🛒"
                        : "💰"}
                    </Text>
                  </View>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>
                      {expense.merchant || expense.description || "Unknown"}
                    </Text>
                    <Text style={styles.merchantTransactions}>
                      {expense.category} •{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.merchantAmount}>
                    ${expense.amount?.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Transfer Stats */}
        {activeTab === "income" && transferStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transfer Overview</Text>

            <View style={styles.transferStatsContainer}>
              <View style={styles.transferStatItem}>
                <Text style={styles.transferStatLabel}>Received</Text>
                <Text
                  style={[styles.transferStatAmount, { color: colors.success }]}
                >
                  ${transferStats.total_received?.toFixed(2)}
                </Text>
                <Text style={styles.transferStatCount}>
                  {transferStats.received_count} transactions
                </Text>
              </View>

              <View style={styles.transferStatItem}>
                <Text style={styles.transferStatLabel}>Sent</Text>
                <Text
                  style={[styles.transferStatAmount, { color: colors.error }]}
                >
                  ${transferStats.total_sent?.toFixed(2)}
                </Text>
                <Text style={styles.transferStatCount}>
                  {transferStats.sent_count} transactions
                </Text>
              </View>

              <View style={styles.transferStatItem}>
                <Text style={styles.transferStatLabel}>Net Flow</Text>
                <Text
                  style={[
                    styles.transferStatAmount,
                    {
                      color:
                        transferStats.net_flow >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  ${transferStats.net_flow?.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Top Transfer Recipients */}
            {topTransferReceivers.length > 0 && (
              <>
                <Text
                  style={[
                    styles.cardTitle,
                    { marginTop: 20, marginBottom: 10 },
                  ]}
                >
                  Top Recipients
                </Text>
                {topTransferReceivers.map((receiver, index) => (
                  <View key={index} style={styles.merchantItem}>
                    <View style={styles.merchantIconContainer}>
                      <Text style={styles.merchantIconText}>👤</Text>
                    </View>
                    <View style={styles.merchantInfo}>
                      <Text style={styles.merchantName}>
                        {receiver.receiver}
                      </Text>
                      <Text style={styles.merchantTransactions}>
                        {receiver.transaction_count} transfers
                      </Text>
                    </View>
                    <Text style={styles.merchantAmount}>
                      ${receiver.total_amount?.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Cash Flow Insights */}
        {activeTab === "savings" && overviewStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Financial Summary</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  ${overviewStats.total_income?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  ${overviewStats.total_expenses?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Deposits</Text>
                <Text
                  style={[styles.summaryValue, { color: colors.primary[400] }]}
                >
                  ${overviewStats.total_deposits?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Balance</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        overviewStats.net_balance >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  ${overviewStats.net_balance?.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <Feather name="trending-up" size={24} color={colors.text} />
              </View>
              <View style={styles.insightTextContainer}>
                <Text style={styles.insightText}>
                  {overviewStats.transaction_count} total transactions in this
                  period.
                  {overviewStats.net_balance >= 0
                    ? " You're maintaining a positive balance!"
                    : " Consider reviewing your spending patterns."}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Time Range Modal */}
      <Modal
        visible={timeRangeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTimeRangeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimeRangeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time Range</Text>

            {timeRanges.map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  selectedRange === range.value && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedRange(range.value);
                  setTimeRangeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedRange === range.value && styles.selectedOptionText,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <BottomBar />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.text,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  timeRangeContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  timeRangeText: {
    color: colors.primary[400],
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 8,
  },
  overviewCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  overviewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  chartTypeToggle: {
    flexDirection: "row",
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 4,
  },
  chartTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeChartType: {
    backgroundColor: colors.backgroundLight,
  },
  totalAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  totalAmountText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
    marginRight: 12,
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  categoryNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  categoryPercentage: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  merchantsList: {
    marginTop: 8,
  },
  merchantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  merchantIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.backgroundDark}80`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  merchantIconText: {
    fontSize: 20,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  merchantTransactions: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  merchantAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  // Transfer Stats Styles (Missing)
  transferStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transferStatItem: {
    flex: 1,
    backgroundColor: `${colors.backgroundDark}40`,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  transferStatLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  transferStatAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  transferStatCount: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  // Summary Grid Styles (Missing)
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    width: "48%",
    backgroundColor: `${colors.backgroundDark}40`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Insight Item Styles
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: `${colors.primary[500]}10`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "70%",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  selectedOption: {
    backgroundColor: `${colors.primary[500]}20`,
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  selectedOptionText: {
    color: colors.primary[500],
    fontWeight: "600",
  },
});
