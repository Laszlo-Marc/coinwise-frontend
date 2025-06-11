import BudgetDetailsHeader from "@/components/budgetsComponents/BudgetDetailsHeader";
import BudgetOverviewCard from "@/components/budgetsComponents/BudgetOverviewCard";
import BudgetTransactionsList from "@/components/budgetsComponents/BudgetTransactionsList";
import QuickActionsCard from "@/components/budgetsComponents/QuickActionsCard";
import { colors } from "@/constants/colors";
import { useBudgets } from "@/contexts/BudgetsContext";
import { BudgetModel } from "@/models/budget";
import { TransactionModel } from "@/models/transaction";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BudgetDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { budgets, budgetTransactions } = useBudgets();
  const [budgetTxn, setBudgetTxn] = useState<TransactionModel[]>([]);
  const [budget, setBudget] = useState<BudgetModel | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const budgetId = Array.isArray(id) ? id[0] : id;
    const foundBudget = budgets.find((b) => b.id === budgetId);
    if (foundBudget) {
      setBudget(foundBudget);
      setBudgetTxn(budgetTransactions[budgetId]);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: foundBudget.spent / foundBudget.amount,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Alert.alert("Error", "Budget not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [id, budgets]);

  if (!budget) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.text, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary[500] + "60", colors.background]}
        style={styles.container}
      >
        <BudgetDetailsHeader budget={budget} />

        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BudgetOverviewCard
            budget={budget}
            progressAnim={progressAnim}
            progressPercentage={0}
            daysLeft={0}
            dailyBudget={0}
          />

          <QuickActionsCard
            onAddExpense={() => setShowAddExpenseModal(true)}
            onEditBudget={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <BudgetTransactionsList transactions={budgetTxn} />
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
});

export default BudgetDetailsScreen;
