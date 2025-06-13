import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  expenses: TransactionModel[];
};

export const TopExpenses: React.FC<Props> = ({ expenses }) => {
  if (!expenses.length) return null;

  const getIcon = (category?: string) => {
    switch (category) {
      case "food":
        return "🍔";
      case "transport":
        return "🚗";
      case "shopping":
        return "🛒";
      case "entertainment":
        return "🎮";
      case "health":
        return "💊";
      default:
        return "💰";
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Expenses</Text>
      <View style={styles.list}>
        {expenses.map((expense) => (
          <View key={expense.id} style={styles.item}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIcon(expense.category)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>
                {expense.merchant || expense.description || "Unknown"}
              </Text>
              <Text style={styles.subtext}>
                {expense.category || "uncategorized"} •{" "}
                {new Date(expense.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>{expense.amount.toFixed(0)} RON</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  list: {
    marginTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.backgroundDark}80`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  amount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
