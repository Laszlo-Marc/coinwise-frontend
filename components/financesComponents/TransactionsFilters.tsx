import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/colors";
import DateRangeSelector from "./DateRangeComponent";

type TransactionFiltersProps = {
  onFilterChange: (filters: {
    transactionClass: string;
    category?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: Date;
    endDate?: Date;
  }) => void;
  categories?: string[];
};

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  categories = [],
}) => {
  // Filter states
  const [transactionClass, setTransactionClass] = useState("expenses");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  
  // Dropdown states
  const [sortByDropdownVisible, setSortByDropdownVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [dateRangeDropdownVisible, setDateRangeDropdownVisible] = useState(false);
  const [customDateRangeVisible, setCustomDateRangeVisible] = useState(false);

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

  // Date range preset options
  const dateRangePresets = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last Week" },
    { id: "month", label: "Last Month" },
    { id: "3months", label: "Last 3 Months" },
    { id: "custom", label: "Custom Range" },
  ];

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [
    transactionClass,
    selectedCategory,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  ]);

  const handleTransactionClassChange = (newClass: string) => {
    setTransactionClass(newClass);
    // Reset category when changing transaction class
    if (newClass !== "expenses") {
      setSelectedCategory("");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownVisible(false);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setSortByDropdownVisible(false);
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setCustomDateRangeVisible(false);
  };

  // Apply all filters and notify parent
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

  // Preset date ranges
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

  // Format date range for display
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

      {/* Horizontal Filters Bar */}
      <View style={styles.filtersBar}>
        {/* Sort By Dropdown */}
        <View style={[styles.filterGroup, { zIndex: 4 }]}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setSortByDropdownVisible(!sortByDropdownVisible);
              setCategoryDropdownVisible(false);
              setDateRangeDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownButtonLabel}>Sort: {sortBy === "date" ? "Date" : "Amount"}</Text>
            <Ionicons
              name={sortByDropdownVisible ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.text}
            />
          </TouchableOpacity>
          
          {sortByDropdownVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[styles.dropdownItem, sortBy === "date" && styles.activeDropdownItem]}
                onPress={() => handleSortByChange("date")}
              >
                <Text style={[styles.dropdownItemText, sortBy === "date" && styles.activeDropdownItemText]}>Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, sortBy === "amount" && styles.activeDropdownItem]}
                onPress={() => handleSortByChange("amount")}
              >
                <Text style={[styles.dropdownItemText, sortBy === "amount" && styles.activeDropdownItemText]}>Amount</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Sort Order Button */}
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={handleSortOrderChange}
          >
            <Ionicons
              name={
                sortOrder === "asc"
                  ? "arrow-up-outline"
                  : "arrow-down-outline"
              }
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Category Dropdown - Only for Expenses */}
        {transactionClass === "expenses" && categories.length > 0 && (
          <View style={[styles.filterGroup, { zIndex: 3 }]}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setCategoryDropdownVisible(!categoryDropdownVisible);
                setSortByDropdownVisible(false);
                setDateRangeDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownButtonLabel}>
                Category: {selectedCategory || "All"}
              </Text>
              <Ionicons
                name={categoryDropdownVisible ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.text}
              />
            </TouchableOpacity>
            
            {categoryDropdownVisible && (
              <View style={[styles.dropdownMenu, styles.categoryDropdownMenu]}>
                <ScrollView style={{ maxHeight: 200 }}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, !selectedCategory && styles.activeDropdownItem]}
                    onPress={() => handleCategoryChange("")}
                  >
                    <Text style={[styles.dropdownItemText, !selectedCategory && styles.activeDropdownItemText]}>All Categories</Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.dropdownItem, selectedCategory === category && styles.activeDropdownItem]}
                      onPress={() => handleCategoryChange(category)}
                    >
                      <Text style={[styles.dropdownItemText, selectedCategory === category && styles.activeDropdownItemText]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Date Range Dropdown */}
        <View style={[styles.filterGroup, { zIndex: 2 }]}>
          <TouchableOpacity
            style={[styles.dropdownButton, { minWidth: 140 }]}
            onPress={() => {
              setDateRangeDropdownVisible(!dateRangeDropdownVisible);
              setSortByDropdownVisible(false);
              setCategoryDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownButtonLabel} numberOfLines={1}>
              Date: {formatDateRange()}
            </Text>
            <Ionicons
              name={dateRangeDropdownVisible ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.text}
            />
          </TouchableOpacity>
          
          {dateRangeDropdownVisible && (
            <View style={[styles.dropdownMenu, styles.dateRangeDropdownMenu]}>
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
                  <Ionicons name="close" size={24} color={colors.text} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.backgroundLight,
    // Remove overflow: "hidden" to allow dropdowns to appear outside container
  },
  classButtonsContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 12,
  },
  classButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.background,
    borderWidth:  1,
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
  filtersBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary[200],
    zIndex: 1,
  },
  filterGroup: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[300],
    minWidth: 110,
  },
  dropdownButtonLabel: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontWeight: "500",
    fontSize: 12,
    marginRight: 4,
  },
  sortOrderButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[300],
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
  dropdownMenu: {
    position: "absolute",
    top: 38,
    left: 0,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: "100%",
    width: 160, // Fixed width
    overflow: "visible",
  },
  categoryDropdownMenu: {
    width: 200,
  },
  dateRangeDropdownMenu: {
    right: 0,
    left: undefined,
    width: 160,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[200],
  },
  activeDropdownItem: {
    backgroundColor: colors.primary[100],
  },
  dropdownItemText: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontWeight: "400",
    fontSize: 14,
  },
  activeDropdownItemText: {
    fontWeight: "600",
    color: colors.primary[700],
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
});

export default TransactionFilters;