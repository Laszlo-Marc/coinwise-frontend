import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

type TransactionFiltersProps = {
  onFilterChange: (filters: {
    transactionClass: string;
    startDate: Date;
    endDate: Date;
    selectedCategory: string;
    searchTerm: string;
    searchField: string;
  }) => void;
  categories?: string[];
};

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  categories = [],
}) => {
  // Filter states
  const [transactionClass, setTransactionClass] = useState("expenses");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("merchant"); // 'merchant' or 'description'

  const [showFilters, setShowFilters] = useState(false);

  const transactionClasses: {
    id: string;
    label: string;
    icon:
      | "cart-outline"
      | "cash-outline"
      | "swap-horizontal-outline"
      | "trending-up-outline";
  }[] = [
    { id: "expenses", label: "Expenses", icon: "cart-outline" },
    { id: "deposits", label: "Deposits", icon: "cash-outline" },
    { id: "transfers", label: "Transfers", icon: "swap-horizontal-outline" },
    { id: "incomes", label: "Incomes", icon: "trending-up-outline" },
  ];

  const applyFilters = () => {
    onFilterChange({
      transactionClass,
      startDate,
      endDate,
      selectedCategory,
      searchTerm,
      searchField,
    });
  };

  const resetFilters = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setSelectedCategory("");
    setSearchTerm("");
    setSearchField("merchant");

    onFilterChange({
      transactionClass,
      startDate: new Date(),
      endDate: new Date(),
      selectedCategory: "",
      searchTerm: "",
      searchField: "merchant",
    });
  };

  const handleTransactionClassChange = (newClass: string) => {
    setTransactionClass(newClass);
    // Apply filters with the new class
    onFilterChange({
      transactionClass: newClass,
      startDate,
      endDate,
      selectedCategory,
      searchTerm,
      searchField,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <View style={styles.container}>
      {/* Transaction Class Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.classButtonsContainer}
      >
        {transactionClasses.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.classButton,
              transactionClass === item.id && styles.activeClassButton,
            ]}
            onPress={() => handleTransactionClassChange(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={
                transactionClass === item.id ? colors.background : colors.text
              }
            />
            <Text
              style={[
                styles.classButtonText,
                transactionClass === item.id && styles.activeClassButtonText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Toggle Filter Button */}
      <TouchableOpacity
        style={styles.toggleFiltersButton}
        onPress={toggleFilters}
      >
        <Text style={styles.toggleFiltersText}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Text>
        <Ionicons
          name={showFilters ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color={colors.primary[500]}
        />
      </TouchableOpacity>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={colors.textSecondary}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Field Selector */}
            <View style={styles.searchFieldContainer}>
              <Text style={styles.searchFieldLabel}>Search in:</Text>
              <View style={styles.searchFieldButtons}>
                <TouchableOpacity
                  style={[
                    styles.searchFieldButton,
                    searchField === "merchant" &&
                      styles.activeSearchFieldButton,
                  ]}
                  onPress={() => setSearchField("merchant")}
                >
                  <Text
                    style={[
                      styles.searchFieldButtonText,
                      searchField === "merchant" &&
                        styles.activeSearchFieldButtonText,
                    ]}
                  >
                    Merchant
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.searchFieldButton,
                    searchField === "description" &&
                      styles.activeSearchFieldButton,
                  ]}
                  onPress={() => setSearchField("description")}
                >
                  <Text
                    style={[
                      styles.searchFieldButtonText,
                      searchField === "description" &&
                        styles.activeSearchFieldButtonText,
                    ]}
                  >
                    Description
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Filter - Only for Expenses */}
            {transactionClass === "expenses" && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Category</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) =>
                      setSelectedCategory(itemValue)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="All Categories" value="" />
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
            )}

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  classButtonsContainer: {
    flexDirection: "row",
    padding: 12,
  },
  classButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  activeClassButton: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  classButtonText: {
    color: colors.text,
    marginLeft: 6,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  activeClassButtonText: {
    color: colors.background,
  },
  toggleFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary[300],
  },
  toggleFiltersText: {
    color: colors.primary[500],
    marginRight: 5,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  filtersContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary[300],
  },
  searchContainer: {
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: colors.text,
    fontFamily: "Montserrat",
  },
  searchFieldContainer: {
    marginBottom: 5,
  },
  searchFieldLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  searchFieldButtons: {
    flexDirection: "row",
  },
  searchFieldButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  activeSearchFieldButton: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  searchFieldButtonText: {
    color: colors.text,
    fontFamily: "Montserrat",
  },
  activeSearchFieldButtonText: {
    color: colors.background,
    fontWeight: "600",
  },
  pickerContainer: {
    marginBottom: 5,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  picker: {
    height: 45,
    color: colors.text,
  },
  dateFilterSection: {
    marginBottom: 5,
  },
  filterTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },

  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  resetButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  applyButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    alignItems: "center",
  },
  applyButtonText: {
    color: colors.background,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});

export default TransactionFilters;
