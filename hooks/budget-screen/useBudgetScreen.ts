import { useBudgets } from "@/contexts/BudgetsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, Animated } from "react-native";

export const useBudgetsScreen = () => {
  const { budgets, deleteBudget, fetchBudgets } = useBudgets();
  const router = useRouter();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(0)).current;

  const budgetCountLabel = `${budgets.length} ${
    budgets.length === 1 ? "budget" : "budgets"
  } active`;

  const handleDeleteBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return;

    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete "${budget.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteBudget(budgetId);
          },
        },
      ]
    );
  };

  const handleEditBudget = (budgetId: string) => {
    router.push(`/budgets/edit-budget/${budgetId}`);
  };

  useEffect(() => {
    Animated.spring(headerAnimation, {
      toValue: 1,
      useNativeDriver: true,
      delay: 100,
    }).start();

    Animated.spring(fabAnimation, {
      toValue: 1,
      useNativeDriver: true,
      delay: 400,
    }).start();
  }, []);
  const animateFAB = (scale: number) => {
    Animated.spring(fabAnimation, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return {
    budgets,
    budgetCountLabel,
    handleDeleteBudget,
    handleEditBudget,
    fetchBudgets,
    animateFAB,
    headerAnimation,
    fabAnimation,
  };
};
