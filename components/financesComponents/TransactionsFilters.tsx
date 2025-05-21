import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import DateRangeSelector from "./DateRangeComponent";

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    transactionClass: string;
    category?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: Date;
    endDate?: Date;
  }) => void;
  selectedClass: string | null;
  categories?: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  selectedClass,
  categories = [],
}) => {
  const [transactionClass, setTransactionClass] = useState(
    selectedClass || "all"
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());

  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [dateRangeDropdownVisible, setDateRangeDropdownVisible] =
    useState(false);
  const [customDateRangeVisible, setCustomDateRangeVisible] = useState(false);

  const filters: {
    key: string;
    label: string;
    icon: "list" | "arrow-down" | "arrow-up" | "refresh-cw" | "dollar-sign";
  }[] = [
    { key: "all", label: "All", icon: "list" },
    { key: "expenses", label: "Expenses", icon: "arrow-down" },
    { key: "incomes", label: "Income", icon: "arrow-up" },
    { key: "transfers", label: "Transfers", icon: "refresh-cw" },
    { key: "deposits", label: "Deposits", icon: "dollar-sign" },
  ];

  const dateRangePresets = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last Week" },
    { id: "month", label: "Last Month" },
    { id: "3months", label: "Last 3 Months" },
    { id: "custom", label: "Custom Range" },
  ];

  useEffect(() => {
    if (transactionClass) {
      applyFilters();
    }
  }, [
    transactionClass,
    selectedCategory,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (selectedClass) {
      setTransactionClass(selectedClass);
    }
  }, [selectedClass]);

  const handleTransactionClassChange = (newClass: string) => {
    setTransactionClass(newClass);

    if (newClass !== "expenses") {
      setSelectedCategory("");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownVisible(false);
  };

  const handleSortByChange = () => {
    setSortBy(sortBy === "date" ? "amount" : "date");
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setCustomDateRangeVisible(false);
  };

  const applyFilters = () => {
    onFilterChange({
      transactionClass,
      ...(transactionClass === "expenses" && selectedCategory
        ? { category: selectedCategory }
        : {}),
      sortBy,
      sortOrder,
      startDate,
      endDate,
    });
  };

  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let start = new Date();

    if (preset === "custom") {
      setCustomDateRangeVisible(true);
      setDateRangeDropdownVisible(false);
      return;
    }

    switch (preset) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        start = new Date(now);
        start.setMonth(now.getMonth() - 3);
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(new Date());
    setDateRangeDropdownVisible(false);
  };

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <Text style={styles.filterTitle}>Filter Transactions</Text>

      {/* Transaction Type Filters */}
      <View style={styles.filtersRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              transactionClass === filter.key && styles.selectedFilterButton,
            ]}
            onPress={() => handleTransactionClassChange(filter.key)}
          >
            <Feather
              name={filter.icon}
              size={16}
              color={transactionClass === filter.key ? "#FFF" : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                transactionClass === filter.key && styles.selectedFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort and Filter Controls */}
      <View style={styles.controlsContainer}>
        {/* Sort Controls */}
        <View style={styles.sortControlsRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSortByChange}
          >
            <Feather name="bar-chart-2" size={14} color={colors.text} />
            <Text style={styles.sortButtonText}>
              Sort: {sortBy === "date" ? "Date" : "Amount"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={handleSortOrderChange}
          >
            <Feather
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={14}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateRangeButton}
              onPress={() => {
                setDateRangeDropdownVisible(!dateRangeDropdownVisible);
                setCategoryDropdownVisible(false);
              }}
            >
              <Feather name="calendar" size={14} color={colors.text} />
              <Text style={styles.dateRangeText} numberOfLines={1}>
                {formatDateRange()}
              </Text>
              <Feather
                name={dateRangeDropdownVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>

            {dateRangeDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {dateRangePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.dropdownItem}
                    onPress={() => applyDatePreset(preset.id)}
                  >
                    <Text style={styles.dropdownItemText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Category Filter - Only for Expenses */}
        {transactionClass === "expenses" && categories.length > 0 && (
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => {
                setCategoryDropdownVisible(!categoryDropdownVisible);
                setDateRangeDropdownVisible(false);
              }}
            >
              <Feather name="tag" size={14} color={colors.text} />
              <Text style={styles.categoryButtonText}>
                Category: {selectedCategory || "All"}
              </Text>
              <Feather
                name={categoryDropdownVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>

            {categoryDropdownVisible && (
              <View style={styles.categoryDropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }}>
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      !selectedCategory && styles.activeDropdownItem,
                    ]}
                    onPress={() => handleCategoryChange("")}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        !selectedCategory && styles.activeDropdownItemText,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.dropdownItem,
                        selectedCategory === category &&
                          styles.activeDropdownItem,
                      ]}
                      onPress={() => handleCategoryChange(category)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedCategory === category &&
                            styles.activeDropdownItemText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Custom Date Range Modal */}
      {customDateRangeVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={customDateRangeVisible}
          onRequestClose={() => setCustomDateRangeVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <TouchableOpacity
                  onPress={() => setCustomDateRangeVisible(false)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateRangeChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    marginBottom: 16,
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
  },
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
  selectedFilterButton: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    color: colors.text,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  selectedFilterText: {
    color: "#FFFFFF",
  },
  controlsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  sortControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  sortButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
  sortOrderButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRangeContainer: {
    position: "relative",
    flex: 1,
    zIndex: 2,
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
    flex: 1,
  },
  dateRangeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  categoryContainer: {
    position: "relative",
    zIndex: 1,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: 34,
    right: 0,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 160,
    zIndex: 1000,
  },
  categoryDropdownMenu: {
    position: "absolute",
    top: 34,
    left: 0,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  activeDropdownItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "400",
  },
  activeDropdownItemText: {
    fontWeight: "600",
    color: colors.primary[300],
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
});

export default TransactionFilters;
