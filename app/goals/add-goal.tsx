import { categories } from "@/constants/categories";
import { useGoals } from "@/contexts/GoalsContext";
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

const AddGoalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    startDate: new Date(),
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    isRecurring: false,
    category: "Savings",
    autoContributions: false,
    contributionAmount: "",
    contributionFrequency: "monthly",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addGoal } = useGoals();
  const validateGoalForm = (data: typeof formData) => {
    const errors: Record<string, string> = {};

    if (!data.title.trim()) {
      errors.title = "Title is required.";
    }
    if (!data.description.trim()) {
      errors.description = "Description is required.";
    }

    const amount = parseFloat(data.targetAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.targetAmount = "Enter a valid target amount.";
    }

    if (data.targetDate <= data.startDate) {
      errors.targetDate = "Target date must be after start date.";
    }

    if (data.autoContributions) {
      const contribAmount = parseFloat(data.contributionAmount);
      if (isNaN(contribAmount) || contribAmount <= 0) {
        errors.contributionAmount = "Enter a valid contribution amount.";
      }
    }

    return errors;
  };

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
    if (formData.autoContributions) {
      const amount = parseFloat(formData.contributionAmount);
      if (isNaN(amount) || amount <= 0) return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const validationErrors = validateGoalForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});
    const goalData = {
      title: formData.title,
      description: formData.description,
      target_amount: parseFloat(formData.targetAmount),
      current_amount: 0,
      start_date: formData.startDate.toISOString().split("T")[0],
      is_recuring: formData.isRecurring,
      category: formData.category,
      end_date: formData.targetDate.toISOString().split("T")[0],
      is_active: true,
      auto_contributions: formData.autoContributions,
      contribution_amount: formData.autoContributions
        ? parseFloat(formData.contributionAmount || "0")
        : null,
      contribution_frequency: formData.autoContributions
        ? formData.contributionFrequency
        : undefined,
    };

    addGoal(goalData);
    console.log("Saving new goal:", goalData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/financial-goals");
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
              onPress={() => router.replace("/financial-goals")}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add goal</Text>

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
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
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
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
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
                      onChangeText={(value) =>
                        handleInputChange(
                          "contributionAmount",
                          value.replace(/[^0-9.]/g, "")
                        )
                      }
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
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
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddGoalScreen;

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
  errorText: {
    color: colors.error,
    marginTop: 4,
    fontSize: 13,
    fontFamily: "Montserrat",
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
