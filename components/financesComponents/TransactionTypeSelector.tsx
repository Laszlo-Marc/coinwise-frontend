import { colors } from "@/constants/colors";
import { TransactionType } from "@/models/transactionType";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TransactionTypeSelector = ({
  value,
  onChange,
}: {
  value: TransactionType | "all";
  onChange: (type: TransactionType | "all") => void;
}) => {
  const filters: {
    key: TransactionType | "all";
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
  }[] = [
    { key: "all", label: "All", icon: "list" },
    { key: "expense", label: "Expenses", icon: "arrow-down" },
    { key: "income", label: "Income", icon: "arrow-up" },
    { key: "transfer", label: "Transfers", icon: "refresh-cw" },
    { key: "deposit", label: "Deposits", icon: "dollar-sign" },
  ];

  return (
    <View style={styles.filtersRow}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            value === filter.key && styles.selectedFilterButton,
          ]}
          onPress={() => onChange(filter.key as TransactionType | "all")}
        >
          <Feather
            name={filter.icon}
            size={16}
            color={value === filter.key ? "#FFF" : colors.text}
          />
          <Text
            style={[
              styles.filterText,
              value === filter.key && styles.selectedFilterText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 90,
    justifyContent: "center",
  },

  selectedFilterText: {
    color: colors.text,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  selectedFilterButton: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    color: colors.text,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  filterTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontWeight: "500",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
