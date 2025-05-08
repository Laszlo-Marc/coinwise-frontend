import { TransactionModel } from "@/models/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// API URLs
const API_URL = "http://192.168.1.156:5000/api";
const AUTH_URL = `${API_URL}/auth`;
const TRANSACTIONS_URL = `${API_URL}/transactions`;
const UPLOADS_URL = `${API_URL}/upload`;

// Types
type User = {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at?: string;
};

type AuthState = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
};

type TransactionState = {
  transactions: TransactionModel[];
  isLoading: boolean;
  error: string | null;
  uploadStats: {
    entityMapId: string;
    processingTime: string;
    moneyIn: number;
    moneyOut: number;
  } | null;
};

type AppContextType = {
  // Auth
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    full_name?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserExists: (email: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;

  // Transactions
  transactions: TransactionModel[];
  addTransaction: (
    transaction: TransactionModel,
    transactionClass: string
  ) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  uploadBankStatement: (file: FormData) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: object) => Promise<any>;
};

// Storage keys
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";
const TRANSACTIONS_KEY = "transactions";

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create axios instances
const authAxios = axios.create({
  baseURL: AUTH_URL,
});

const transactionAxios = axios.create({
  baseURL: TRANSACTIONS_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Auth state
  const [auth, setAuth] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    error: null,
  });

  // Transaction state
  const [transactionState, setTransactionState] = useState<TransactionState>({
    transactions: [],
    isLoading: false,
    error: null,
    uploadStats: null,
  });

  // Initialize auth state
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [userToken, userData, refreshToken] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        ]);

        if (userToken && userData) {
          authAxios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${userToken}`;
          transactionAxios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${userToken}`;

          setAuth({
            ...auth,
            userToken,
            user: JSON.parse(userData),
            isLoading: false,
          });
        } else {
          setAuth({
            ...auth,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to load authentication data", error);
        setAuth({
          ...auth,
          isLoading: false,
        });
      }
    };

    loadStoredData();
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAxios.post("/signin", { email, password });
      const { access_token, refresh_token, user } = response.data;

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);

      authAxios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;
      transactionAxios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      setAuth({
        ...auth,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to sign in. Please check your credentials and try again.";
      setAuth({ ...auth, error: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    full_name?: string
  ) => {
    try {
      const response = await authAxios.post("/signup", {
        email,
        password,
        full_name,
      });
      const { access_token, refresh_token, user } = response.data;

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);

      authAxios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;
      transactionAxios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      setAuth({
        ...auth,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to create account. Please try again.";
      setAuth({ ...auth, error: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      if (auth.userToken) {
        try {
          await authAxios.post("/signout");
        } catch (error) {
          console.warn("Error during API signout:", error);
        }
      }

      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);

      delete authAxios.defaults.headers.common["Authorization"];
      delete transactionAxios.defaults.headers.common["Authorization"];

      setAuth({
        ...auth,
        userToken: null,
        user: null,
        isSignout: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Transaction methods
  const fetchTransactions = async (): Promise<void> => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await transactionAxios.get("/");
      const transactions = response.data;
      setTransactionState((prev) => ({
        ...prev,
        transactions,
        isLoading: false,
      }));
      await AsyncStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(transactions)
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch transactions";
      setTransactionState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const addTransaction = async (
    transaction: TransactionModel,
    transactionClass: string
  ): Promise<void> => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { id, ...transactionData } = transaction;
      const response = await transactionAxios.post("/add", transactionData, {
        params: { transaction_type: transactionClass },
      });

      const addedTransaction = response.data;
      setTransactionState((prev) => ({
        ...prev,
        transactions: [...prev.transactions, addedTransaction],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to add transaction";
      setTransactionState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const updateTransaction = async (
    id: string,
    updates: object
  ): Promise<any> => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await transactionAxios.put(`/edit/${id}`, updates);
      const updatedTransaction = response.data;

      setTransactionState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.id === id ? updatedTransaction : t
        ),
        isLoading: false,
      }));

      return updatedTransaction;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update transaction";
      setTransactionState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await transactionAxios.delete(`/delete/${id}`);
      setTransactionState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete transaction";
      setTransactionState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const uploadBankStatement = async (file: FormData): Promise<any> => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axios.post(UPLOADS_URL, file, {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setTransactionState((prev) => ({
        ...prev,
        uploadStats: {
          entityMapId: response.data.entity_map_id,
          processingTime: response.data.processing_time,
          moneyIn: response.data.money_in,
          moneyOut: response.data.money_out,
        },
        isLoading: false,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to upload bank statement";
      setTransactionState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  };

  const value = useMemo(
    () => ({
      // Auth
      auth,
      signIn,
      signUp,
      signOut,
      checkUserExists: async (email: string) => {
        try {
          await authAxios.post("/check-email", { email });
          return true;
        } catch {
          return false;
        }
      },
      refreshToken: async () => {
        try {
          const refresh_token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          if (!refresh_token) return false;

          const response = await authAxios.post("/refresh", { refresh_token });
          const { access_token } = response.data;

          await AsyncStorage.setItem(TOKEN_KEY, access_token);
          authAxios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;
          transactionAxios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;

          setAuth((prev) => ({ ...prev, userToken: access_token }));
          return true;
        } catch {
          return false;
        }
      },
      updateProfile: async (profileData: Partial<User>) => {
        const response = await authAxios.put("/profile", profileData);
        const updatedUser = response.data;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setAuth((prev) => ({ ...prev, user: updatedUser }));
        return updatedUser;
      },
      resetPassword: async (email: string) => {
        await authAxios.post("/reset-password", { email });
      },
      updatePassword: async (currentPassword: string, newPassword: string) => {
        await authAxios.put("/password", { currentPassword, newPassword });
      },
      clearError: () => setAuth((prev) => ({ ...prev, error: null })),

      // Transactions
      transactions: transactionState.transactions,
      addTransaction,
      fetchTransactions,
      uploadBankStatement,
      deleteTransaction,
      updateTransaction,
    }),
    [auth, transactionState]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
