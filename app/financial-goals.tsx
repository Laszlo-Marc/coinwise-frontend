import BottomBar from "@/components/BottomBar";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { calculatePercentage, formatCurrency } from "../utils/formatting";

// Mock data for initial development
const initialGoals = [
  {
    id: "g1",
    title: "Emergency Fund",
    description: "Build a 6-month emergency fund",
    targetAmount: 10000,
    currentAmount: 4500,
    startDate: "2025-01-01",
    targetDate: "2025-12-31",
    isRecurring: false,
    category: "Savings",
    status: "active",
    progressHistory: [
      { date: "2025-01-15", amountAdded: 1000 },
      { date: "2025-02-15", amountAdded: 1500 },
      { date: "2025-03-15", amountAdded: 2000 },
    ],
  },
  {
    id: "g2",
    title: "Trip to Japan ✈️",
    description: "Save for dream vacation",
    targetAmount: 5000,
    currentAmount: 1500,
    startDate: "2025-02-01",
    targetDate: "2025-09-01",
    isRecurring: false,
    category: "Travel",
    status: "active",
    progressHistory: [
      { date: "2025-02-10", amountAdded: 500 },
      { date: "2025-03-10", amountAdded: 500 },
      { date: "2025-04-10", amountAdded: 500 },
    ],
  },
  {
    id: "g3",
    title: "New Laptop 💻",
    description: "Replace old computer",
    targetAmount: 2000,
    currentAmount: 1800,
    startDate: "2025-01-15",
    targetDate: "2025-04-30",
    isRecurring: false,
    category: "Tech",
    status: "active",
    progressHistory: [
      { date: "2025-02-01", amountAdded: 800 },
      { date: "2025-03-01", amountAdded: 500 },
      { date: "2025-04-01", amountAdded: 500 },
    ],
  },
  {
    id: "g4",
    title: "Emergency Fund",
    description: "Build a 6-month emergency fund",
    targetAmount: 10000,
    currentAmount: 4500,
    startDate: "2025-01-01",
    targetDate: "2025-12-31",
    isRecurring: false,
    category: "Savings",
    status: "active",
    progressHistory: [
      { date: "2025-01-15", amountAdded: 1000 },
      { date: "2025-02-15", amountAdded: 1500 },
      { date: "2025-03-15", amountAdded: 2000 },
    ],
  },
  {
    id: "g5",
    title: "Trip to Japan ✈️",
    description: "Save for dream vacation",
    targetAmount: 5000,
    currentAmount: 1500,
    startDate: "2025-02-01",
    targetDate: "2025-09-01",
    isRecurring: false,
    category: "Travel",
    status: "active",
    progressHistory: [
      { date: "2025-02-10", amountAdded: 500 },
      { date: "2025-03-10", amountAdded: 500 },
      { date: "2025-04-10", amountAdded: 500 },
    ],
  },
  {
    id: "g6",
    title: "New Laptop 💻",
    description: "Replace old computer",
    targetAmount: 2000,
    currentAmount: 1800,
    startDate: "2025-01-15",
    targetDate: "2025-04-30",
    isRecurring: false,
    category: "Tech",
    status: "active",
    progressHistory: [
      { date: "2025-02-01", amountAdded: 800 },
      { date: "2025-03-01", amountAdded: 500 },
      { date: "2025-04-01", amountAdded: 500 },
    ],
  },
  {
    id: "g7",
    title: "Emergency Fund",
    description: "Build a 6-month emergency fund",
    targetAmount: 10000,
    currentAmount: 4500,
    startDate: "2025-01-01",
    targetDate: "2025-12-31",
    isRecurring: false,
    category: "Savings",
    status: "active",
    progressHistory: [
      { date: "2025-01-15", amountAdded: 1000 },
      { date: "2025-02-15", amountAdded: 1500 },
      { date: "2025-03-15", amountAdded: 2000 },
    ],
  },
  {
    id: "g8",
    title: "Trip to Japan ✈️",
    description: "Save for dream vacation",
    targetAmount: 5000,
    currentAmount: 1500,
    startDate: "2025-02-01",
    targetDate: "2025-09-01",
    isRecurring: false,
    category: "Travel",
    status: "active",
    progressHistory: [
      { date: "2025-02-10", amountAdded: 500 },
      { date: "2025-03-10", amountAdded: 500 },
      { date: "2025-04-10", amountAdded: 500 },
    ],
  },
  {
    id: "g9",
    title: "New Laptop 💻",
    description: "Replace old computer",
    targetAmount: 2000,
    currentAmount: 1800,
    startDate: "2025-01-15",
    targetDate: "2025-04-30",
    isRecurring: false,
    category: "Tech",
    status: "active",
    progressHistory: [
      { date: "2025-02-01", amountAdded: 800 },
      { date: "2025-03-01", amountAdded: 500 },
      { date: "2025-04-01", amountAdded: 500 },
    ],
  },
];

const FinancialGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState(initialGoals);

  // Calculate summary data
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);

  const calculateCompletionRate = () => {
    const totalProgress = goals.reduce((acc, goal) => {
      return acc + goal.currentAmount / goal.targetAmount;
    }, 0);
    return goals.length > 0 ? (totalProgress / goals.length) * 100 : 0;
  };

  const averageCompletionRate = calculateCompletionRate();

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/add-goal");
  };

  const handleSelectGoal = (goal: {
    id: any;
    title?: string;
    description?: string;
    targetAmount?: number;
    currentAmount?: number;
    startDate?: string;
    targetDate?: string;
    isRecurring?: boolean;
    category?: string;
    status?: string;
    progressHistory?: { date: string; amountAdded: number }[];
  }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/goal-details/${goal.id}`);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return colors.error;
    if (percentage < 70) return colors.primary[400];
    return colors.success;
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.secondary[500], colors.primary[500]]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.headerTitle}>Financial Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Feather name="plus" size={24} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Summary */}
      <View style={styles.summaryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Goals</Text>
            <Text style={styles.summaryValue}>{totalGoals}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Saved</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalSaved)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={styles.summaryValue}>
              {averageCompletionRate.toFixed(0)}%
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Goals List */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.goalsList}
        renderItem={({ item }) => {
          const progressPercentage = calculatePercentage(
            item.currentAmount,
            item.targetAmount
          );
          const progressColor = getProgressColor(progressPercentage);

          return (
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => handleSelectGoal(item)}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <View style={styles.goalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather
                      name="edit-2"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather
                      name="archive"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>

              <View style={styles.goalDetails}>
                <Text style={styles.goalAmount}>
                  {formatCurrency(item.currentAmount)} /{" "}
                  {formatCurrency(item.targetAmount)}
                </Text>

                <Text style={styles.goalDate}>
                  Target: {new Date(item.targetDate).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <BottomBar />

      {/* Safe area insets for bottom bar */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundLight,
  },
  summaryCard: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 120,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  goalsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
  goalCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  goalActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  goalAmount: {
    fontSize: 16,
    color: colors.text,
  },
  goalDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default FinancialGoalsScreen;
