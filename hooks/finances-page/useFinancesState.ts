import { useTransactionContext } from "@/contexts/AppContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useCallback, useEffect, useState } from "react";
import { useTransactionFilters } from "./handleFilterChange";

export const useFinancesScreenState = () => {
  const {
    transactions,
    deleteTransaction,
    fetchTransactions,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useTransactionContext();

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const { statsOverview } = useStatsContext();
  const [summary, setSummary] = useState({
    totalExpenses: statsOverview?.totalExpenses || 0,
    totalIncome: statsOverview?.totalIncome || 0,
    balance: statsOverview?.balance || 0,
  });
  const { filters, handleFilterChange } =
    useTransactionFilters(fetchTransactions);

  useEffect(() => {
    fetchTransactions(1, filters);
  }, []);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTransactions(1, filters);
    } catch (e) {
      console.error("Error refreshing transactions:", e);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTransactions, filters]);

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
    filters,
    handleFilterChange,
    selectedTransaction,
    formType,
    isFormVisible,
    showFilters,
    refreshing,
    summary,
    modalVisible,
    transactions,
    hasMore,
    isLoadingMore,
    handleEditTransaction,
    handleDeleteTransaction,
    onRefresh,
    toggleFilters,
    handleDeleteConfirm,
    handleDeleteCancel,
    loadMore,
    setIsFormVisible,
    setModalVisible,
    setSelectedTransactionId,
  };
};
