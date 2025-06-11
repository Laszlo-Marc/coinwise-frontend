import BudgetDescriptionInput from "@/components/budgetsComponents/budget-form-components/BudgetDescriptionInput";
import BudgetTitleInput from "@/components/budgetsComponents/budget-form-components/BudgetTitleInput";
import AddBudgetHeader from "@/components/budgetsComponents/budget-form-components/Header";
import RecurringFrequencySelector from "@/components/budgetsComponents/budget-form-components/RecurringFrequencyField";
import BudgetCategoryDropdown from "@/components/budgetsComponents/BudgetCategoryDropdown";
import ThresholdToggle from "@/components/budgetsComponents/ThresholdToggle";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { SwitchField } from "@/components/goalsComponents/goalFormComponents/SwitchField";
import { TargetAmountInput } from "@/components/goalsComponents/goalFormComponents/TargetAmountInput";
import { colors } from "@/constants/colors";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useAddBudgetForm } from "@/hooks/budget-screen/useAddBudgetForm";
import { useRouter } from "expo-router";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AddBudgetScreen = () => {
  const insets = useSafeAreaInsets();
  const { addBudget } = useBudgets();
  const router = useRouter();
  const {
    formData,
    handleInputChange,
    validateForm,
    handleSave,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
  } = useAddBudgetForm(addBudget);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <AddBudgetHeader
            onCancel={() => router.replace("/budgets")}
            onSave={handleSave}
            disabled={!validateForm()}
          />

          <ScrollView style={styles.form}>
            <BudgetTitleInput
              value={formData.title}
              onChange={(value) => handleInputChange("title", value)}
            />
            <BudgetDescriptionInput
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
            />

            <View style={styles.formGroup}>
              <BudgetCategoryDropdown
                selectedCategory={formData.category}
                onSelectCategory={(category) =>
                  handleInputChange("category", category)
                }
              />
            </View>

            <TargetAmountInput
              value={formData.amount}
              onChange={(value) => handleInputChange("amount", value)}
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
            />

            <SwitchField
              value={formData.notificationsEnabled}
              onChange={(value) =>
                handleInputChange("notificationsEnabled", value)
              }
              label="Enable Notifications"
              helperText="Get notified when you reach a certain threshold of your budget"
            />

            {formData.notificationsEnabled && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notification Threshold</Text>
                <ThresholdToggle
                  enabled={formData.notificationsEnabled}
                  threshold={formData.notificationThreshold}
                  onToggle={() =>
                    handleInputChange(
                      "notificationsEnabled",
                      !formData.notificationsEnabled
                    )
                  }
                  onChangeThreshold={(value) =>
                    handleInputChange("notificationThreshold", value)
                  }
                />
              </View>
            )}

            <SwitchField
              value={formData.isRecurring}
              onChange={(value) => handleInputChange("isRecurring", value)}
              label="Recurring Budget"
              helperText="Enable for recurring budgets (e.g. weekly groceries budget)"
            />

            {formData.isRecurring && (
              <RecurringFrequencySelector
                frequency={formData.recurring_frequency}
                onChange={(value) =>
                  handleInputChange("recurring_frequency", value)
                }
              />
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
});
