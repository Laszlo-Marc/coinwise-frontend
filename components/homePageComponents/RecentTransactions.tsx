import { colors } from "@/constants/colors";
import { formatCurrency, formatDate } from "@/hooks/home-page/formatHooks";
import { TransactionModel } from "@/models/transaction";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  transactions: TransactionModel[];
}

const RecentTransactionsCard: React.FC<Props> = ({ transactions }) => {
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

      {transactions.length > 0 ? (
        <View>
          {transactions.map((transaction, index) => (
            <View key={transaction.id || index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.type === "income"
                          ? colors.success || "#4CAF50"
                          : colors.error || "#F44336",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      transaction.type === "income" ? "arrow-down" : "arrow-up"
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
                        ? colors.success || "#4CAF50"
                        : colors.error || "#F44336",
                  },
                ]}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
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
  );
};

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

export default RecentTransactionsCard;
