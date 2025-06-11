import { CategorySelector } from "@/components/goalsComponents/goalFormComponents/CategorySelector";
import ContributionFields from "@/components/goalsComponents/goalFormComponents/ContributionFields";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { GoalDescriptionInput } from "@/components/goalsComponents/goalFormComponents/GoalDescritionInput";
import GoalTitleInput from "@/components/goalsComponents/goalFormComponents/GoalTitleInput";
import { SwitchField } from "@/components/goalsComponents/goalFormComponents/SwitchField";
import { TargetAmountInput } from "@/components/goalsComponents/goalFormComponents/TargetAmountInput";
import { useGoals } from "@/contexts/GoalsContext";
import { Feather } from "@expo/vector-icons";
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
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

type ContributionFrequency = "daily" | "weekly" | "monthly";
const AddGoalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 6))
      .toISOString()
      .split("T")[0],
    category: "Savings",
    auto_contribution_enabled: false,
    auto_contribution_amount: "",
    contribution_frequency: "monthly" as ContributionFrequency,
    is_active: true,
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

    const amount = Number(data.target_amount);
    if (isNaN(amount) || amount <= 0) {
      errors.targetAmount = "Enter a valid target amount.";
    }

    if (data.end_date <= data.start_date) {
      errors.targetDate = "Target date must be after start date.";
    }

    if (data.auto_contribution_enabled) {
      const contribAmount = Number(data.auto_contribution_amount);
      if (isNaN(contribAmount) || contribAmount <= 0) {
        errors.contributionAmount = "Enter a valid contribution amount.";
      }
    }

    return errors;
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | Date | number
  ) => {
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
      isNaN(Number(formData.target_amount)) ||
      Number(formData.target_amount) <= 0
    )
      return false;
    if (formData.end_date <= formData.start_date) return false;
    if (formData.auto_contribution_enabled) {
      const amount = Number(formData.auto_contribution_amount);
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
      target_amount: parseFloat(formData.target_amount || "0"),
      current_amount: 0,
      start_date: formData.start_date.toString().split("T")[0],
      category: formData.category,
      end_date: formData.end_date.toString().split("T")[0],
      is_active: true,
      auto_contribution_enabled: formData.auto_contribution_enabled,
      auto_contribution_amount: formData.auto_contribution_enabled
        ? parseFloat(formData.auto_contribution_amount || "0")
        : undefined,
      contribution_frequency: formData.auto_contribution_enabled
        ? formData.contribution_frequency
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
            colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
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

            <Text style={styles.headerTitle}>Create a goal</Text>

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
            <GoalTitleInput
              value={formData.title}
              onChange={(val) => handleInputChange("title", val)}
              error={errors.title}
            />

            <GoalDescriptionInput
              value={formData.description}
              onChange={(val) => handleInputChange("description", val)}
              error={errors.description}
            />

            <TargetAmountInput
              value={formData.target_amount}
              onChange={(val) => handleInputChange("target_amount", val)}
              error={errors.targetAmount}
            />

            <DatePickerField
              label="Start Date"
              date={formData.start_date}
              onChange={(date) =>
                handleInputChange("start_date", date.toString().split("T")[0])
              }
              showPicker={showStartDatePicker}
              setShowPicker={setShowStartDatePicker}
            />

            <DatePickerField
              label="Target Date *"
              date={formData.end_date}
              onChange={(date) =>
                handleInputChange("end_date", date.toString().split("T")[0])
              }
              showPicker={showTargetDatePicker}
              setShowPicker={setShowTargetDatePicker}
              minDate={
                new Date(new Date(formData.start_date).getTime() + 86400000)
              }
              error={errors.end_date}
            />

            <CategorySelector
              selected={formData.category}
              onChange={(category) => handleInputChange("category", category)}
              isExpanded={showCategoryPicker}
              toggleExpand={() => {
                setShowCategoryPicker((prev) => !prev);
                Haptics.selectionAsync();
              }}
            />

            <SwitchField
              label="Auto Contributions"
              value={formData.auto_contribution_enabled || false}
              onChange={(val) =>
                handleInputChange("auto_contribution_enabled", val)
              }
              helperText="Enable to contribute automatically on a schedule"
            />

            {formData.auto_contribution_enabled && (
              <ContributionFields
                contributionAmount={formData.auto_contribution_amount}
                contributionFrequency={formData.contribution_frequency}
                onAmountChange={(val) =>
                  handleInputChange("auto_contribution_amount", val)
                }
                onFrequencyChange={(val) =>
                  handleInputChange("contribution_frequency", val)
                }
                error={errors.contributionAmount}
              />
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
    fontFamily: "Montserrat",
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
    fontFamily: "Montserrat",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
