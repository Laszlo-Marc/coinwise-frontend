import BottomBar from "@/components/mainComponents/BottomBar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Download,
  PieChart,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
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

// Get screen width for responsive charts
const screenWidth = Dimensions.get("window").width * 0.9;

// Sample data for charts
const monthlySpendingData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [2100, 1800, 2400, 1900, 2200, 2600],
      color: () => colors.primary[400],
      strokeWidth: 2,
    },
  ],
};

const weeklySpendingData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [120, 80, 200, 150, 300, 250, 190],
      color: () => colors.primary[400],
      strokeWidth: 2,
    },
  ],
};

const categoryData = [
  {
    name: "Food",
    amount: 850,
    color: colors.primary[300],
    legendFontColor: colors.text,
    legendFontSize: 12,
    percentage: 32,
  },
  {
    name: "Bills",
    amount: 650,
    color: colors.secondary[300],
    legendFontColor: colors.text,
    legendFontSize: 12,
    percentage: 25,
  },
  {
    name: "Entertainment",
    amount: 450,
    color: "#E1B733",
    legendFontColor: colors.text,
    legendFontSize: 12,
    percentage: 17,
  },
  {
    name: "Shopping",
    amount: 380,
    color: "#336060",
    legendFontColor: colors.text,
    legendFontSize: 12,
    percentage: 14,
  },
  {
    name: "Health",
    amount: 320,
    color: "#10B981",
    legendFontColor: colors.text,
    legendFontSize: 12,
    percentage: 12,
  },
];

const timeRanges = ["Week", "Month", "Quarter", "Year", "Custom"];

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState("Month");
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [activeTab, setActiveTab] = useState("spending");

  // Dynamic spending data based on selected time range
  const [currentSpendingData, setCurrentSpendingData] =
    useState(monthlySpendingData);
  const [totalSpent, setTotalSpent] = useState(0);
  const [changePercentage, setChangePercentage] = useState(0);

  // Update data when time range changes
  useEffect(() => {
    if (selectedRange === "Week") {
      setCurrentSpendingData(weeklySpendingData);
      setTotalSpent(1290);
      setChangePercentage(3.2);
    } else {
      setCurrentSpendingData(monthlySpendingData);
      setTotalSpent(2600);
      setChangePercentage(-4.5);
    }
  }, [selectedRange]);

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

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
  };

  const renderChart = () => {
    if (chartType === "line") {
      return (
        <LineChart
          data={currentSpendingData}
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
          data={currentSpendingData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={barChartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
        />
      );
    }
  };

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
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => console.log("Export statistics")}
          >
            <Download color={colors.text} size={20} />
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
              Savings
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setTimeRangeModalVisible(true)}
          >
            <Calendar color={colors.primary[400]} size={16} />
            <Text style={styles.timeRangeText}>{selectedRange}</Text>
            <ChevronDown color={colors.primary[400]} size={16} />
          </TouchableOpacity>
        </View>

        {/* Total Spending Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Total Spending</Text>
            <View style={styles.chartTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "line" && styles.activeChartType,
                ]}
                onPress={() => setChartType("line")}
              >
                <TrendingUp
                  color={
                    chartType === "line"
                      ? colors.primary[500]
                      : colors.textSecondary
                  }
                  size={18}
                />
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
            <Text style={styles.totalAmountText}>${totalSpent}</Text>
            <View
              style={[
                styles.changeIndicator,
                {
                  backgroundColor:
                    changePercentage >= 0
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
                      changePercentage >= 0 ? colors.success : colors.error,
                  },
                ]}
              >
                {changePercentage >= 0 ? "+" : ""}
                {changePercentage}% vs last {selectedRange.toLowerCase()}
              </Text>
            </View>
          </View>

          {renderChart()}
        </View>

        {/* Category Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>

          <View style={styles.pieChartContainer}>
            <RNPieChart
              data={categoryData}
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
            {categoryData.map((category, index) => (
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
                  <Text style={styles.categoryAmount}>${category.amount}</Text>
                  <Text style={styles.categoryPercentage}>
                    {category.percentage}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Merchants */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Merchants</Text>

          <View style={styles.merchantsList}>
            <View style={styles.merchantItem}>
              <View style={styles.merchantIconContainer}>
                <Text style={styles.merchantIconText}>🛒</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>Amazon</Text>
                <Text style={styles.merchantTransactions}>12 transactions</Text>
              </View>
              <Text style={styles.merchantAmount}>$245</Text>
            </View>

            <View style={styles.merchantItem}>
              <View style={styles.merchantIconContainer}>
                <Text style={styles.merchantIconText}>🍔</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>UberEats</Text>
                <Text style={styles.merchantTransactions}>8 transactions</Text>
              </View>
              <Text style={styles.merchantAmount}>$172</Text>
            </View>

            <View style={styles.merchantItem}>
              <View style={styles.merchantIconContainer}>
                <Text style={styles.merchantIconText}>⛽</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>Shell</Text>
                <Text style={styles.merchantTransactions}>4 transactions</Text>
              </View>
              <Text style={styles.merchantAmount}>$120</Text>
            </View>
          </View>
        </View>

        {/* Spending Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Insights</Text>

          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <TrendingUp color={colors.error} size={20} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightText}>
                Your restaurant spending increased by 23% compared to last
                month.
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <PieChart color={colors.success} size={20} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightText}>
                You've stayed under your shopping budget this month. Great job!
              </Text>
            </View>
          </View>
        </View>
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
                  selectedRange === range && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedRange(range);
                  setTimeRangeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedRange === range && styles.selectedOptionText,
                  ]}
                >
                  {range}
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
    paddingHorizontal: 16,
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
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.backgroundDark}80`,
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
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
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
