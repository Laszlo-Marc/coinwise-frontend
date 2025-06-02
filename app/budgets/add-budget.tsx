import BudgetCategoryDropdown from "@/components/budgetsComponents/BudgetCategoryDropdown";
import ThresholdToggle from "@/components/budgetsComponents/ThresholdToggle";
import { useBudgets } from "@/contexts/BudgetsContext";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const AddBudgetScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isRecurring: false,
    category: "Groceries",
    recurring_frequency: "monthly",
    notificationsEnabled: false,
    notificationThreshold: 80,
  });
  const { addBudget } = useBudgets();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartDateChange = (event: any, selectedDate: any) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        start_date: selectedDate,
        // Ensure end date is at least one day after start date
        end_date:
          prev.end_date <= selectedDate
            ? new Date(selectedDate.getTime() + 86400000)
            : prev.end_date,
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate: any) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, end_date: selectedDate }));
    }
  };

  const validateForm = () => {
    // Check title is not empty
    if (!formData.title.trim()) return false;

    // Check amount is valid number and greater than 0
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return false;

    // Check end date is after start date
    if (formData.end_date <= formData.start_date) return false;

    // Check notification threshold if notifications are enabled
    if (formData.notificationsEnabled) {
      const threshold = formData.notificationThreshold;
      if (isNaN(threshold) || threshold <= 0 || threshold > 100) return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const amount = parseFloat(formData.amount);
    const budgetData = {
      title: formData.title,
      description: formData.description || "",
      amount: amount,
      spent: 0,
      remaining: amount,
      start_date: formData.start_date.toISOString().split("T")[0],
      is_recurring: formData.isRecurring,
      recurring_frequency: formData.recurring_frequency,
      category: formData.category,
      end_date: formData.end_date.toISOString().split("T")[0],
      notificationsEnabled: formData.notificationsEnabled,
      notificationThreshold: formData.notificationThreshold,
    };

    addBudget(budgetData);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/budgets");
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
              onPress={() => router.replace("/budgets")}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Create a new budget</Text>

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
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                placeholder="What is this budget for?"
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
                placeholder="Optional description..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <BudgetCategoryDropdown
                selectedCategory={formData.category}
                onSelectCategory={(category) => {
                  handleInputChange("category", category);

                  Haptics.selectionAsync();
                }}
              />
            </View>
            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>RON</Text>
                <TextInput
                  style={styles.amountInput}
                  value={formData.amount}
                  onChangeText={(value) => {
                    const sanitized = value.replace(/[^0-9.]/g, "");

                    const parts = sanitized.split(".");
                    const cleanValue =
                      parts.length > 2
                        ? parts[0] + "." + parts.slice(1).join("")
                        : sanitized;
                    handleInputChange("amount", cleanValue);
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
                  {formData.start_date.toLocaleDateString()}
                </Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.start_date}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* End Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.end_date.toLocaleDateString()}
                </Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={formData.end_date}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={
                    new Date(formData.start_date.getTime() + 86400000)
                  } // Day after start date
                />
              )}
            </View>

            {/* Notifications Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Notifications</Text>
                <Switch
                  value={formData.notificationsEnabled}
                  onValueChange={(value) =>
                    handleInputChange("notificationsEnabled", value)
                  }
                  trackColor={{
                    false: colors.backgroundDark,
                    true: colors.primary[600],
                  }}
                  thumbColor={
                    formData.notificationsEnabled
                      ? colors.primary[400]
                      : colors.textSecondary
                  }
                />
              </View>
              <Text style={styles.helperText}>
                Enable notifications for when a certain threshold is reached
                (e.g. 70% of budget spent)
              </Text>
            </View>

            {/* Notifications Threshold */}
            {formData.notificationsEnabled && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notification Threshold</Text>
                <ThresholdToggle
                  enabled={formData.notificationsEnabled}
                  threshold={formData.notificationThreshold}
                  onToggle={() => {}}
                  onChangeThreshold={(value) =>
                    handleInputChange("notificationThreshold", value)
                  }
                />
              </View>
            )}

            {/* Is Recurring Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Recurring</Text>
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
                Enable for recurring budgets (e.g. weekly groceries budget)
              </Text>
            </View>

            {/* Recurring Frequency */}
            {formData.isRecurring && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Frequency</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    const frequencies = ["monthly", "weekly", "daily"];
                    const currentIndex = frequencies.indexOf(
                      formData.recurring_frequency
                    );
                    const nextIndex = (currentIndex + 1) % frequencies.length;
                    handleInputChange(
                      "recurring_frequency",
                      frequencies[nextIndex]
                    );
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.selectText}>
                    {formData.recurring_frequency.charAt(0).toUpperCase() +
                      formData.recurring_frequency.slice(1)}
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
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddBudgetScreen;

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
    paddingBottom: 24,
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
