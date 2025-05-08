import { TransactionModel } from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface IncomeContextType {
  incomes: TransactionModel[];
  isLoading: boolean;
  error: string | null;
  addIncome: (
    transaction: TransactionModel,
    transactionClass: string
  ) => Promise<void>;
  fetchIncomes: () => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  updateIncome: (
    id: string,
    updates: Partial<TransactionModel>
  ) => Promise<TransactionModel>;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

interface IncomeProviderProps {
  children: ReactNode;
}

const INCOMES_API_URL = "http://192.168.1.156:5000/api/incomes";

export const IncomeProvider: React.FC<IncomeProviderProps> = ({ children }) => {
  const [incomes, setIncomes] = useState<TransactionModel[]>([]);
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

  const saveIncomesToStorage = async (data: TransactionModel[]) => {
    try {
      await AsyncStorage.setItem("incomes", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save incomes:", e);
    }
  };

  const fetchIncomes = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const response = await axios.get(`${INCOMES_API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setIncomes(response.data);
      await saveIncomesToStorage(response.data);
    } catch (e) {
      console.warn("API fetch failed, using local storage");
      try {
        const stored = await AsyncStorage.getItem("incomes");
        if (stored) {
          setIncomes(JSON.parse(stored));
        }
      } catch (storageError) {
        handleApiError(storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addIncome = async (
    transaction: TransactionModel,
    transactionClass: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      const { id, ...data } = transaction;

      const response = await axios.post(`${INCOMES_API_URL}/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          transaction_type: transactionClass,
        },
      });

      const newIncome = response.data;
      const updated = [...incomes, newIncome];
      setIncomes(updated);
      await saveIncomesToStorage(updated);
    } catch (apiError) {
      console.warn("API add failed, saving locally only");

      const localTransaction: TransactionModel = {
        ...transaction,
        id: transaction.id || Date.now().toString(),
      };

      const updated = [...incomes, localTransaction];
      setIncomes(updated);
      await saveIncomesToStorage(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIncome = async (
    id: string,
    updates: Partial<TransactionModel>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const incomesIndex = incomes.findIndex((t) => t.id === id);
      if (incomesIndex === -1) {
        throw new Error("Transaction not found");
      }

      const updatedIncome = {
        ...incomes[incomesIndex],
        ...updates,
      };

      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) throw new Error("User is not authenticated.");

        const response = await axios.post(
          `${INCOMES_API_URL}/edit`,
          updatedIncome,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const apiupdatedIncome = response.data;
        const updatedincomes = [...incomes];
        updatedincomes[incomesIndex] = apiupdatedIncome;
        setIncomes(updatedincomes);
        await saveIncomesToStorage(updatedincomes);
        setIsLoading(false);
        return apiupdatedIncome;
      } catch (apiError) {
        console.log("API update failed, updating locally only");
      }

      const updatedincomes = [...incomes];
      updatedincomes[incomesIndex] = updatedIncome as TransactionModel;
      setIncomes(updatedincomes);
      await saveIncomesToStorage(updatedincomes);
      return updatedIncome;
    } catch (e) {
      const errorMsg = handleApiError(e);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIncome = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("User is not authenticated.");

      await axios.delete(`${INCOMES_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.warn("API delete failed, removing locally only");
    }

    const updated = incomes.filter((d) => d.id !== id);
    setIncomes(updated);
    await saveIncomesToStorage(updated);
    setIsLoading(false);
  };

  const contextValue = useMemo(
    () => ({
      incomes,
      isLoading,
      error,
      addIncome,
      fetchIncomes,
      updateIncome,
      deleteIncome,
    }),
    [
      incomes,
      isLoading,
      error,
      addIncome,
      fetchIncomes,
      updateIncome,
      deleteIncome,
    ]
  );

  return (
    <IncomeContext.Provider value={contextValue}>
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncomes = (): IncomeContextType => {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error("useIncomes must be used within an IncomeProvider");
  }
  return context;
};
