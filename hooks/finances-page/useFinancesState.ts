import { useTransactionContext } from "@/contexts/AppContext";
import { useTransactionFilters } from "@/hooks/finances-page/handleFilterChange";
import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useCallback, useEffect, useState } from "react";

export const useFinancesScreenState = () => {
  const {
    transactions,
    deleteTransaction,
    refreshTransactions,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useTransactionContext();

  const [selectedClass, setSelectedClass] =
    useState<TransactionType>("expense");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [formType, setFormType] = useState<TransactionType>(null);
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
    (id: string, type: TransactionType) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;
      setFormType(type);
      setSelectedTransaction(transaction);
      setIsFormVisible(true);
    },
    [transactions]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshTransactions();
    setTimeout(() => setRefreshing(false), 2000);
  }, [refreshTransactions]);

  const handleDeleteConfirm = async () => {
    if (!selectedTransactionId) return;
    try {
      await deleteTransaction(selectedTransactionId);
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setModalVisible(false);
      setSelectedTransactionId(null);
    }
  };

  const handleDeleteCancel = () => {
    setModalVisible(false);
    setSelectedTransactionId(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setSelectedTransactionId(id);
    setModalVisible(true);
  };

  const toggleFilters = () => setShowFilters((prev) => !prev);

  return {
    selectedClass,
    setSelectedClass,
    selectedTransaction,
    formType,
    isFormVisible,
    showFilters,
    refreshing,
    summary,
    modalVisible,
    displayedTransactions,
    hasMore,
    isLoadingMore,
    handleEditTransaction,
    handleDeleteTransaction,
    onRefresh,
    handleFilterChange,
    toggleFilters,
    handleDeleteConfirm,
    handleDeleteCancel,
    loadMore,
  };
};
