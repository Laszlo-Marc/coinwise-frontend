import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

const EditGoalScreen = () => {
  const router = useRouter();
  const goalId = useLocalSearchParams() as unknown as string;
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    startDate: new Date(),
    targetDate: new Date(),
    isRecurring: false,
    category: "Savings",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categories = [
    "Savings",
    "Travel",
    "Tech",
    "Education",
    "Home",
    "Automotive",
    "Other",
  ];

  useEffect(() => {
    // Fetch goal data based on goalId
    const mockGoals = [
      {
        id: "g1",
        title: "Emergency Fund",
        description: "Build a 6-month emergency fund",
        targetAmount: 10000,
        currentAmount: 4500,
        startDate: "2025-01-01",
        targetDate: "2025-12-31",
        isRecurring: false,
        category: "Savings",
        status: "active",
        progressHistory: [],
      },
    ];

    const goal = mockGoals.find((g) => g.id === goalId);
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount.toString(),
        startDate: new Date(goal.startDate),
        targetDate: new Date(goal.targetDate),
        isRecurring: goal.isRecurring,
        category: goal.category,
      });
    }
  }, [goalId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartDateChange = (event: any, selectedDate: any) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, startDate: selectedDate }));
    }
  };

  const handleTargetDateChange = (event: any, selectedDate: any) => {
    setShowTargetDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, targetDate: selectedDate }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return false;
    if (
      isNaN(parseFloat(formData.targetAmount)) ||
      parseFloat(formData.targetAmount) <= 0
    )
      return false;
    if (formData.targetDate <= formData.startDate) return false;
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const updatedGoal = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      startDate: formData.startDate.toISOString().split("T")[0],
      targetDate: formData.targetDate.toISOString().split("T")[0],
    };

    console.log("Saving edited goal:", updatedGoal);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header with gradient */}
          <LinearGradient
            colors={[colors.secondary[500], colors.primary[500]]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 10 }]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Goal</Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !validateForm() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!validateForm()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.form}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Goal Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                placeholder="What are you saving for?"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                placeholder="Add some details about your goal"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Target Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={formData.targetAmount}
                  onChangeText={(value) =>
                    handleInputChange(
                      "targetAmount",
                      value.replace(/[^0-9.]/g, "")
                    )
                  }
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString()}
                </Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Target Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTargetDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.targetDate.toLocaleDateString()}
                </Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showTargetDatePicker && (
                <DateTimePicker
                  value={formData.targetDate}
                  mode="date"
                  display="default"
                  onChange={handleTargetDateChange}
                  minimumDate={
                    new Date(formData.startDate.getTime() + 86400000)
                  } // Day after start date
                />
              )}
            </View>

            {/* Is Recurring */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Recurring Goal</Text>
                <Switch
                  value={formData.isRecurring}
                  onValueChange={(value) =>
                    handleInputChange("isRecurring", value)
                  }
                  trackColor={{
                    false: colors.backgroundDark,
                    true: colors.primary[600],
                  }}
                  thumbColor={
                    formData.isRecurring
                      ? colors.primary[400]
                      : colors.textSecondary
                  }
                />
              </View>
              <Text style={styles.helperText}>
                Enable for goals with regular contributions (e.g., save $100
                monthly)
              </Text>
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.selectText}>{formData.category}</Text>
                <Feather
                  name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category &&
                          styles.categoryOptionSelected,
                      ]}
                      onPress={() => {
                        handleInputChange("category", category);
                        setShowCategoryPicker(false);
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === category &&
                            styles.categoryOptionTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
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
  saveButton: {
    backgroundColor: colors.primary[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
  },
  categoryPicker: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 8,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryOptionSelected: {
    backgroundColor: colors.secondary[800],
  },
  categoryOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  categoryOptionTextSelected: {
    color: colors.primary[300],
    fontWeight: "600",
  },
});
export default EditGoalScreen;
