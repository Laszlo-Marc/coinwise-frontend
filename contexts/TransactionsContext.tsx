import TransactionModel from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useState } from "react";
interface TransactionContextType {
  transactions: any[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: TransactionModel) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  uploadBankStatement: (file: FormData) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: object) => Promise<any>;
  getTransactionsByCategory: () => Record<
    string,
    { totalAmount: number; count: number; transactions: any[] }
  >;
}
interface UploadResponse {
  message: string;
  transactions: TransactionModel[];
  entity_map_id: string;
  processing_time: string;
  money_in: number;
  money_out: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

interface TransactionProviderProps {
  children: ReactNode;
}

const TRANSACTIONS_API_URL = "http://192.168.1.156:5000/api/transactions";
const UPLOADS_API_URL = "http://192.168.1.156:5000/api/upload/";

const transaction_api = axios.create({
  baseURL: TRANSACTIONS_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    entityMapId: string;
    processingTime: string;
    moneyIn: number;
    moneyOut: number;
  } | null>(null);

  // Helper function to handle API errors
  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    setError(errorMessage);
    return errorMessage;
  };

  // Save transactions to AsyncStorage
  const saveTransactionsToStorage = async (
    updatedTransactions: TransactionModel[]
  ) => {
    try {
      await AsyncStorage.setItem(
        "transactions",
        JSON.stringify(updatedTransactions)
      );
    } catch (e) {
      console.error("Error saving transactions to storage:", e);
    }
  };

  // Fetch transactions from API or AsyncStorage
  const fetchTransactions = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      try {
        const response = await transaction_api.get("/");
        setTransactions(response.data);
        await saveTransactionsToStorage(response.data);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.log("API fetch failed, falling back to local storage");
      }

      // Fall back to AsyncStorage if API fails
      const storedTransactions = await AsyncStorage.getItem("transactions");
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new transaction
  const addTransaction = async (
    transaction: TransactionModel
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const newTransaction = {
        ...transaction,
      };

      // Try to add to API
      try {
        const response = await transaction_api.post("/add", newTransaction);
        const addedTransaction = response.data;
        const updatedTransactions = [...transactions, addedTransaction];
        setTransactions(updatedTransactions);
        await saveTransactionsToStorage(updatedTransactions);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.log("API add failed, saving locally only");
      }

      // Fall back to local only if API fails
      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      await saveTransactionsToStorage(updatedTransactions);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing transaction
  const updateTransaction = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find the transaction to update
      const transactionIndex = transactions.findIndex((t) => t.id === id);
      if (transactionIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedTransaction = {
        ...transactions[transactionIndex],
        ...updates,
      };

      // Try to update in API
      try {
        const response = await transaction_api.put(
          `/edit/${id}`,
          updatedTransaction
        );
        const apiUpdatedTransaction = response.data;
        const updatedTransactions = [...transactions];
        updatedTransactions[transactionIndex] = apiUpdatedTransaction;
        setTransactions(updatedTransactions);
        await saveTransactionsToStorage(updatedTransactions);
        setIsLoading(false);
        return apiUpdatedTransaction;
      } catch (apiError) {
        console.log("API update failed, updating locally only");
      }

      // Fall back to local only if API fails
      const updatedTransactions = [...transactions];
      updatedTransactions[transactionIndex] = updatedTransaction;
      setTransactions(updatedTransactions);
      await saveTransactionsToStorage(updatedTransactions);
      return updatedTransaction;
    } catch (e) {
      const errorMsg = handleApiError(e);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to delete from API
      try {
        await transaction_api.delete(`/delete/${id}`);
      } catch (apiError) {
        console.log("API delete failed, deleting locally only");
      }

      // Always delete locally
      const updatedTransactions = transactions.filter((t) => t.id !== id);
      setTransactions(updatedTransactions);
      await saveTransactionsToStorage(updatedTransactions);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload bank statement
  const uploadBankStatement = async (
    file: FormData
  ): Promise<UploadResponse | { error: string }> => {
    setIsLoading(true);
    setError(null);
    setUploadStats(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        throw new Error("User is not authenticated.");
      }

      // Send request with Authorization header
      const response = await axios.post(`${UPLOADS_API_URL}`, file, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const result = response.data;

      // Store statistics from the upload
      setUploadStats({
        entityMapId: result.entity_map_id,
        processingTime: result.processing_time,
        moneyIn: result.money_in,
        moneyOut: result.money_out,
      });

      // Refresh transactions after upload
      await fetchTransactions();

      return result;
    } catch (e) {
      const errorMsg = handleApiError(e);
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };
  const getTransactionsByCategory = () => {
    const categoryMap: Record<
      string,
      { totalAmount: number; count: number; transactions: any[] }
    > = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          totalAmount: 0,
          count: 0,
          transactions: [],
        };
      }

      categoryMap[category].totalAmount += Number(transaction.amount);
      categoryMap[category].count += 1;
      categoryMap[category].transactions.push(transaction);
    });

    return categoryMap;
  };

  const contextValue: TransactionContextType = {
    transactions,
    isLoading,
    error,
    addTransaction,
    fetchTransactions,
    uploadBankStatement,
    deleteTransaction,
    updateTransaction,
    getTransactionsByCategory,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook for using the transaction context
export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);

  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }

  return context;
};
