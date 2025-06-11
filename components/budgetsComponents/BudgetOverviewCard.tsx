import { colors } from "@/constants/colors";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  budget: {
    spent: number;
    remaining: number;
    amount: number;
  };
  progressPercentage: number;
  progressAnim: Animated.Value;
  daysLeft: number;
  dailyBudget: number;
}

const BudgetOverviewCard: React.FC<Props> = ({
  budget,
  progressPercentage,
  progressAnim,
  daysLeft,
  dailyBudget,
}) => {
  const getStatusColor = () => {
    if (progressPercentage <= 50) return "#4ECDC4";
    if (progressPercentage <= 80) return "#FECA57";
    return "#FF6B6B";
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Budget Overview
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {progressPercentage.toFixed(1)}% Used
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: getStatusColor(),
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", `${Math.min(100, progressPercentage)}%`],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.amountsRow}>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Spent</Text>
          <Text style={styles.value}>RON {budget.spent.toFixed(2)}</Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Remaining</Text>
          <Text
            style={[
              styles.value,
              { color: budget.remaining >= 0 ? "#4ECDC4" : "#FF6B6B" },
            ]}
          >
            RON {budget.remaining.toFixed(2)}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>RON {budget.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.label}>Days Left</Text>
          <Text style={styles.value}>
            {daysLeft > 0 ? daysLeft : "Expired"}
          </Text>
        </View>
        <View style={styles.timeColumn}>
          <Text style={styles.label}>Daily Budget</Text>
          <Text style={styles.value}>RON {dailyBudget.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    backgroundColor: colors.backgroundDark + "60",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountColumn: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeColumn: {
    flex: 1,
    alignItems: "center",
  },
});

export default BudgetOverviewCard;
