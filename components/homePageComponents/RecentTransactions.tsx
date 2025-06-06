import { colors } from "@/constants/colors";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatCurrency } from "@/hooks/goals-helpers";
import { formatDate } from "@/hooks/home-page/formatHooks";
import { TransactionModel } from "@/models/transaction";

type Props = {
  recentTransactions: TransactionModel[];
};

export default function RecentTransactionsCard({ recentTransactions }: Props) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.sectionHeaderButton}
        onPress={() => router.replace("./transactions")}
      >
        <Text style={styles.sectionHeaderText}>Recent Transactions</Text>
        <Entypo name="chevron-right" size={24} color={colors.text} />
      </TouchableOpacity>

      {recentTransactions.length > 0 ? (
        <FlatList
          data={recentTransactions}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? index.toString()
          }
          renderItem={({ item }) => <TransactionItem transaction={item} />}
        />
      ) : (
        <View style={styles.transactionsEmptyState}>
          <View style={styles.emptyStateIcon}>
            <Text style={styles.emptyStateIconText}>🧩</Text>
          </View>
          <Text style={styles.emptyStateText}>No transactions yet</Text>
        </View>
      )}
    </View>
  );
}

function TransactionItem({ transaction }: { transaction: TransactionModel }) {
  const isIncome = transaction.type === "income";
  const color = isIncome ? "#4CAF50" : "#F44336";

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: color }]}>
          <Ionicons
            name={isIncome ? "arrow-down" : "arrow-up"}
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
      <Text style={[styles.transactionAmount, { color }]}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </Text>
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
