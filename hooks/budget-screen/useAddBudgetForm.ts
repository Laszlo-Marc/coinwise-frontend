import { BudgetModel } from "@/models/budget";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export const useAddBudgetForm = (onSubmit: (data: BudgetModel) => void) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0],
    isRecurring: false,
    category: "Groceries",
    recurring_frequency: "monthly",
    notificationsEnabled: false,
    notificationThreshold: 80,
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return false;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return false;

    if (formData.end_date <= formData.start_date) return false;

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
      amount,
      spent: 0,
      remaining: amount,
      start_date: formData.start_date,
      is_recurring: formData.isRecurring,
      recurring_frequency: formData.recurring_frequency,
      category: formData.category,
      end_date: formData.end_date,
      notificationsEnabled: formData.notificationsEnabled,
      notificationsThreshold: formData.notificationThreshold,
      transactions: [],
    };

    onSubmit(budgetData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return {
    formData,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    handleInputChange,
    handleSave,
    validateForm,
  };
};
