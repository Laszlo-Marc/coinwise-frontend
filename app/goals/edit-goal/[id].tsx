import { CategorySelector } from "@/components/goalsComponents/goalFormComponents/CategorySelector";
import ContributionFields from "@/components/goalsComponents/goalFormComponents/ContributionFields";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { GoalDescriptionInput } from "@/components/goalsComponents/goalFormComponents/GoalDescritionInput";
import GoalTitleInput from "@/components/goalsComponents/goalFormComponents/GoalTitleInput";
import { SwitchField } from "@/components/goalsComponents/goalFormComponents/SwitchField";
import { TargetAmountInput } from "@/components/goalsComponents/goalFormComponents/TargetAmountInput";
import { colors } from "@/constants/colors";
import { useGoals } from "@/contexts/GoalsContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
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

type ContributionFrequency = "daily" | "weekly" | "monthly";

const EditGoalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const goalId = params.id as string;
  const { goals, updateGoal } = useGoals();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: 0,
    start_date: "",
    end_date: "",
    category: "Savings",
    auto_contribution_enabled: false,
    auto_contribution_amount: "",
    contribution_frequency: "monthly" as ContributionFrequency,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const successOpacity = useRef(new Animated.Value(0)).current;

  const formatDateForInput = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }, []);

  useEffect(() => {
    if (goalId && goals.length > 0) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        setFormData({
          title: goal.title || "",
          description: goal.description || "",
          target_amount: goal.target_amount
            ? goal.target_amount.toString()
            : "",
          current_amount: goal.current_amount || 0,
          start_date: goal.start_date
            ? formatDateForInput(goal.start_date)
            : formatDateForInput(new Date().toISOString()),
          end_date: goal.end_date
            ? formatDateForInput(goal.end_date)
            : formatDateForInput(new Date().toISOString()),
          category: goal.category || "Savings",
          auto_contribution_enabled: goal.auto_contribution_enabled || false,
          auto_contribution_amount: goal.auto_contribution_amount
            ? goal.auto_contribution_amount.toString()
            : "",
          contribution_frequency: (["daily", "weekly", "monthly"].includes(
            goal.contribution_frequency ?? ""
          )
            ? goal.contribution_frequency
            : "monthly") as ContributionFrequency,
          is_active: goal.is_active ?? true,
        });
        setIsLoading(false);
      } else {
        Alert.alert("Error", "Goal not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [goalId, goals, formatDateForInput]);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = "Title is required.";
    }

    if (!formData.description.trim()) {
      errs.description = "Description is required.";
    }

    const amount = parseFloat(formData.target_amount);
    if (isNaN(amount) || amount <= 0) {
      errs.targetAmount = "Enter a valid target amount.";
    }

    if (formData.end_date <= formData.start_date) {
      errs.end_date = "Target date must be after start date.";
    }

    if (formData.auto_contribution_enabled) {
      const contributionAmount = parseFloat(formData.auto_contribution_amount);
      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        errs.contributionAmount = "Enter a valid contribution amount.";
      }
    }

    return errs;
  }, [
    formData.title,
    formData.description,
    formData.target_amount,
    formData.start_date,
    formData.end_date,
    formData.auto_contribution_enabled,
    formData.auto_contribution_amount,
  ]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  const handleInputChange = useCallback(
    (field: string, value: string | boolean | Date | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const updatedGoal = {
      title: formData.title,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount),
      current_amount: formData.current_amount,
      start_date: formData.start_date,
      end_date: formData.end_date,
      category: formData.category,
      is_active: formData.is_active,
      auto_contribution_enabled: formData.auto_contribution_enabled,
      auto_contribution_amount: formData.auto_contribution_enabled
        ? parseFloat(formData.auto_contribution_amount)
        : undefined,
      contribution_frequency: formData.auto_contribution_enabled
        ? formData.contribution_frequency
        : undefined,
    };

    try {
      await updateGoal(goalId, updatedGoal);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        router.replace("/financial-goals");
      });
    } catch (err) {
      console.error("Update failed", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isFormValid, formData, goalId, updateGoal, successOpacity, router]);

  const toggleCategoryPicker = useCallback(() => {
    setShowCategoryPicker((prev) => !prev);
    Haptics.selectionAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
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
          <LinearGradient
            colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
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
                !isFormValid && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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
              onChange={(val) =>
                handleInputChange("target_amount", val.toString())
              }
              error={errors.targetAmount}
            />

            <DatePickerField
              label="Start Date"
              date={formData.start_date}
              onChange={(date) => handleInputChange("start_date", date)}
              showPicker={showStartDatePicker}
              setShowPicker={setShowStartDatePicker}
            />

            <DatePickerField
              label="Target Date *"
              date={formData.end_date}
              onChange={(date) => handleInputChange("end_date", date)}
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
              toggleExpand={toggleCategoryPicker}
            />

            <SwitchField
              label="Auto Contributions"
              value={formData.auto_contribution_enabled}
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
                  handleInputChange("auto_contribution_amount", val.toString())
                }
                onFrequencyChange={(val) =>
                  handleInputChange("contribution_frequency", val)
                }
                error={errors.contributionAmount}
              />
            )}
          </ScrollView>

          {showSuccess && (
            <Animated.View
              style={[styles.successOverlay, { opacity: successOpacity }]}
            >
              <View style={styles.successContent}>
                <Feather name="check-circle" size={60} color={colors.success} />
                <Text style={styles.successText}>Goal Updated!</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditGoalScreen;

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
  successOverlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  successContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    color: colors.success,
  },
});
