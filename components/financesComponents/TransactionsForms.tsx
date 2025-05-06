import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

// Base Transaction Form Component
interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { [key: string]: any }) => void;
  transactionType: "expense" | "transfer" | "income" | "deposit";
  categories?: string[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  visible,
  onClose,
  onSubmit,
  transactionType,
  categories = [],
}) => {
  const getInitialFormData = () => {
    // Default fields for all transaction types
    const baseData = {
      date: new Date(),
      amount: "",
      description: "",
    };

    // Add type-specific fields
    switch (transactionType) {
      case "expense":
        return {
          ...baseData,
          currency: "RON",
          merchant: "",
          category: categories.length > 0 ? categories[0] : "",
        };
      case "transfer":
        return {
          ...baseData,
          sender: "",
          receiver: "",
        };
      case "income":
      case "deposit":
      default:
        return baseData;
    }
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Format date to string before submitting
    const formattedData = {
      ...formData,
      date: formData.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      amount: parseFloat(formData.amount), // Convert amount to number
    };

    onSubmit(formattedData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      handleChange("date", selectedDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get title based on transaction type
  const getTitle = () => {
    switch (transactionType) {
      case "expense":
        return "Add Expense";
      case "transfer":
        return "Add Transfer";
      case "income":
        return "Add Income";
      case "deposit":
        return "Add Deposit";
      default:
        return "Add Transaction";
    }
  };

  // Render specific fields based on transaction type
  const renderSpecificFields = () => {
    switch (transactionType) {
      case "expense":
        return (
          <>
            {/* Merchant Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Merchant</Text>
              <TextInput
                style={styles.input}
                value={
                  transactionType === "expense" && "merchant" in formData
                    ? formData.merchant
                    : ""
                }
                onChangeText={(value) => handleChange("merchant", value)}
                placeholder="Enter merchant name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Currency Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    "currency" in formData ? formData.currency : ""
                  }
                  onValueChange={(value) => handleChange("currency", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="RON" value="RON" />
                  <Picker.Item label="EUR" value="EUR" />
                  <Picker.Item label="USD" value="USD" />
                </Picker>
              </View>
            </View>

            {/* Category Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    "category" in formData ? formData.category : ""
                  }
                  onValueChange={(value) => handleChange("category", value)}
                  style={styles.picker}
                >
                  {categories.map((category) => (
                    <Picker.Item
                      key={category}
                      label={category}
                      value={category}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </>
        );
      case "transfer":
        return (
          <>
            {/* Sender Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sender</Text>
              <TextInput
                style={styles.input}
                value={"sender" in formData ? formData.sender : ""}
                onChangeText={(value) => handleChange("sender", value)}
                placeholder="Enter sender name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Receiver Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Receiver</Text>
              <TextInput
                style={styles.input}
                value={
                  transactionType === "transfer" && "receiver" in formData
                    ? formData.receiver
                    : ""
                }
                onChangeText={(value) => handleChange("receiver", value)}
                placeholder="Enter receiver name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </>
        );
      case "income":
      case "deposit":
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Date Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.date)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary[500]}
                />
              </TouchableOpacity>
            </View>

            {/* Amount Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(value) => handleChange("amount", value)}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Type-specific fields */}
            {renderSpecificFields()}

            {/* Description Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange("description", value)}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Save Transaction</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Date Picker for iOS */}
          {Platform.OS === "ios" && showDatePicker && (
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.doneDateButton}
                >
                  <Text style={styles.doneDateButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={formData.date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          )}

          {/* Date Picker for Android */}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Wrapper components for each transaction type
interface ExpenseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { [key: string]: any }) => void;
  categories?: string[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  visible,
  onClose,
  onSubmit,
  categories,
}) => {
  return (
    <TransactionForm
      visible={visible}
      onClose={onClose}
      onSubmit={onSubmit}
      transactionType="expense"
      categories={
        categories || [
          "Groceries",
          "Dining",
          "Transportation",
          "Utilities",
          "Entertainment",
          "Shopping",
          "Health",
          "Education",
          "Travel",
          "Other",
        ]
      }
    />
  );
};

interface TransferFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { [key: string]: any }) => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  return (
    <TransactionForm
      visible={visible}
      onClose={onClose}
      onSubmit={onSubmit}
      transactionType="transfer"
    />
  );
};

interface IncomeFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { [key: string]: any }) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  return (
    <TransactionForm
      visible={visible}
      onClose={onClose}
      onSubmit={onSubmit}
      transactionType="income"
    />
  );
};

interface DepositFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { [key: string]: any }) => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  return (
    <TransactionForm
      visible={visible}
      onClose={onClose}
      onSubmit={onSubmit}
      transactionType="deposit"
    />
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[300],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.text,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary[300],
    color: colors.text,
    fontFamily: "Montserrat",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    overflow: "hidden",
  },
  picker: {
    height: 45,
    color: colors.text,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  dateButtonText: {
    color: colors.text,
    fontFamily: "Montserrat",
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  submitButtonText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  datePickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[300],
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  doneDateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneDateButtonText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  datePicker: {
    height: 200,
  },
});
