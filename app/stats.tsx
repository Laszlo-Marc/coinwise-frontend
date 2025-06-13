import { useStatsContext } from "@/contexts/StatsContext";
import React, { useEffect } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomBar from "@/components/mainComponents/BottomBar";
import { CategoryBreakdown } from "@/components/statsComponents/CategoryBreakdown";
import { SavingsSummary } from "@/components/statsComponents/SavingsSummary";
import { StatsChartCard } from "@/components/statsComponents/StatsChartCard";
import { StatsHeader } from "@/components/statsComponents/StatsHeader";
import TimeRangeSelectorModal from "@/components/statsComponents/TimeRangeSelectorModal";
import { TopExpenses } from "@/components/statsComponents/TopExpenses";
import { TransferOverview } from "@/components/statsComponents/TransferOverview";
import { colors } from "@/constants/colors";
import { useStatsRange } from "@/hooks/stats-hooks/useStatsRange";
import { useStatsTabs } from "@/hooks/stats-hooks/useStatsTab";
import { useTransformedStats } from "@/hooks/stats-hooks/useTransformedStats";
import { Entypo, Feather } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width * 0.9;

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();

  // Context
  const {
    statsOverview,
    expenseStats,
    incomeStats,
    transferStats,
    loading,
    error,
    refreshStats,
  } = useStatsContext();

  // UI Hooks
  const { activeTab, setActiveTab, chartType, setChartType } = useStatsTabs();
  const {
    selectedRange,
    setSelectedRange,
    modalVisible,
    setModalVisible,
    ranges,
    label: rangeLabel,
  } = useStatsRange();

  const [refreshing, setRefreshing] = React.useState(false);

  // Cash flow simulation for savings chart (until you fetch it from context/backend)
  const mockCashFlow = [
    { period: "2024-01", net_flow: 200 },
    { period: "2024-02", net_flow: -50 },
    { period: "2024-03", net_flow: 120 },
  ];

  // Transformed data for chart/pie
  const { chartData, pieData, currentStats } = useTransformedStats({
    activeTab,
    expenseStats,
    incomeStats,
    statsOverview,
    cashFlowData: mockCashFlow,
  });

  // Initial + range refresh
  useEffect(() => {
    refreshStats(selectedRange);
  }, [selectedRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStats(selectedRange);
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <StatusBar barStyle="light-content" />
        <View>
          <Text style={{ color: colors.text, fontSize: 18 }}>
            Loading statistics...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <StatsHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Range Selector */}
        <View
          style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 16 }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.backgroundLight,
              padding: 10,
              borderRadius: 20,
              alignSelf: "flex-start",
            }}
          >
            <Feather name="calendar" size={18} color={colors.primary[400]} />
            <Text style={{ color: colors.primary[400], marginHorizontal: 8 }}>
              {rangeLabel}
            </Text>
            <Entypo name="chevron-down" size={18} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <StatsChartCard
          chartType={chartType}
          onChartTypeChange={setChartType}
          chartData={chartData}
          total={currentStats.total}
          change={currentStats.change}
          width={screenWidth - 32}
        />

        {/* Spending Tab Components */}
        {activeTab === "spending" && (
          <>
            <CategoryBreakdown
              pieData={pieData}
              chartWidth={screenWidth - 32}
            />
            <TopExpenses expenses={expenseStats?.top5Expenses || []} />
          </>
        )}

        {/* Income Tab Components */}
        {activeTab === "income" && transferStats && (
          <TransferOverview data={transferStats} />
        )}

        {/* Savings Tab Components */}
        {activeTab === "savings" && statsOverview && (
          <SavingsSummary overview={statsOverview} />
        )}
      </ScrollView>

      {/* Time Range Modal */}
      <TimeRangeSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(val) => {
          setSelectedRange(val);
          setModalVisible(false);
        }}
        selectedRange={selectedRange}
        options={ranges}
      />

      <BottomBar />
    </View>
  );
}
