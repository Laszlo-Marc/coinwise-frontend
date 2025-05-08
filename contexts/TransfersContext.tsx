import { TransactionModel } from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface TransferContextType {
  transfers: TransactionModel[];
  isLoading: boolean;
  error: string | null;
  addTransfer: (
    transaction: TransactionModel,
    transactionClass: string
  ) => Promise<void>;
  fetchTransfers: () => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  updateTransfer: (
    id: string,
    updates: Partial<TransactionModel>
  ) => Promise<TransactionModel>;
}

const TransferContext = createContext<TransferContextType | undefined>(
  undefined
);

interface TransferProviderProps {
  children: ReactNode;
}

const TRANSFERS_API_URL = "http://192.168.1.156:5000/api/transfers";

export const TransferProvider: React.FC<TransferProviderProps> = ({
  children,
}) => {
  const [transfers, setTransfers] = useState<TransactionModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    setError(message);
    return message;
  };

  const saveTransfersToStorage = async (data: TransactionModel[]) => {
    try {
      await AsyncStorage.setItem("transfers", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save transfers:", e);
    }
  };

  const fetchTransfers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const response = await axios.get(`${TRANSFERS_API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setTransfers(response.data);
      await saveTransfersToStorage(response.data);
    } catch (e) {
      console.warn("API fetch failed, using local storage");
      try {
        const stored = await AsyncStorage.getItem("transfers");
        if (stored) {
          setTransfers(JSON.parse(stored));
        }
      } catch (storageError) {
        handleApiError(storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTransfer = async (
    transaction: TransactionModel,
    transactionClass: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const { id, ...data } = transaction;

      const response = await axios.post(`${TRANSFERS_API_URL}/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          transaction_type: transactionClass,
        },
      });

      const newTransfer = response.data;
      const updated = [...transfers, newTransfer];
      setTransfers(updated);
      await saveTransfersToStorage(updated);
    } catch (apiError) {
      console.warn("API add failed, saving locally only");

      const localTransaction: TransactionModel = {
        ...transaction,
        id: transaction.id || Date.now().toString(),
      };

      const updated = [...transfers, localTransaction];
      setTransfers(updated);
      await saveTransfersToStorage(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransfer = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const transfersIndex = transfers.findIndex((t) => t.id === id);
      if (transfersIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedTransfer = {
        ...transfers[transfersIndex],
        ...updates,
      };

      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) throw new Error("User is not authenticated.");

        const response = await axios.post(
          `${TRANSFERS_API_URL}/edit`,
          updatedTransfer,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const apiUpdated = response.data;
        const updatedList = [...transfers];
        updatedList[transfersIndex] = apiUpdated;
        setTransfers(updatedList);
        await saveTransfersToStorage(updatedList);
        setIsLoading(false);
        return apiUpdated;
      } catch (apiError) {
        console.log("API update failed, updating locally only");
      }

      const updatedList = [...transfers];
      updatedList[transfersIndex] = updatedTransfer as TransactionModel;
      setTransfers(updatedList);
      await saveTransfersToStorage(updatedList);
      return updatedTransfer;
    } catch (e) {
      const errorMsg = handleApiError(e);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransfer = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      await axios.delete(`${TRANSFERS_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.warn("API delete failed, removing locally only");
    }

    const updated = transfers.filter((t) => t.id !== id);
    setTransfers(updated);
    await saveTransfersToStorage(updated);
    setIsLoading(false);
  };

  const contextValue = useMemo(
    () => ({
      transfers,
      isLoading,
      error,
      addTransfer,
      fetchTransfers,
      updateTransfer,
      deleteTransfer,
    }),
    [
      transfers,
      isLoading,
      error,
      addTransfer,
      fetchTransfers,
      updateTransfer,
      deleteTransfer,
    ]
  );

  return (
    <TransferContext.Provider value={contextValue}>
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfers = (): TransferContextType => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfers must be used within a TransferProvider");
  }
  return context;
};
