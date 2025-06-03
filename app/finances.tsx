import { TransactionList } from "@/components/financesComponents/TransactionList";
import { TransactionFilters } from "@/components/financesComponents/TransactionsFilters";
import ActionBar from "@/components/mainComponents/ActionBar";
import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionModel } from "@/models/transaction";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
    fetchTransactions,
  } = useTransactionContext();
  const { getStoredUserData } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>("expenses");
  const [focusAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const [displayedTransactions, setDisplayedTransactions] = useState<
    TransactionModel[]
  >([]);
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

  useEffect(() => {
    if (transactions.length > 0) {
      (async () => {
        const currentUser = await getStoredUserData();
        handleFilterChange({ transactionClass: "expenses" });
        calculateSummary(transactions, currentUser?.full_name ?? null);
      })();
    } else {
      fetchTransactions();
    }
  }, [transactions]);

  const calculateSummary = (
    transactionList: any[],
    currentUser: string | null
  ) => {
    let totalExpenses = 0;
    let totalIncome = 0;

    transactionList.forEach((transaction) => {
      const { type, amount, sender, receiver } = transaction;

      if (
        type === "expense" ||
        (type === "transfer" && sender === currentUser)
      ) {
        totalExpenses += amount;
      } else if (
        type === "income" ||
        type === "deposit" ||
        (type === "transfer" && receiver === currentUser)
      ) {
        totalIncome += amount;
      }
    });

    setSummary({
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
    });
  };

  const handleFilterChange = useCallback(
    (filters: {
      transactionClass: string;
      category?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      startDate?: Date;
      endDate?: Date;
    }) => {
      setSelectedClass(filters.transactionClass);

      // Filter by transaction type first
      let filteredTransactions = transactions;

      // Filter by transaction class
      switch (filters.transactionClass) {
        case "expenses":
          filteredTransactions = transactions.filter(
            (t) => t.type === "expense"
          );
          break;
        case "incomes":
          filteredTransactions = transactions.filter(
            (t) => t.type === "income"
          );
          break;
        case "deposits":
          filteredTransactions = transactions.filter(
            (t) => t.type === "deposit"
          );
          break;
        case "transfers":
          filteredTransactions = transactions.filter(
            (t) => t.type === "transfer"
          );
          break;
        case "all":
          filteredTransactions = transactions;
          break;
        default:
          filteredTransactions = transactions.filter(
            (t) => t.type === "expense"
          );
      }

      // Filter by category if provided
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.category === filters.category
        );
      }

      // Filter by date range if provided
      if (filters.startDate && filters.endDate) {
        const startTime = filters.startDate.getTime();
        const endTime = filters.endDate.getTime();

        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date).getTime();
          return transactionDate >= startTime && transactionDate <= endTime;
        });
      }

      // Sort the transactions
      if (filters.sortBy) {
        filteredTransactions = [...filteredTransactions].sort((a, b) => {
          if (filters.sortBy === "date") {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          } else if (filters.sortBy === "amount") {
            return filters.sortOrder === "asc"
              ? a.amount - b.amount
              : b.amount - a.amount;
          }
          return 0;
        });
      }

      setDisplayedTransactions(filteredTransactions);
    },
    [transactions]
  );

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

  const handleDeleteTransaction = useCallback(
    (id: string, type: TransactionType) => {
      Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              deleteTransaction(id);
            },
          },
        ]
      );
    },
    []
  );

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <View style={styles.container}>
      <ActionBar
        title="Transaction History"
        leftButton={{
          icon: "home",
          onPress: () => router.replace("/"),
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
      >
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              ${summary.totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expensesText]}>
              ${summary.totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text
              style={[
                styles.summaryValue,
                summary.balance >= 0 ? styles.incomeText : styles.expensesText,
              ]}
            >
              ${summary.balance.toFixed(2)}
            </Text>
          </View>
        </View>
      </ActionBar>

      <View style={styles.contentContainer}>
        {showFilters && (
          <View style={styles.filtersContainer}>
            <TransactionFilters
              onFilterChange={handleFilterChange}
              selectedClass={selectedClass}
            />
          </View>
        )}

        <View style={styles.listContainer}>
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
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => router.replace("/transactions")}
            style={styles.actionButton}
            accessibilityLabel="Add new transaction"
          >
            <Feather
              name="plus"
              size={20}
              color={colors.text}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFilters} style={styles.actionButton}>
            <Feather
              name="filter"
              size={20}
              color={colors.text}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
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
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  actionsContainer: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
    fontFamily: "Montserrat",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  incomeText: {
    color: colors.success,
    fontFamily: "Montserrat",
  },
  expensesText: {
    color: colors.error,
    fontFamily: "Montserrat",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    zIndex: 1,
  },
});
