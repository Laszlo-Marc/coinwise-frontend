import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";

import ProgressCardSection from "@/components/homePageComponents/GoalsBudgetsCard";
import StatsOverviewSection from "@/components/homePageComponents/StatsCard";
import SummaryOverviewSection from "@/components/homePageComponents/SummaryCard";
import { formatCurrency, formatDate } from "@/hooks/home-page/formatHooks";
import { useClosestGoals } from "@/hooks/home-page/useClosestGoals";
import { useCurrentBalance } from "@/hooks/home-page/useCurrentBalance";
import { useRecentTransactions } from "@/hooks/home-page/useRecentTransactions";
import { useRiskiestBudgets } from "@/hooks/home-page/useRiskiestBudgets";
import { useSummaryData } from "@/hooks/home-page/useSummaryData";
import { TransactionModel } from "@/models/transaction";
import { Entypo, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-gesture-handler";
import BottomBar from "../components/mainComponents/BottomBar";
import { colors } from "../constants/colors";

export default function HomePage() {
  const router = useRouter();
  const { state } = useAuth();
  const { goals } = useGoals();
  const { budgets } = useBudgets();
  const { transactions } = useTransactionContext();
  const recentTransactions = useRecentTransactions(transactions);
  const summaryData = useSummaryData(transactions, state.user);
  const closestGoals = useClosestGoals(goals);
  const riskiestBudgets = useRiskiestBudgets(budgets, transactions);
  const currentBalance = useCurrentBalance(transactions, state.user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Main Balance Section with Gradient */}
      <LinearGradient
        colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceSection}
      >
        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace("./transactions")}
          >
            <View style={styles.actionIconContainer}>
              <FontAwesome name="bank" size={24} color={colors.text} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("./profile")}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="user" size={24} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Main · RON</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(currentBalance)}
          </Text>
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
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
        <SummaryOverviewSection summaryData={summaryData} />
        <StatsOverviewSection
          summaryData={summaryData}
          transactions={transactions}
        />

        <ProgressCardSection
          title="Financial Goals"
          items={closestGoals}
          type="goal"
          navigateTo="./financial-goals"
          onCreatePress={() => router.push("/goals/add-goal")}
        />

        <ProgressCardSection
          title="Budgets"
          items={riskiestBudgets}
          type="budget"
          navigateTo="./budgets"
          onCreatePress={() => router.push("/budgets/add-budget")}
        />

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
  scrollViewContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 30 : 20, // Adjust for status bar height
  },
  balanceSection: {
    paddingTop: Platform.OS === "ios" ? 100 : 80,
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
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Montserrat",
    alignContent: "center",
    textAlign: "center",
  },
  quickActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
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
});
