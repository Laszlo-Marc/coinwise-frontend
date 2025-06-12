// Custom hook for AddTransactionScreen

import { useTransactionContext } from "@/contexts/AppContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

export const useAddTransactionForm = () => {
  const router = useRouter();
  const { addTransaction } = useTransactionContext();
  const successOpacity = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "General",
    merchant: "",
    currency: "RON",
    sender: "",
    receiver: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.description.trim())
      errs.description = "Description is required.";

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) errs.amount = "Enter a valid amount.";

    if (!formData.date) errs.date = "Date is required.";

    if (formData.type === "expense") {
      if (!formData.category) errs.category = "Category is required.";
      if (!formData.merchant.trim()) errs.merchant = "Merchant is required.";
    }

    if (formData.type === "transfer") {
      if (!formData.sender.trim()) errs.sender = "Sender is required.";
      if (!formData.receiver.trim()) errs.receiver = "Receiver is required.";
    }

    return errs;
  }, [formData]);

  const isFormValid = useMemo(
    () => Object.keys(validationErrors).length === 0,
    [validationErrors]
  );

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});

    const txData = {
      ...formData,
      type: formData.type as "expense" | "transfer" | "income" | "deposit",
      amount: parseFloat(formData.amount),
    };

    try {
      await addTransaction(txData);
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
        router.replace("/transactions");
      });
    } catch (err) {
      console.error("Error saving transaction:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [
    formData,
    isFormValid,
    validationErrors,
    addTransaction,
    router,
    successOpacity,
  ]);

  return {
    formData,
    errors,
    handleInputChange,
    handleSave,
    showSuccess,
    successOpacity,
    showDatePicker,
    setShowDatePicker,
    showCategoryPicker,
    setShowCategoryPicker,
    isFormValid,
  };
};
