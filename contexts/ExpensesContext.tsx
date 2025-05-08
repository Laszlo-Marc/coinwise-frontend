import { TransactionModel } from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
interface TransactionContextType {
  transactions: any[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (
    transaction: TransactionModel,
    transactionClass: string
  ) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  uploadBankStatement: (file: FormData) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: object) => Promise<any>;
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

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    setError(errorMessage);
    return errorMessage;
  };

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

  const fetchTransactions = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      try {
        const response = await transaction_api.get("/");
        setTransactions(response.data);
        await saveTransactionsToStorage(response.data);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.log("API fetch failed, falling back to local storage");
      }
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

  const addTransaction = async (
    transaction: TransactionModel,
    transactionClass: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const { id, ...transactionData } = transaction;

      try {
        const response = await axios.post(
          `${TRANSACTIONS_API_URL}/add`,
          {
            ...transactionData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: {
              transaction_type: transactionClass,
            },
          }
        );

        const addedTransaction = response.data;
        const updatedTransactions = [...transactions, addedTransaction];
        setTransactions(updatedTransactions);
        await saveTransactionsToStorage(updatedTransactions);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.error("API add failed:", apiError);
        console.log("Saving locally only");

        const localTransaction = {
          ...transaction,
          id: id || Date.now().toString(),
        };

        const updatedTransactions = [...transactions, localTransaction];
        setTransactions(updatedTransactions);
        await saveTransactionsToStorage(updatedTransactions);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const transactionIndex = transactions.findIndex((t) => t.id === id);
      if (transactionIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedTransaction = {
        ...transactions[transactionIndex],
        ...updates,
      };

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

      const updatedTransactions = [...transactions];
      updatedTransactions[transactionIndex] =
        updatedTransaction as TransactionModel;
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

  const deleteTransaction = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      try {
        await transaction_api.delete(`/delete/${id}`);
      } catch (apiError) {
        console.log("API delete failed, deleting locally only");
      }

      const updatedTransactions = transactions.filter((t) => t.id !== id);
      setTransactions(updatedTransactions);
      await saveTransactionsToStorage(updatedTransactions);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

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

      const response = await axios.post(`${UPLOADS_API_URL}`, file, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const result = response.data;

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

  const contextValue = useMemo(
    () => ({
      transactions,
      isLoading,
      error,
      addTransaction,
      fetchTransactions,
      uploadBankStatement,
      deleteTransaction,
      updateTransaction,
    }),
    [
      transactions,
      isLoading,
      error,
      addTransaction,
      fetchTransactions,
      uploadBankStatement,
      deleteTransaction,
      updateTransaction,
    ]
  );

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
