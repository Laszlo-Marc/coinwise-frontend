import { useGoals } from "@/contexts/GoalsContext";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { colors } from "../../../constants/colors";

const EditGoalScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const goalId = params.id as string; // Extract the actual ID from params
  const insets = useSafeAreaInsets();
  const { goals, updateGoal } = useGoals();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    startDate: new Date(),
    targetDate: new Date(),
    isRecurring: false,
    category: "Savings",
    autoContributions: false,
    contributionAmount: "",
    contributionFrequency: "monthly",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (goalId && goals.length > 0) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        setFormData({
          title: goal.title || "",
          description: goal.description || "",
          targetAmount: goal.target_amount ? goal.target_amount.toString() : "",
          startDate: goal.start_date ? new Date(goal.start_date) : new Date(),
          targetDate: goal.end_date ? new Date(goal.end_date) : new Date(),
          isRecurring: goal.is_recuring || false,
          category: goal.category || "Savings",
          autoContributions: goal.auto_contribution_enabled || false,
          contributionAmount: goal.auto_contribution_amount
            ? goal.auto_contribution_amount.toString()
            : "",
          contributionFrequency: goal.contribution_frequency || "monthly",
        });
        setIsLoading(false);
      } else {
        // Goal not found
        Alert.alert("Error", "Goal not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [goalId, goals]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: selectedDate,
        // Ensure target date is after start date
        targetDate:
          selectedDate >= prev.targetDate
            ? new Date(selectedDate.getTime() + 86400000)
            : prev.targetDate,
      }));
    }
  };

  const handleTargetDateChange = (event: any, selectedDate?: Date) => {
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
    if (formData.autoContributions) {
      const amount = parseFloat(formData.contributionAmount);
      if (isNaN(amount) || amount <= 0) return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Validation Error",
        "Please check all required fields and ensure the target date is after the start date."
      );
      return;
    }

    try {
      const updatedGoal = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target_amount: parseFloat(formData.targetAmount),
        start_date: formData.startDate.toISOString().split("T")[0],
        end_date: formData.targetDate.toISOString().split("T")[0],
        is_recuring: formData.isRecurring,
        category: formData.category,
        auto_contribution_enabled: formData.autoContributions,
        auto_contribution_amount: formData.autoContributions
          ? parseFloat(formData.contributionAmount || "0")
          : undefined,

        contribution_frequency: formData.autoContributions
          ? formData.contributionFrequency
          : undefined,
      };

      await updateGoal(goalId, updatedGoal);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error updating goal:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update goal. Please try again.");
    }
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Goal Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                placeholder="What are you saving for?"
                placeholderTextColor={colors.textMuted}
                maxLength={50}
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
                maxLength={200}
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
                  onChangeText={(value) => {
                    // Allow numbers and one decimal point
                    const cleanedValue = value.replace(/[^0-9.]/g, "");
                    const parts = cleanedValue.split(".");
                    if (parts.length > 2) {
                      return; // Don't allow multiple decimal points
                    }
                    if (parts[1] && parts[1].length > 2) {
                      return; // Don't allow more than 2 decimal places
                    }
                    handleInputChange("targetAmount", cleanedValue);
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
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

            {/* Auto Contributions Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Auto Contributions</Text>
                <Switch
                  value={formData.autoContributions}
                  onValueChange={(value) =>
                    handleInputChange("autoContributions", value)
                  }
                  trackColor={{
                    false: colors.backgroundDark,
                    true: colors.primary[600],
                  }}
                  thumbColor={
                    formData.autoContributions
                      ? colors.primary[400]
                      : colors.textSecondary
                  }
                />
              </View>
              <Text style={styles.helperText}>
                Enable to contribute automatically on a schedule
              </Text>
            </View>

            {/* Contribution Amount Input */}
            {formData.autoContributions && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contribution Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={formData.contributionAmount}
                      onChangeText={(value) => {
                        // Allow numbers and one decimal point
                        const cleanedValue = value.replace(/[^0-9.]/g, "");
                        const parts = cleanedValue.split(".");
                        if (parts.length > 2) {
                          return; // Don't allow multiple decimal points
                        }
                        if (parts[1] && parts[1].length > 2) {
                          return; // Don't allow more than 2 decimal places
                        }
                        handleInputChange("contributionAmount", cleanedValue);
                      }}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Contribution Frequency Selector */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contribution Frequency</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() =>
                      handleInputChange(
                        "contributionFrequency",
                        formData.contributionFrequency === "monthly"
                          ? "weekly"
                          : formData.contributionFrequency === "weekly"
                          ? "daily"
                          : "monthly"
                      )
                    }
                  >
                    <Text style={styles.selectText}>
                      {formData.contributionFrequency.charAt(0).toUpperCase() +
                        formData.contributionFrequency.slice(1)}
                    </Text>
                    <Feather
                      name="repeat"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    Tap to cycle through: Monthly → Weekly → Daily
                  </Text>
                </View>
              </>
            )}

            {/* Add some bottom padding for scroll */}
            <View style={{ height: 50 }} />
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
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
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
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
    borderWidth: 1,
    borderColor: "transparent",
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
    fontWeight: "500",
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
    borderWidth: 1,
    borderColor: "transparent",
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
    lineHeight: 20,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
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
    borderWidth: 1,
    borderColor: colors.backgroundDark,
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
