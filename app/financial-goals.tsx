import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { colors } from "@/constants/colors";
import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { calculatePercentage, formatCurrency } from "../utils/formatting";

const FinancialGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const { goals, deleteGoal } = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

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

  const renderRightActions = (goal: GoalModel) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        onPress={() => handleDeleteGoal(goal.id || "")}
        style={[styles.swipeBtn, { backgroundColor: "red" }]}
      >
        <Feather name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = (goal: GoalModel) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        onPress={() => router.push(`./goals/edit-goal/${goal.id}`)}
        style={[styles.swipeBtn, { backgroundColor: "orange" }]}
      >
        <Feather name="edit-2" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity onPress={handleAddGoal}>
          <Feather name="plus" size={26} color={colors.primary[500]} />
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
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id ?? ""}
        contentContainerStyle={styles.goalsList}
        renderItem={({ item }) => {
          const progressPercentage = calculatePercentage(
            item.current_amount,
            item.target_amount
          );
          const progressColor = getProgressColor(progressPercentage);

          return (
            <Swipeable
              renderLeftActions={() => renderLeftActions(item)}
              renderRightActions={() => renderRightActions(item)}
            >
              <TouchableOpacity
                style={styles.goalCard}
                onPress={() => handleSelectGoal(item)}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{item.title}</Text>
                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push(`./goals/edit-goal/${item.id}`)
                      }
                    >
                      <Feather
                        name="edit-2"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteGoal(item.id ?? "")}
                    >
                      <Feather
                        name="trash"
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
                    {formatCurrency(item.current_amount)} /{" "}
                    {formatCurrency(item.target_amount)}
                  </Text>

                  <Text style={styles.goalDate}>
                    Target: {new Date(item.end_date).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
    backgroundColor: colors.background, // flat, clean
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)", // subtle divider
  },
  headerTitle: {
    fontSize: 22,
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
  goalsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  swipeBtn: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  goalCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    fontFamily: "Montserrat",
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary[500],
    fontFamily: "Montserrat",
  },
  goalDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: "Montserrat",
  },
});

export default FinancialGoalsScreen;
