import BudgetDetailsHeader from "@/components/budgetsComponents/BudgetDetailsHeader";
import BudgetDetailsOverviewCard from "@/components/budgetsComponents/BudgetDetailsOverview";
import BudgetTransactionsChart from "@/components/budgetsComponents/BudgetTransactionsChart";
import BudgetTransactionsList from "@/components/budgetsComponents/BudgetTransactionsList";

import QuickActionsCard from "@/components/budgetsComponents/QuickActionsCard";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import { colors } from "@/constants/colors";
import { useBudgets } from "@/contexts/BudgetsContext";
import { BudgetModel } from "@/models/budget";
import { TransactionModel } from "@/models/transaction";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";

const BudgetDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { budgets, budgetTransactions } = useBudgets();
  const [budgetTxn, setBudgetTxn] = useState<TransactionModel[]>([]);
  const [budget, setBudget] = useState<BudgetModel | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const shouldShowChart = useMemo(() => {
    if (!budgetTxn || budgetTxn.length === 0) return false;

    const uniqueDays = new Set(
      budgetTxn.map((txn) => new Date(txn.date).toDateString())
    );

    return uniqueDays.size >= 2;
  }, [budgetTxn]);

  useEffect(() => {
    const budgetId = Array.isArray(id) ? id[0] : id;
    const foundBudget = budgets.find((b) => b.id === budgetId);
    if (foundBudget) {
      setBudget(foundBudget);
      setBudgetTxn(budgetTransactions[budgetId] || []);
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
  }, [id, budgets, budgetTransactions]);

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
        <AnimatedCard delay={50}>
          <BudgetDetailsHeader budget={budget} />
        </AnimatedCard>

        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedCard delay={100}>
            <BudgetDetailsOverviewCard
              budget={budget}
              progressAnim={progressAnim}
            />
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <QuickActionsCard
              onAddExpense={() => setShowAddExpenseModal(true)}
              onEditBudget={() =>
                router.push(`/budgets/edit-budget/${budget.id}`)
              }
            />
          </AnimatedCard>
          <AnimatedCard delay={300}>
            {shouldShowChart ? (
              <BudgetTransactionsChart transactions={budgetTxn} />
            ) : (
              <BudgetTransactionsChart transactions={[]} showPlaceholder />
            )}
          </AnimatedCard>
          <AnimatedCard delay={400}>
            <BudgetTransactionsList transactions={budgetTxn} />
          </AnimatedCard>
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
