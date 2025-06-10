import GoalsList from "@/components/goalsComponents/GoalsList";
import GoalsSummaryCards from "@/components/goalsComponents/GoalSummaryCards";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";

import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { colors } from "@/constants/colors";
import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FinancialGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const { goals, deleteGoal } = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((acc, goal) => acc + goal.current_amount, 0);
  const router = useRouter();

  const averageCompletionRate =
    goals.length > 0
      ? (goals.reduce(
          (acc, goal) => acc + goal.current_amount / goal.target_amount,
          0
        ) /
          goals.length) *
        100
      : 0;

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("./goals/add-goal");
  };

  const handleSelectGoal = (goal: GoalModel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`./goals/goal-details/${goal.id}`);
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

  useEffect(() => {
    Animated.spring(fabAnimation, {
      toValue: 1,
      useNativeDriver: true,
      delay: 400,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedCard delay={100}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>Goals</Text>
          <TouchableOpacity
            onPress={() => router.push("./profile")}
            style={styles.iconButton}
          >
            <Feather name="user" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </AnimatedCard>
      <AnimatedCard delay={150}>
        <GoalsSummaryCards
          totalGoals={totalGoals}
          totalSaved={totalSaved}
          averageCompletionRate={averageCompletionRate}
        />
      </AnimatedCard>
      <AnimatedCard delay={200}>
        <GoalsList
          goals={goals}
          onEdit={(id) => router.push(`./goals/edit-goal/${id}`)}
          onDelete={handleDeleteGoal}
          onSelect={handleSelectGoal}
        />
      </AnimatedCard>
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabAnimation }],
            bottom: insets.bottom + 100,
            opacity: fabAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddGoal}
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
});

export default FinancialGoalsScreen;
