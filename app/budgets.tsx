import { colors } from "@/constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BudgetList from "@/components/budgetsComponents/BudgetList";
import EnhancedBudgetOverviewCard from "@/components/budgetsComponents/BudgetOverviewCard";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import AnimatedHeader from "@/components/mainComponents/AnimatedHeader";
import { useStatsContext } from "@/contexts/StatsContext";
import { useBudgetsScreen } from "@/hooks/budget-screen/useBudgetScreen";
import { useRouter } from "expo-router";
import BottomBar from "../components/mainComponents/BottomBar";

const BudgetsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { budgetStats } = useStatsContext();
  const {
    budgets,
    budgetCountLabel,
    handleDeleteBudget,
    handleEditBudget,
    fetchBudgets,
    animateFAB,
    headerAnimation,
    fabAnimation,
  } = useBudgetsScreen();

  const handleRefresh = async () => {
    fetchBudgets();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[500]}
      />

      <AnimatedHeader
        title="BUDGETS"
        subtitle={budgetCountLabel}
        animatedValue={headerAnimation}
        leftIcon={
          <TouchableOpacity onPress={() => router.replace("/transactions")}>
            <Ionicons name="wallet-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
        onProfilePress={() => router.push("/profile")}
        gradientColors={["rgba(75, 108, 183, 0.8)", "rgba(24, 40, 72, 0.8)"]}
      />

      {/* Budget List */}

      <BudgetList
        budgets={budgets}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
        onRefresh={handleRefresh}
        headerComponent={
          <AnimatedCard delay={100}>
            <EnhancedBudgetOverviewCard
              budgetStats={budgetStats["this_month"]}
              progressAnim={new Animated.Value(0)}
            />
          </AnimatedCard>
        }
      />

      {/* Floating Action Button */}
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
          onPress={() => router.push("/budgets/add-budget")}
          onPressIn={() => animateFAB(0.9)}
          onPressOut={() => animateFAB(1)}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Bar */}
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
    fontFamily: "Montserrat",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backdropFilter: "blur(10px)",
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
    backgroundColor: colors.secondary[500],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.secondaryLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default BudgetsScreen;
