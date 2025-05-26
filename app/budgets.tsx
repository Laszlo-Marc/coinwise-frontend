// screens/BudgetsScreen.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BudgetItem, {
  Budget,
  SubBudget,
} from "../components/budgetsComponents/BudgetItem";
import BudgetModal from "../components/budgetsComponents/BudgetModal";
import EmptyState from "../components/budgetsComponents/EmptyState";
import BottomBar from "../components/mainComponents/BottomBar";

const initialBudgets: Budget[] = [];

const BudgetsScreen = () => {
  const insets = useSafeAreaInsets();
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetPeriod, setBudgetPeriod] = useState<
    "weekly" | "monthly" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [showNotificationThreshold, setShowNotificationThreshold] =
    useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState(80);
  const [showSubBudgets, setShowSubBudgets] = useState(false);
  const [subBudgets, setSubBudgets] = useState<SubBudget[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const modalAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimations = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    budgets.forEach((budget) => {
      if (!progressAnimations.current[budget.id]) {
        progressAnimations.current[budget.id] = new Animated.Value(0);
        Animated.timing(progressAnimations.current[budget.id], {
          toValue: budget.spent / budget.amount,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [budgets]);

  const handleAddBudget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    setIsEditMode(false);
    openModal();
  };

  const handleEditBudget = (budget: Budget) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentBudget(budget);
    setIsEditMode(true);

    setBudgetName(budget.name);
    setBudgetCategory(budget.category);
    setBudgetAmount(budget.amount.toString());
    setBudgetPeriod(budget.period);
    setStartDate(new Date(budget.startDate || new Date()));
    setEndDate(new Date(budget.endDate || new Date()));
    setShowNotificationThreshold(!!budget.threshold);
    setNotificationThreshold(budget.threshold || 80);
    setShowSubBudgets(!!budget.subBudgets?.length);
    setSubBudgets(budget.subBudgets || []);

    openModal();
  };

  const handleDeleteBudget = (budgetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBudgets(budgets.filter((b) => b.id !== budgetId));
  };

  const handleSaveBudget = () => {
    if (!budgetName.trim() || !budgetAmount.trim()) return;

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newBudget: Budget = {
      id: isEditMode && currentBudget ? currentBudget.id : `b${Date.now()}`,
      name: budgetName.trim(),
      category: budgetCategory,
      amount,
      spent: isEditMode && currentBudget ? currentBudget.spent : 0,
      period: budgetPeriod,
      createdAt:
        isEditMode && currentBudget
          ? currentBudget.createdAt
          : new Date().toISOString(),
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      threshold: showNotificationThreshold ? notificationThreshold : undefined,
      subBudgets: showSubBudgets ? subBudgets : undefined,
    };

    if (isEditMode) {
      setBudgets(budgets.map((b) => (b.id === newBudget.id ? newBudget : b)));
    } else {
      setBudgets([...budgets, newBudget]);
      progressAnimations.current[newBudget.id] = new Animated.Value(0);
      Animated.timing(progressAnimations.current[newBudget.id], {
        toValue: newBudget.spent / newBudget.amount,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }

    closeModal();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setBudgetName("");
    setBudgetCategory("Food");
    setBudgetAmount("");
    setBudgetPeriod("monthly");
    setStartDate(new Date());
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
    setShowNotificationThreshold(false);
    setNotificationThreshold(80);
    setShowSubBudgets(false);
    setSubBudgets([]);
    setCurrentBudget(null);
  };

  const addSubBudget = () => {
    const newSub: SubBudget = {
      id: `sb${Date.now()}`,
      name: "New Sub-Budget",
      amount: 0,
      spent: 0,
    };
    setSubBudgets([...subBudgets, newSub]);
  };

  const updateSubBudget = (
    id: string,
    field: keyof SubBudget,
    value: string | number
  ) => {
    setSubBudgets(
      subBudgets.map((sb) =>
        sb.id === id
          ? {
              ...sb,
              [field]:
                field === "amount" && typeof value === "string"
                  ? parseFloat(value)
                  : value,
            }
          : sb
      )
    );
  };

  const removeSubBudget = (id: string) => {
    setSubBudgets(subBudgets.filter((sb) => sb.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={[colors.secondary[500], colors.primary[500]]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>
          Your Budgets
        </Text>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleAddBudget}
        >
          <Feather name="plus" size={24} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Summary */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 15, backgroundColor: colors.backgroundLight }}
      >
        {/* Budget summaries */}
      </ScrollView>

      {/* Budget List */}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BudgetItem
            budget={item}
            onEdit={handleEditBudget}
            onDelete={handleDeleteBudget}
            progressAnimation={progressAnimations.current[item.id]?.interpolate(
              {
                inputRange: [0, 1],
                outputRange: [
                  "0%",
                  `${Math.min(100, (item.spent / item.amount) * 100)}%`,
                ],
              }
            )}
          />
        )}
        ListEmptyComponent={
          <EmptyState onCreateFirstBudget={handleAddBudget} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* Modal */}
      <BudgetModal
        visible={isModalVisible}
        isEditMode={isEditMode}
        budgetName={budgetName}
        budgetAmount={budgetAmount}
        budgetCategory={budgetCategory}
        budgetPeriod={budgetPeriod}
        startDate={startDate}
        endDate={endDate}
        showNotificationThreshold={showNotificationThreshold}
        notificationThreshold={notificationThreshold}
        showSubBudgets={showSubBudgets}
        subBudgets={subBudgets}
        modalAnimation={modalAnimation}
        showStartDatePicker={showStartDatePicker}
        showEndDatePicker={showEndDatePicker}
        onClose={closeModal}
        onSave={handleSaveBudget}
        onChangeName={setBudgetName}
        onChangeAmount={setBudgetAmount}
        onChangeCategory={setBudgetCategory}
        onChangePeriod={setBudgetPeriod}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onToggleNotification={setShowNotificationThreshold}
        onChangeThreshold={setNotificationThreshold}
        onToggleSubBudgets={setShowSubBudgets}
        onAddSubBudget={addSubBudget}
        onUpdateSubBudget={updateSubBudget}
        onRemoveSubBudget={removeSubBudget}
      />

      {/* BottomBar */}
      <BottomBar />
    </View>
  );
};

export default BudgetsScreen;
