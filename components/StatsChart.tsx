import React from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../constants/colors";

interface StatsChartProps {
  data: number[];
  labels: string[];
}

export default function StatsChart({ data, labels }: StatsChartProps) {
  return (
    <View>
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        bezier
      />
    </View>
  );
}
