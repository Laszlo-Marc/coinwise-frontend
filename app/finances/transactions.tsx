import BottomBar from "@/components/mainComponents/BottomBar";
import MainSection from "@/components/mainComponents/MainSection";

import ActionsComponent from "@/components/financesComponents/ActionsComponent";
import TransactionClassModal from "@/components/financesComponents/TransactionClasssModal";
import {
  DepositForm,
  ExpenseForm,
  IncomeForm,
  TransferForm,
} from "@/components/financesComponents/TransactionsForms";
import { AntDesign } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SwipeListView } from "react-native-swipe-list-view";
import TransactionItem from "../../components/financesComponents/TransactionItem";
import { colors } from "../../constants/colors";
import Transaction from "../../data/transaction";

export default function TransactionsListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const router = useRouter();
  const [formType, setFormType] = useState<
    "expense" | "income" | "transfer" | "deposit" | null
  >(null);

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
  };

  const handleEditTransaction = (id: string) => {
    console.log("Edit transaction:", id);
    // You would navigate to edit screen or show edit modal here
  };

  const handleViewTransaction = (id: string) => {
    console.log("View transaction:", id);
    // You would navigate to transaction details screen here
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      merchant={item.merchant}
      amount={item.amount}
      date={item.date}
      category={item.category}
      id={item.id}
      user_id={item.user_id}
      description={item.description}
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
  const handleManualTransaction = () => {
    setClassModalVisible(true); // instead of defaulting to expense
  };

  const renderHeader = () => (
    <View>
      <MainSection
        actionButtons={
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleManualTransaction}
            >
              <View style={styles.actionIconContainer}>
                <AntDesign name="plus" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>
                {addingTransaction ? "Cancel" : "Add transaction"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <FontAwesome5 name="pen" color={colors.text} size={24} />
              </View>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="trash-outline" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Delete multiple</Text>
            </TouchableOpacity>
          </>
        }
      />
      <ActionsComponent />
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
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />

      <BottomBar />

      {/* Class Modal */}
      <TransactionClassModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        onSelect={(type) => {
          setFormType(type);
          setClassModalVisible(false);
        }}
      />

      {/* Transaction Forms */}
      <ExpenseForm
        visible={formType === "expense"}
        onClose={() => setFormType(null)}
        onSubmit={(data) => {
          console.log("Expense submitted:", data);
          // Here you would add the new transaction to your state
          const newTransaction: Transaction = {
            id: Date.now().toString(), // generate a temporary ID
            user_id: "current-user-id", // replace with actual user ID
            merchant: data.merchant,
            amount: data.amount,
            date: new Date(data.date),
            category: data.category,
            description: data.description,
            type: "expense",
          };

          setTransactions([newTransaction, ...transactions]);
          setFormType(null);
        }}
        categories={[
          "Groceries",
          "Dining",
          "Transportation",
          "Utilities",
          "Entertainment",
          "Shopping",
          "Health",
          "Education",
          "Travel",
          "Other",
        ]}
      />

      <IncomeForm
        visible={formType === "income"}
        onClose={() => setFormType(null)}
        onSubmit={(data) => {
          console.log("Income submitted:", data);
          // Similar implementation to expense
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            user_id: "current-user-id",
            merchant: "Income Source",
            amount: data.amount,
            date: new Date(data.date),
            category: "Income",
            description: data.description,
            type: "income",
          };

          setTransactions([newTransaction, ...transactions]);
          setFormType(null);
        }}
      />

      <TransferForm
        visible={formType === "transfer"}
        onClose={() => setFormType(null)}
        onSubmit={(data) => {
          console.log("Transfer submitted:", data);
          // Similar implementation
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            user_id: "current-user-id",
            merchant: `${data.sender} → ${data.receiver}`,
            amount: data.amount,
            date: new Date(data.date),
            category: "Transfer",
            description: data.description,
            type: "transfer",
          };

          setTransactions([newTransaction, ...transactions]);
          setFormType(null);
        }}
      />

      <DepositForm
        visible={formType === "deposit"}
        onClose={() => setFormType(null)}
        onSubmit={(data) => {
          console.log("Deposit submitted:", data);
          // Similar implementation
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            user_id: "current-user-id",
            merchant: "Deposit",
            amount: data.amount,
            date: new Date(data.date),
            category: "Deposit",
            description: data.description,
            type: "deposit",
          };

          setTransactions([newTransaction, ...transactions]);
          setFormType(null);
        }}
      />
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
