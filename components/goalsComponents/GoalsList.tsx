import { GoalModel } from "@/models/goal";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import GoalsItem from "./GoalsItem";

interface GoalsListProps {
  goals: GoalModel[];
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onSelect: (goal: GoalModel) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  onEdit,
  onDelete,
  onSelect,
}) => {
  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id ?? ""}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <GoalsItem
          goal={item}
          onEdit={() => onEdit(item.id ?? "")}
          onDelete={() => onDelete(item.id ?? "")}
          onPress={() => onSelect(item)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
});

export default GoalsList;
