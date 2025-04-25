import { ExternalLink } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";

interface TransactionItemProps {
  title: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  onPress?: () => void;
}

export default function TransactionItem({
  title,
  amount,
  date,
  category,
  type,
  onPress,
}: TransactionItemProps) {
  const getIcon = () => {
    if (type === "income") {
      return <ExternalLink size={18} color={colors.textSecondary} />;
    }
    return <ExternalLink size={18} color={colors.textSecondary} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundLight,
          borderColor: colors.primary[800],
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text
            style={[
              styles.amount,
              {
                color: type === "income" ? colors.success : colors.error,
              },
            ]}
          >
            {type === "income" ? "+" : "-"}${Math.abs(amount).toFixed(2)}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            {category}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  category: {
    fontSize: 14,
  },
  date: {
    fontSize: 14,
  },
});
