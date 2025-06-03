// screens/BudgetsScreen.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BudgetList from "@/components/budgetsComponents/BudgetList";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useRouter } from "expo-router";
import BottomBar from "../components/mainComponents/BottomBar";

const BudgetsScreen = () => {
  const insets = useSafeAreaInsets();
  const { budgets, deleteBudget, fetchBudgets } = useBudgets();
  const router = useRouter();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    
    Animated.spring(headerAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, []);

  const handleDeleteBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);

    if (!budget) return;

    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete "${budget.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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

  const handleRefresh = async () => {
    fetchBudgets();
  };
  const handleEditBudget = () => {
    router.replace("/budgets/add-budget");
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[500]}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnimation,
            transform: [
              {
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.secondary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>BUDGETS</Text>
              <Text style={styles.headerSubtitle}>
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}{" "}
                active
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Budget List */}
      <BudgetList
        budgets={budgets}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
        onAddBudget={() => {
          router.replace("/budgets/add-budget");
        }}
        onRefresh={handleRefresh}
      />

      {/* Floating Action Button */}
      {budgets.length > 0 && (
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
              router.replace("/budgets/add-budget");
            }}
            onPressIn={() => animateFAB(0.9)}
            onPressOut={() => animateFAB(1)}
            activeOpacity={0.9}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}

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

export default BudgetsScreen;
