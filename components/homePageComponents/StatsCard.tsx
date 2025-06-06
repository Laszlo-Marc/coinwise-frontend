import { colors } from "@/constants/colors";
import { formatCurrency } from "@/hooks/goals-helpers";
import { TransactionModel } from "@/models/transaction";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  summaryData: {
    last3Months: { income: number; expenses: number };
    allTime: { income: number; expenses: number };
  };
  transactions: TransactionModel[]; // Replace with your actual Transaction type
};

export default function StatsOverviewSection({
  summaryData,
  transactions,
}: Props) {
  return (
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
                  ((summaryData.allTime.income - summaryData.allTime.expenses) /
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
  );
}

const styles = StyleSheet.create({
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
});
