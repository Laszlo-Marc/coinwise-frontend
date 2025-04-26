import BottomBar from "@/components/BottomBar";
import DocumentPickerComponent from "@/components/DocumentPicker";
import MainSection from "@/components/MainSection";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { Pen, Plus, Trash } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void;
}

export default function TransactionsListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

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

  return (
    <View style={styles.container}>
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

      <View style={styles.listContainer}>
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
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmpty}
        />
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  listContainer: {
    flexGrow: 1,
    padding: 16,
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
