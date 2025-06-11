import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionsCardProps {
  onAddExpense: () => void;
  onEditBudget: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddExpense,
  onEditBudget,
}) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Quick Actions
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onAddExpense}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.primary[500] + "20",
              borderColor: colors.primary[500] + "40",
            },
          ]}
        >
          <Feather name="plus" size={24} color={colors.primary[500]} />
          <Text
            style={[styles.actionButtonText, { color: colors.primary[500] }]}
          >
            Add Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onEditBudget}
          style={styles.actionButtonSecondary}
        >
          <Feather name="edit-3" size={24} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Edit Budget
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
});

export default QuickActionsCard;
