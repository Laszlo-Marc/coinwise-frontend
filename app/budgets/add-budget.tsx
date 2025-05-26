// screens/BudgetFormScreen.tsx

import { colors } from "@/constants/colors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface SubBudget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: "weekly" | "monthly" | "yearly" | "custom";
  createdAt: string;
  startDate: string;
  endDate: string;
  threshold?: number;
  subBudgets?: SubBudget[];
  description?: string;
  currency: string;
  icon: string;
  color: string;
  autoReset: boolean;
  notifications: boolean;
  recurringType?: "fixed" | "rollover";
  tags: string[];
  priority: "low" | "medium" | "high";
}

const categories = [
  { name: "Food & Dining", icon: "restaurant", color: "#FF6B6B" },
  { name: "Transportation", icon: "car", color: "#4ECDC4" },
  { name: "Shopping", icon: "shopping-bag", color: "#45B7D1" },
  { name: "Entertainment", icon: "movie", color: "#96CEB4" },
  { name: "Bills & Utilities", icon: "receipt", color: "#FECA57" },
  { name: "Healthcare", icon: "medical-bag", color: "#FF9FF3" },
  { name: "Education", icon: "school", color: "#54A0FF" },
  { name: "Travel", icon: "airplane", color: "#5F27CD" },
  { name: "Savings", icon: "piggy-bank", color: "#00D2D3" },
  { name: "Investment", icon: "trending-up", color: "#FF9F43" },
  { name: "Insurance", icon: "shield", color: "#26de81" },
  { name: "Other", icon: "more-horizontal", color: "#74b9ff" },
];

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"];
const periods = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom Period" },
];

const BudgetFormScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { budget, isEdit = false } = route.params || {};

  // Form states
  const [budgetName, setBudgetName] = useState(budget?.name || "");
  const [budgetAmount, setBudgetAmount] = useState(
    budget?.amount?.toString() || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find((c) => c.name === budget?.category) || categories[0]
  );
  const [budgetPeriod, setBudgetPeriod] = useState(budget?.period || "monthly");
  const [startDate, setStartDate] = useState(
    new Date(budget?.startDate || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(budget?.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [description, setDescription] = useState(budget?.description || "");
  const [currency, setCurrency] = useState(budget?.currency || "USD");
  const [selectedIcon, setSelectedIcon] = useState(budget?.icon || "wallet");
  const [selectedColor, setSelectedColor] = useState(
    budget?.color || "#4ECDC4"
  );
  const [autoReset, setAutoReset] = useState(budget?.autoReset || false);
  const [notifications, setNotifications] = useState(
    budget?.notifications || true
  );
  const [threshold, setThreshold] = useState(budget?.threshold || 80);
  const [recurringType, setRecurringType] = useState(
    budget?.recurringType || "fixed"
  );
  const [tags, setTags] = useState(budget?.tags || []);
  const [priority, setPriority] = useState(budget?.priority || "medium");
  const [subBudgets, setSubBudgets] = useState(budget?.subBudgets || []);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showSubBudgets, setShowSubBudgets] = useState(
    budget?.subBudgets?.length > 0
  );
  const [newTag, setNewTag] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = () => {
    if (!budgetName.trim() || !budgetAmount.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const newBudget: Budget = {
      id: budget?.id || `budget_${Date.now()}`,
      name: budgetName.trim(),
      category: selectedCategory.name,
      amount,
      spent: budget?.spent || 0,
      period: budgetPeriod,
      createdAt: budget?.createdAt || new Date().toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description,
      currency,
      icon: selectedIcon,
      color: selectedColor,
      autoReset,
      notifications,
      threshold,
      recurringType,
      tags,
      priority,
      subBudgets: showSubBudgets ? subBudgets : undefined,
    };

    // Here you would typically save to your state management or database
    console.log("Saving budget:", newBudget);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const addSubBudget = () => {
    const newSub: SubBudget = {
      id: `sub_${Date.now()}`,
      name: "New Sub-Budget",
      amount: 0,
      spent: 0,
      category: "Other",
    };
    setSubBudgets([...subBudgets, newSub]);
  };

  const updateSubBudget = (id: string, field: keyof SubBudget, value: any) => {
    setSubBudgets(
      subBudgets.map((sb) => (sb.id === id ? { ...sb, [field]: value } : sb))
    );
  };

  const removeSubBudget = (id: string) => {
    setSubBudgets(subBudgets.filter((sb) => sb.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const GlassCard = ({ children, style = {} }) => (
    <BlurView
      intensity={20}
      tint="light"
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[selectedCategory.color + "40", colors.background]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[selectedCategory.color, colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}
          >
            {isEdit ? "Edit Budget" : "New Budget"}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <Animated.ScrollView
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <GlassCard>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Basic Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Budget Name *
              </Text>
              <TextInput
                value={budgetName}
                onChangeText={setBudgetName}
                placeholder="Enter budget name"
                placeholderTextColor={colors.textSecondary}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Amount *
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => setShowCurrencyModal(true)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: colors.text,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: selectedCategory.color + "40",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialIcons
                      name={selectedCategory.icon}
                      size={18}
                      color={selectedCategory.color}
                    />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {selectedCategory.name}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description (optional)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
            </View>
          </GlassCard>

          {/* Period Settings */}
          <GlassCard>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Period Settings
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Budget Period
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    onPress={() => setBudgetPeriod(period.value)}
                    style={{
                      backgroundColor:
                        budgetPeriod === period.value
                          ? selectedCategory.color + "40"
                          : "rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: 12,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor:
                        budgetPeriod === period.value
                          ? selectedCategory.color
                          : "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          budgetPeriod === period.value
                            ? selectedCategory.color
                            : colors.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {budgetPeriod === "custom" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Start Date
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text style={{ color: colors.text }}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  style={{ flex: 1, marginLeft: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    End Date
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text style={{ color: colors.text }}>
                      {endDate.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>

          {/* Advanced Settings */}
          <GlassCard>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Advanced Settings
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>
                Notifications
              </Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: "rgba(255,255,255,0.2)",
                  true: selectedCategory.color + "40",
                }}
                thumbColor={
                  notifications ? selectedCategory.color : colors.textSecondary
                }
              />
            </View>

            {notifications && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Alert Threshold ({threshold}%)
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{ color: colors.textSecondary, marginRight: 12 }}
                  >
                    50%
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <View
                      style={{
                        width: `${threshold}%`,
                        height: "100%",
                        backgroundColor: selectedCategory.color,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text style={{ color: colors.textSecondary, marginLeft: 12 }}>
                    90%
                  </Text>
                </View>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>
                Auto Reset
              </Text>
              <Switch
                value={autoReset}
                onValueChange={setAutoReset}
                trackColor={{
                  false: "rgba(255,255,255,0.2)",
                  true: selectedCategory.color + "40",
                }}
                thumbColor={
                  autoReset ? selectedCategory.color : colors.textSecondary
                }
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>
                Sub-Budgets
              </Text>
              <Switch
                value={showSubBudgets}
                onValueChange={setShowSubBudgets}
                trackColor={{
                  false: "rgba(255,255,255,0.2)",
                  true: selectedCategory.color + "40",
                }}
                thumbColor={
                  showSubBudgets ? selectedCategory.color : colors.textSecondary
                }
              />
            </View>
          </GlassCard>

          {/* Sub-Budgets */}
          {showSubBudgets && (
            <GlassCard>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Sub-Budgets
                </Text>
                <TouchableOpacity onPress={addSubBudget}>
                  <Feather
                    name="plus-circle"
                    size={24}
                    color={selectedCategory.color}
                  />
                </TouchableOpacity>
              </View>

              {subBudgets.map((sub, index) => (
                <View
                  key={sub.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      value={sub.name}
                      onChangeText={(text) =>
                        updateSubBudget(sub.id, "name", text)
                      }
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: "600",
                        marginRight: 12,
                      }}
                      placeholder="Sub-budget name"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={() => removeSubBudget(sub.id)}>
                      <Feather name="trash-2" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={sub.amount.toString()}
                    onChangeText={(text) =>
                      updateSubBudget(sub.id, "amount", parseFloat(text) || 0)
                    }
                    placeholder="Amount"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: 12,
                      color: colors.text,
                      fontSize: 14,
                    }}
                  />
                </View>
              ))}
            </GlassCard>
          )}

          {/* Tags */}
          <GlassCard>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Tags
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => removeTag(tag)}
                  style={{
                    backgroundColor: selectedCategory.color + "20",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: selectedCategory.color,
                      fontSize: 14,
                      marginRight: 4,
                    }}
                  >
                    {tag}
                  </Text>
                  <Feather name="x" size={12} color={selectedCategory.color} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row" }}>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag"
                placeholderTextColor={colors.textSecondary}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 12,
                  color: colors.text,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity
                onPress={addTag}
                style={{
                  backgroundColor: selectedCategory.color,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                }}
              >
                <Feather name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.ScrollView>

        {/* Category Modal */}
        <Modal visible={showCategoryModal} transparent animationType="slide">
          <BlurView
            intensity={20}
            tint="dark"
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                paddingBottom: insets.bottom + 20,
                maxHeight: "80%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Select Category
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={categories}
                numColumns={2}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCategory(item);
                      setShowCategoryModal(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      flex: 1,
                      margin: 8,
                      backgroundColor:
                        selectedCategory.name === item.name
                          ? item.color + "20"
                          : "rgba(255,255,255,0.05)",
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        selectedCategory.name === item.name
                          ? item.color
                          : "transparent",
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: item.color + "20",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={24}
                        color={item.color}
                      />
                    </View>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 12,
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              />
            </View>
          </BlurView>
        </Modal>

        {/* Currency Modal */}
        <Modal visible={showCurrencyModal} transparent animationType="slide">
          <BlurView
            intensity={20}
            tint="dark"
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                paddingBottom: insets.bottom + 20,
                maxHeight: "50%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Select Currency
                </Text>
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={currencies}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setCurrency(item);
                      setShowCurrencyModal(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      backgroundColor:
                        currency === item
                          ? selectedCategory.color + "20"
                          : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: currency === item ? "600" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {currency === item && (
                      <Feather
                        name="check"
                        size={20}
                        color={selectedCategory.color}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </BlurView>
        </Modal>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
      </LinearGradient>
    </View>
  );
};

export default BudgetFormScreen;
