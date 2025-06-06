import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useMemo, useState } from "react";
import { PaginatedResponse, TransactionModel } from "../models/transaction";

interface TransactionContextType {
  transactions: TransactionModel[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loadMore: (transactionClass?: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (
    transaction: TransactionModel
  ) => Promise<string | undefined>;
  fetchTransactions: (page?: number, filter?: string) => Promise<void>;
  uploadBankStatement: (file: FormData) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<TransactionModel>
  ) => Promise<any>;
  transactionsCleanup: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);
const API_BASE_URL = "http://192.168.1.156:5000/api";
const TRANSACTIONS_API_URL = `${API_BASE_URL}/transactions`;
const UPLOAD_API_URL = `${API_BASE_URL}/upload`;

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilter, setCurrentFilter] = useState<string | undefined>();

  const pageSize = 100;
  const hasMore = currentPage < totalPages;

  const transactionsCleanup = () => {
    setTransactions([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setCurrentPage(1);
    setTotalPages(1);
    setCurrentFilter(undefined);
  };
  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    setError("Something went wrong. Please try again.");
  };
  const fixTransferData = async () => {
    const token = await SecureStore.getItem("auth_token");

    const response = await axios.post(
      `${TRANSACTIONS_API_URL}/fix-transfer-names`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
  };

  const fetchTransactions = async (
    page: number = 1,
    filter?: string
  ): Promise<void> => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const reponse = await fixTransferData();
      const token = await SecureStore.getItem("auth_token");

      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      };

      if (filter) {
        params.type =
          filter === "expenses"
            ? "expense"
            : filter === "incomes"
            ? "income"
            : filter === "transfers"
            ? "transfer"
            : filter === "deposits"
            ? "deposit"
            : undefined;
      }

      const response = await axios.get<PaginatedResponse>(
        `${TRANSACTIONS_API_URL}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        }
      );

      const { data, page: returnedPage, total_pages } = response.data;

      if (page === 1) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }

      setCurrentPage(returnedPage);
      setTotalPages(total_pages);

      // Save the current filter
      if (filter) {
        setCurrentFilter(filter);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      // Reset loading states based on which operation completed
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const addTransaction = async (
    transaction: TransactionModel
  ): Promise<string | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");
      const { id, ...dataToSend } = transaction;
      console.log("Adding transaction:", dataToSend);
      console.log(id);
      const response = await axios.post(
        `${TRANSACTIONS_API_URL}/add`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const addedTransaction = response.data;

      setTransactions((prev) => [addedTransaction, ...prev]);
      return response.data.id;
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<void> => {
    try {
      const token = await SecureStore.getItem("auth_token");
      const response = await axios.put(
        `${TRANSACTIONS_API_URL}/edit/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedTransaction = response.data;

      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? updatedTransaction : tx))
      );
    } catch (e) {
      handleApiError(e);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      const token = await SecureStore.getItem("auth_token");
      await axios.delete(`${TRANSACTIONS_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (e) {
      handleApiError(e);
    }
  };

  const uploadBankStatement = async (formData: FormData): Promise<any> => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const response = await axios.post(`${UPLOAD_API_URL}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload response:", response.data);
      await fetchTransactions();
    } catch (e) {
      handleApiError(e);
      return null;
    }
  };

  const refreshTransactions = async () => {
    setCurrentPage(1);
    await fetchTransactions(1, currentFilter);
  };

  const loadMore = async (transactionClass?: string) => {
    if (hasMore && !isLoadingMore) {
      const filterToUse = transactionClass || currentFilter;
      await fetchTransactions(currentPage + 1, filterToUse);
    }
  };

  const contextValue = useMemo(
    () => ({
      transactions,
      isLoading,
      isLoadingMore,
      error,
      currentPage,
      totalPages,
      hasMore,
      loadMore,
      refreshTransactions,
      addTransaction,
      fetchTransactions,
      deleteTransaction,
      updateTransaction,
      uploadBankStatement,
      transactionsCleanup,
    }),
    [
      transactions,
      isLoading,
      isLoadingMore,
      error,
      currentPage,
      totalPages,
      hasMore,
      currentFilter,
    ]
  );

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
};
