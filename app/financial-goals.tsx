import GoalsList from "@/components/goalsComponents/GoalsList";
import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { colors } from "@/constants/colors";
import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../utils/formatting";

const FinancialGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const { goals, deleteGoal } = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((acc, goal) => acc + goal.current_amount, 0);

  const calculateCompletionRate = () => {
    const totalProgress = goals.reduce((acc, goal) => {
      return acc + goal.current_amount / goal.target_amount;
    }, 0);
    return goals.length > 0 ? (totalProgress / goals.length) * 100 : 0;
  };

  const averageCompletionRate = calculateCompletionRate();

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("./goals/add-goal");
  };

  const handleSelectGoal = (goal: GoalModel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`./goals/goal-details/${goal.id}`);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return colors.error;
    if (percentage < 70) return colors.primary[400];
    return colors.success;
  };

  const handleDeleteGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoalId(goalId);
    setModalVisible(true);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedGoalId) return;
    try {
      await deleteGoal(selectedGoalId);
    } catch (error) {
      console.error("Error deleting goal:", error);
    } finally {
      setModalVisible(false);
      setSelectedGoalId(null);
    }
  };

  const handleDeleteCancel = () => {
    setModalVisible(false);
    setSelectedGoalId(null);
  };

  const animateFAB = (scale: number) => {
    Animated.spring(fabAnimation, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity
          onPress={() => router.push("./profile")}
          style={styles.iconButton}
        >
          <Feather name="user" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

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
      <GoalsList
        goals={goals}
        onEdit={(id) => router.push(`./goals/edit-goal/${id}`)}
        onDelete={handleDeleteGoal}
        onSelect={handleSelectGoal}
      />

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabAnimation }],
            bottom: insets.bottom + 100,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            handleAddGoal();
          }}
          onPressIn={() => animateFAB(0.9)}
          onPressOut={() => animateFAB(1)}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      <BottomBar />
      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* Safe area insets for bottom bar */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    fontFamily: "Montserrat",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: "Montserrat",
  },
});

export default FinancialGoalsScreen;
