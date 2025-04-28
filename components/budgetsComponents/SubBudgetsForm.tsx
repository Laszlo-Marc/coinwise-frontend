// components/budgets/SubBudgetsForm.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SubBudget } from "./BudgetItem"; // reuse types

type Props = {
  enabled: boolean;
  subBudgets: SubBudget[];
  onToggle: (value: boolean) => void;
  onAddSubBudget: () => void;
  onUpdateSubBudget: (
    id: string,
    field: keyof SubBudget,
    value: string | number
  ) => void;
  onRemoveSubBudget: (id: string) => void;
};

const SubBudgetsForm = ({
  enabled,
  subBudgets,
  onToggle,
  onAddSubBudget,
  onUpdateSubBudget,
  onRemoveSubBudget,
}: Props) => {
  return (
    <View style={styles.formGroup}>
      {/* Toggle */}
      <View style={styles.switchContainer}>
        <Text style={styles.formLabel}>Sub-Budgets</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.backgroundLight,
            true: colors.primary[400],
          }}
          thumbColor={enabled ? colors.primary[500] : colors.textSecondary}
        />
      </View>

      {/* Sub-Budget Items */}
      {enabled && (
        <View style={styles.subBudgetsContainer}>
          {subBudgets.map((subBudget) => (
            <View key={subBudget.id} style={styles.subBudgetItem}>
              <View style={styles.subBudgetItemHeader}>
                <TextInput
                  style={styles.subBudgetName}
                  value={subBudget.name}
                  onChangeText={(text) =>
                    onUpdateSubBudget(subBudget.id, "name", text)
                  }
                  placeholder="Sub-budget name"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  style={styles.removeSubBudgetButton}
                  onPress={() => onRemoveSubBudget(subBudget.id)}
                >
                  <Feather name="trash-2" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.subBudgetAmountContainer}>
                <Text style={styles.subBudgetAmountLabel}>Amount:</Text>
                <TextInput
                  style={styles.subBudgetAmountInput}
                  value={subBudget.amount.toString()}
                  onChangeText={(text) =>
                    onUpdateSubBudget(subBudget.id, "amount", text)
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          ))}

          {/* Add Sub-Budget */}
          <TouchableOpacity
            style={styles.addSubBudgetButton}
            onPress={onAddSubBudget}
          >
            <Feather name="plus" size={16} color={colors.text} />
            <Text style={styles.addSubBudgetButtonText}>Add Sub-Budget</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 16, color: colors.text, marginBottom: 8 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subBudgetsContainer: { marginTop: 12 },
  subBudgetItem: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  subBudgetItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subBudgetName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 4,
  },
  removeSubBudgetButton: {
    padding: 4,
  },
  subBudgetAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subBudgetAmountLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  subBudgetAmountInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  addSubBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  addSubBudgetButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SubBudgetsForm;
