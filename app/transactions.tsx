import BottomBar from "@/components/BottomBar";
import DocumentPickerComponent from "@/components/DocumentPicker";
import MainSection from "@/components/MainSection";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Pen, Plus, Trash } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SwipeListView } from "react-native-swipe-list-view";
import TransactionItem from "../components/TransactionItem";
import { colors } from "../constants/colors";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export default function TransactionsListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"start" | "end">(
    "start"
  );
  const router = useRouter();

  const fetchTransactions = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network
    setTransactions([
      {
        id: "1",
        title: "Grocery Store",
        amount: -45.99,
        date: "2025-04-24",
        category: "Food",
        type: "expense",
        onDelete: () => handleDeleteTransaction("1"),
        onEdit: () => handleEditTransaction("1"),
        onPress: () => handleViewTransaction("1"),
      },
      {
        id: "2",
        title: "Salary",
        amount: 1500,
        date: "2025-04-20",
        category: "Income",
        type: "income",
        onDelete: () => handleDeleteTransaction("2"),
        onEdit: () => handleEditTransaction("2"),
        onPress: () => handleViewTransaction("2"),
      },
    ]);
    setRefreshing(false);
  };

  const renderHiddenItem = ({ item }: { item: Transaction }, rowMap: any) => (
    <View style={styles.hiddenContainer}>
      <Animated.View
        entering={FadeInLeft}
        style={[styles.hiddenButton, { backgroundColor: colors.primary[500] }]}
      >
        <TouchableOpacity
          style={styles.hiddenTouchable}
          onPress={() => {
            handleEditTransaction(item.id);
            rowMap[item.id]?.closeRow();
          }}
        >
          <Ionicons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInRight}
        style={[styles.hiddenButton, { backgroundColor: "#D32F2F" }]}
      >
        <TouchableOpacity
          style={styles.hiddenTouchable}
          onPress={() => {
            handleDeleteTransaction(item.id);
            rowMap[item.id]?.closeRow();
          }}
        >
          <Ionicons name="trash" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
  const handleDeleteTransaction = (id: string) => {
    console.log("Delete transaction:", id);
    // You would implement actual delete functionality here
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditTransaction = (id: string) => {
    console.log("Edit transaction:", id);
    // You would navigate to edit screen or show edit modal here
  };

  const handleViewTransaction = (id: string) => {
    console.log("View transaction:", id);
    // You would navigate to transaction details screen here
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  const onRefresh = useCallback(() => {
    fetchTransactions();
  }, []);

  const openDatePicker = (mode: "start" | "end") => {
    setDatePickerMode(mode);
    setDatePickerVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setDatePickerVisible(false);
    }

    if (selectedDate) {
      if (datePickerMode === "start") {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      title={item.title}
      amount={item.amount}
      date={item.date}
      category={item.category}
      type={item.type}
      onPress={item.onPress}
      onEdit={item.onEdit}
      onDelete={item.onDelete}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No transactions found</Text>
    </View>
  );
  const renderHeader = () => (
    <View>
      <MainSection
        actionButtons={
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/add-transactions")}
            >
              <View style={styles.actionIconContainer}>
                <Plus color={colors.text} size={24} />
              </View>
              <Text style={styles.actionText}>Add transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Pen color={colors.text} size={24} />
              </View>
              <Text style={styles.actionText}>Edit multiple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Trash color={colors.text} size={24} />
              </View>
              <Text style={styles.actionText}>Delete multiple</Text>
            </TouchableOpacity>
          </>
        }
      />
      <DocumentPickerComponent />
      <View style={styles.contentContainer}>
        {/* Period Picker Section - Vertically stacked for better layout */}
        <View style={styles.dateFilterSection}>
          <Text style={styles.filterTitle}>Filter by Date Range</Text>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("start")}
            >
              <Text style={styles.dateButtonLabel}>From</Text>
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("end")}
            >
              <Text style={styles.dateButtonLabel}>To</Text>
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Date Picker Modal for iOS */}
      {Platform.OS === "ios" && datePickerVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={datePickerVisible}
          onRequestClose={hideDatePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  Select {datePickerMode === "start" ? "Start" : "End"} Date
                </Text>
                <TouchableOpacity
                  onPress={hideDatePicker}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={datePickerMode === "start" ? startDate : endDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === "android" && datePickerVisible && (
        <DateTimePicker
          value={datePickerMode === "start" ? startDate : endDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Transactions List */}
      <SwipeListView
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        leftOpenValue={150}
        disableRightSwipe={false}
        disableLeftSwipe={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },

  dateFilterSection: {
    marginBottom: 16,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.text,
    fontFamily: "Montserrat",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
    alignItems: "center",
  },
  dateButtonLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Montserrat",
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[300],
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  datePicker: {
    height: 200,
  },
  hiddenContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    marginBottom: 10,
  },
  hiddenButton: {
    width: 75,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  hiddenTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
  },
});
