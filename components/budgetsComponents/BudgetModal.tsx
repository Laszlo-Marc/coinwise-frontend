import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SubBudget } from "./BudgetItem";

import CategoryDropdown from "./BudgetCategoryDropdown";
import PeriodSelector from "./PeriodSelector";
import SubBudgetsForm from "./SubBudgetsForm";
import ThresholdToggle from "./ThresholdToggle";

type Props = {
  visible: boolean;
  isEditMode: boolean;
  budgetName: string;
  budgetAmount: string;
  budgetCategory: string;
  budgetPeriod: "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  showNotificationThreshold: boolean;
  notificationThreshold: number;
  showSubBudgets: boolean;
  subBudgets: SubBudget[];
  modalAnimation: Animated.Value;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeName: (text: string) => void;
  onChangeAmount: (text: string) => void;
  onChangeCategory: (category: string) => void;
  onChangePeriod: (period: "weekly" | "monthly" | "custom") => void;
  onChangeStartDate: (date: Date) => void;
  onChangeEndDate: (date: Date) => void;
  onToggleNotification: (value: boolean) => void;
  onChangeThreshold: (value: number) => void;
  onToggleSubBudgets: (value: boolean) => void;
  onAddSubBudget: () => void;
  onUpdateSubBudget: (
    id: string,
    field: keyof SubBudget,
    value: string | number
  ) => void;
  onRemoveSubBudget: (id: string) => void;
};

const BudgetModal = ({
  visible,
  isEditMode,
  budgetName,
  budgetAmount,
  budgetCategory,
  budgetPeriod,
  startDate,
  endDate,
  showNotificationThreshold,
  notificationThreshold,
  showSubBudgets,
  subBudgets,
  modalAnimation,
  showStartDatePicker,
  showEndDatePicker,
  onClose,
  onSave,
  onChangeName,
  onChangeAmount,
  onChangeCategory,
  onChangePeriod,
  onChangeStartDate,
  onChangeEndDate,
  onToggleNotification,
  onChangeThreshold,
  onToggleSubBudgets,
  onAddSubBudget,
  onUpdateSubBudget,
  onRemoveSubBudget,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Dimensions.get("window").height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Edit Budget" : "Create New Budget"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Budget Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget Name</Text>
              <TextInput
                style={styles.textInput}
                value={budgetName}
                onChangeText={onChangeName}
                placeholder="e.g., Groceries, Entertainment"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Category */}
            <CategoryDropdown
              selectedCategory={budgetCategory}
              onSelectCategory={onChangeCategory}
            />

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget Amount</Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.currencyInput}
                  value={budgetAmount}
                  onChangeText={onChangeAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Period */}
            <PeriodSelector
              period={budgetPeriod}
              startDate={startDate}
              endDate={endDate}
              showStartDatePicker={showStartDatePicker}
              showEndDatePicker={showEndDatePicker}
              onChangePeriod={onChangePeriod}
              onChangeStartDate={onChangeStartDate}
              onChangeEndDate={onChangeEndDate}
            />

            {/* Notification */}
            <ThresholdToggle
              enabled={showNotificationThreshold}
              threshold={notificationThreshold}
              onToggle={onToggleNotification}
              onChangeThreshold={onChangeThreshold}
            />

            {/* Sub-Budgets */}
            <SubBudgetsForm
              enabled={showSubBudgets}
              subBudgets={subBudgets}
              onToggle={onToggleSubBudgets}
              onAddSubBudget={onAddSubBudget}
              onUpdateSubBudget={onUpdateSubBudget}
              onRemoveSubBudget={onRemoveSubBudget}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>
                {isEditMode ? "Update Budget" : "Create Budget"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.backgroundDark,
    padding: 14,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
  },
  currencyInputContainer: {
    backgroundColor: colors.backgroundDark,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    color: colors.text,
    fontSize: 18,
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BudgetModal;
