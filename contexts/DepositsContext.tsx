import { TransactionModel } from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface DepositContextType {
  deposits: TransactionModel[];
  isLoading: boolean;
  error: string | null;
  addDeposit: (
    transaction: TransactionModel,
    transactionClass: string
  ) => Promise<void>;
  fetchDeposits: () => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
  updateDeposit: (
    id: string,
    updates: Partial<TransactionModel>
  ) => Promise<TransactionModel>;
}

const DepositContext = createContext<DepositContextType | undefined>(undefined);

interface DepositProviderProps {
  children: ReactNode;
}

const DEPOSITS_API_URL = "http://192.168.1.156:5000/api/deposits";

export const DepositProvider: React.FC<DepositProviderProps> = ({
  children,
}) => {
  const [deposits, setDeposits] = useState<TransactionModel[]>([]);
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

  const saveDepositsToStorage = async (data: TransactionModel[]) => {
    try {
      await AsyncStorage.setItem("deposits", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save deposits:", e);
    }
  };

  const fetchDeposits = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const response = await axios.get(`${DEPOSITS_API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setDeposits(response.data);
      await saveDepositsToStorage(response.data);
    } catch (e) {
      console.warn("API fetch failed, using local storage");
      try {
        const stored = await AsyncStorage.getItem("deposits");
        if (stored) {
          setDeposits(JSON.parse(stored));
        }
      } catch (storageError) {
        handleApiError(storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addDeposit = async (
    transaction: TransactionModel,
    transactionClass: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const { id, ...data } = transaction;

      const response = await axios.post(`${DEPOSITS_API_URL}/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          transaction_type: transactionClass,
        },
      });

      const newDeposit = response.data;
      const updated = [...deposits, newDeposit];
      setDeposits(updated);
      await saveDepositsToStorage(updated);
    } catch (apiError) {
      console.warn("API add failed, saving locally only");

      const localTransaction: TransactionModel = {
        ...transaction,
        id: transaction.id || Date.now().toString(),
      };

      const updated = [...deposits, localTransaction];
      setDeposits(updated);
      await saveDepositsToStorage(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeposit = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const depositsIndex = deposits.findIndex((t) => t.id === id);
      if (depositsIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedDeposit = {
        ...deposits[depositsIndex],
        ...updates,
      };

      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) throw new Error("User is not authenticated.");

        const response = await axios.post(
          `${DEPOSITS_API_URL}/edit`,
          updatedDeposit,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const apiupdatedDeposit = response.data;
        const updateddeposits = [...deposits];
        updateddeposits[depositsIndex] = apiupdatedDeposit;
        setDeposits(updateddeposits);
        await saveDepositsToStorage(updateddeposits);
        setIsLoading(false);
        return apiupdatedDeposit;
      } catch (apiError) {
        console.log("API update failed, updating locally only");
      }

      const updateddeposits = [...deposits];
      updateddeposits[depositsIndex] = updatedDeposit as TransactionModel;
      setDeposits(updateddeposits);
      await saveDepositsToStorage(updateddeposits);
      return updatedDeposit;
    } catch (e) {
      const errorMsg = handleApiError(e);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeposit = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      await axios.delete(`${DEPOSITS_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.warn("API delete failed, removing locally only");
    }

    const updated = deposits.filter((d) => d.id !== id);
    setDeposits(updated);
    await saveDepositsToStorage(updated);
    setIsLoading(false);
  };

  const contextValue = useMemo(
    () => ({
      deposits,
      isLoading,
      error,
      addDeposit,
      fetchDeposits,
      updateDeposit,
      deleteDeposit,
    }),
    [
      deposits,
      isLoading,
      error,
      addDeposit,
      fetchDeposits,
      updateDeposit,
      deleteDeposit,
    ]
  );

  return (
    <DepositContext.Provider value={contextValue}>
      {children}
    </DepositContext.Provider>
  );
};

export const useDeposits = (): DepositContextType => {
  const context = useContext(DepositContext);
  if (!context) {
    throw new Error("useDeposits must be used within a DepositProvider");
  }
  return context;
};
