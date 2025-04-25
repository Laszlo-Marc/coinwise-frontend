import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

interface CategoryChartProps {
  data: {
    name: string;
    spending: number;
    color: string;
  }[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const maxSpending = Math.max(...data.map((item) => item.spending));

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.label}>{item.name}</Text>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  width: `${(item.spending / maxSpending) * 100}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
            <Text style={styles.amount}>${item.spending}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 16,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    width: 80,
    color: colors.text,
    fontSize: 14,
  },
  barWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  amount: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 60,
  },
});
