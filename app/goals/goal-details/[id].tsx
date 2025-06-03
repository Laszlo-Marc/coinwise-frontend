import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import { ContributionModel } from "@/models/goal-contribution";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";
import {
  calculatePercentage,
  formatCurrency,
} from "../../../hooks/goals-helpers";

const GoalDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goals, contributions } = useGoals();
  const [goal, setGoal] = useState<GoalModel | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));
  const [correspondingContributions, setCorrespondingContributions] = useState<
    ContributionModel[]
  >([]);
  useFocusEffect(
    useCallback(() => {
      const foundGoal = goals.find((g) => g.id === id);
      setGoal(foundGoal ?? null);
      const matchingContributions = contributions.filter(
        (c) => c.goal_id === String(id)
      );
      setCorrespondingContributions(matchingContributions);
      if (foundGoal) {
        const progressPercentage = calculatePercentage(
          foundGoal.current_amount,
          foundGoal.target_amount
        );
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
          toValue: progressPercentage / 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
    }, [id, goals])
  );

  const getProgressColor = (percentage: number): string => {
    if (percentage < 30) return colors.error;
    if (percentage < 70) return colors.primary[400];
    return colors.success;
  };

  const handleAddContribution = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`./add-contribution/${goal?.id}`);
  };

  const handleEditGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`../edit-goal/${goal?.id}`);
  };

  if (!goal) return null;

  const progressPercentage = calculatePercentage(
    goal.current_amount,
    goal.target_amount
  );
  const progressColor = getProgressColor(progressPercentage);

  const startDate = new Date(goal.start_date).toLocaleDateString();
  const targetDate = new Date(goal.end_date).toLocaleDateString();

  const targetDateObj = new Date(goal.end_date);
  const today = new Date();
  const monthsLeft =
    (targetDateObj.getFullYear() - today.getFullYear()) * 12 +
    (targetDateObj.getMonth() - today.getMonth());

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary[500], colors.primary[500]]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/financial-goals")}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{goal.title}</Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEditGoal}>
          <Feather name="edit-2" size={20} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Circle */}
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: progressColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  borderRadius: 10,
                },
              ]}
            />
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>
        {/* Goal Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.description}>{goal.description}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Amount:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(goal.target_amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Progress:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(goal.current_amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Remaining:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(goal.target_amount - goal.current_amount)}
            </Text>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelinePoint}>
              <Text style={styles.timelineDate}>{startDate}</Text>
              <Text style={styles.timelineLabel}>Start</Text>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelinePoint}>
              <Text style={styles.timelineDate}>{targetDate}</Text>
              <Text style={styles.timelineLabel}>
                {monthsLeft > 0 ? `${monthsLeft} months left` : "Due now"}
              </Text>
            </View>
          </View>

          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{goal.category}</Text>
          </View>
        </View>

        {/* Add Contribution Button */}
        <TouchableOpacity
          style={styles.addContributionButton}
          onPress={handleAddContribution}
        >
          <Feather name="plus" size={20} color={colors.text} />
          <Text style={styles.addContributionText}>Add Contribution</Text>
        </TouchableOpacity>

        {/* Contribution History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Contribution History</Text>

          {correspondingContributions.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              No contributions yet.
            </Text>
          ) : (
            correspondingContributions.map((contribution, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyDate}>
                    {new Date(contribution.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyAmount}>
                  +{formatCurrency(contribution.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  progressCircleContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  progressCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  progressText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
  detailsCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },
  timelinePoint: {
    alignItems: "center",
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.secondaryLight,
    marginHorizontal: 10,
  },
  timelineDate: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text,
  },
  addContributionButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  addContributionText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  historyDate: {
    fontSize: 14,
    color: colors.text,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
  },
});

export default GoalDetailsScreen;
