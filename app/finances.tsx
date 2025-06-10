import { TransactionList } from "@/components/financesComponents/TransactionList";
import TransactionsFiltersPanel from "@/components/financesComponents/TransactionsFilterPanel";
import TransactionsSummaryCard from "@/components/financesComponents/TransactionsSummaryCard";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import ActionBar from "@/components/mainComponents/ActionBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactionFilters } from "@/hooks/finances-page/handleFilterChange";
import { TransactionModel } from "@/models/transaction";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Finances() {
  const {
    transactions,
    deleteTransaction,
    refreshTransactions,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useTransactionContext();
  const { getStoredUserData } = useAuth();
  const [selectedClass, setSelectedClass] =
    useState<TransactionType>("expense");
  const [focusAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  type TransactionType = "expense" | "income" | "transfer" | "deposit";
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const { displayedTransactions, handleFilterChange, filters } =
    useTransactionFilters(transactions);
  useEffect(() => {
    if (transactions.length > 0) {
      handleFilterChange({ transactionClass: "expense" });
    }
  }, [transactions]);

  const handleEditTransaction = useCallback(
    (id: string, type: string) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;

      setFormType(type as TransactionType);
      setSelectedTransaction(transaction);
      setIsFormVisible(true);
    },
    [transactions]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshTransactions();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedTransactionId) return;
    try {
      await deleteTransaction(selectedTransactionId);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setModalVisible(false);
      setSelectedTransactionId(null);
    }
  };
  const handleDeleteCancel = () => {
    setModalVisible(false);
    setSelectedTransactionId(null);
  };
  const handleDeleteTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setModalVisible(true);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <View style={styles.container}>
      <ActionBar
        title="Transaction History"
        leftButton={{
          icon: "home",
          onPress: () => router.replace("/home"),
          accessibilityLabel: "Home",
        }}
        rightButton={{
          icon: "user",
          onPress: () => router.push("/profile"),
          accessibilityLabel: "View profile",
        }}
        actionButtons={[
          {
            icon: "plus",
            onPress: () => router.replace("/transactions"),
            accessibilityLabel: "Add new transaction",
          },
          {
            icon: "filter",
            onPress: toggleFilters,
            accessibilityLabel: "Filter transactions",
          },
        ]}
      />
      <TransactionsSummaryCard
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        balance={summary.balance}
      />

      <View style={styles.contentContainer}>
        <AnimatedCard delay={200}>
          <View style={styles.inlineActions}>
            <TouchableOpacity
              onPress={() => router.replace("/transactions")}
              style={styles.inlineButton}
            >
              <Feather name="plus" size={20} color={colors.text} />
              <Text style={styles.inlineButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleFilters}
              style={styles.inlineButton}
            >
              <Feather name="filter" size={20} color={colors.text} />
              <Text style={styles.inlineButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>
        <TransactionsFiltersPanel
          visible={showFilters}
          onFilterChange={handleFilterChange}
          selectedClass={selectedClass}
        />
        <View style={styles.listContainer}>
          <AnimatedCard delay={300}>
            <TransactionList
              transactions={displayedTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onEndReached={loadMore}
              hasMore={hasMore}
              loadingMore={isLoadingMore}
            />
          </AnimatedCard>
        </View>
      </View>

      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
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
    paddingTop: 8,
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  inlineActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inlineButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
});
