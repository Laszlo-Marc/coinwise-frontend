import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define your API base URL
const API_URL = "http://192.168.1.156:5000/api/auth"; // Change this to your actual API URL

// Define types for authentication data
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

type AuthContextType = {
  state: AuthState;
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
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    error: null,
  });

  // Create an axios instance with authorization header
  const authAxios = axios.create({
    baseURL: API_URL,
  });

  // Add interceptor to automatically add the token to requests
  authAxios.interceptors.request.use(
    (config) => {
      if (state.userToken) {
        config.headers.Authorization = `Bearer ${state.userToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add interceptor to handle token expiration
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // If the error is due to an expired token and we haven't tried to refresh it yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${state.userToken}`;
            return authAxios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, sign out
          await signOut();
        }
      }
      return Promise.reject(error);
    }
  );

  // Initialize - check if the user is already logged in
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [userToken, userData, refreshToken] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        ]);

        if (userToken && userData) {
          // Set up axios headers for future requests
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${userToken}`;

          setState({
            ...state,
            userToken,
            user: JSON.parse(userData),
            isLoading: false,
          });
        } else {
          setState({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to load authentication data", error);
        setState({
          ...state,
          isLoading: false,
        });
      }
    };

    loadStoredData();
  }, []);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;

      // Store authentication data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);

      // Set up axios headers for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setState({
        ...state,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      });
    } catch (error: any) {
      console.error("Sign in error", error);

      const errorMessage =
        error.response?.data?.detail ||
        "Failed to sign in. Please check your credentials and try again.";

      setState({
        ...state,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    full_name?: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        full_name,
      });

      const { access_token, refresh_token, user } = response.data;

      // Store authentication data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);

      // Set up axios headers for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setState({
        ...state,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      });
    } catch (error: any) {
      console.error("Sign up error", error);

      const errorMessage =
        error.response?.data?.detail ||
        "Failed to create account. Please try again.";

      setState({
        ...state,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      // Call the signout API if user is authenticated
      if (state.userToken) {
        try {
          await authAxios.post(`${API_URL}/signout`);
          console.log("User signed out from API");
        } catch (error) {
          console.warn("Error during API signout:", error);
          // Continue with local signout even if API call fails
        }
      }
      await authAxios.post(`${API_URL}/signout`);
      console.log("User signed out from API");
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);

      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];

      setState({
        ...state,
        userToken: null,
        user: null,
        isSignout: true,
        error: null,
      });
    } catch (error) {
      console.error("Sign out error", error);
      setState({
        ...state,
        error: "Failed to sign out properly",
      });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post(`${API_URL}/refresh-token`, {
        refresh_token: storedRefreshToken,
      });

      const { access_token, refresh_token, user } = response.data;

      // Update stored tokens
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);

      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setState({
        ...state,
        userToken: access_token,
        user,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Token refresh error", error);
      return false;
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/user-exists`, {
        email,
      });

      return response.data.exists;
    } catch (error) {
      console.error("Check user exists error", error);
      throw new Error("Failed to check if user exists");
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await authAxios.put(`${API_URL}/profile`, profileData);

      const updatedUser = response.data;

      // Update stored user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      setState({
        ...state,
        user: updatedUser,
      });

      return updatedUser;
    } catch (error) {
      console.error("Update profile error", error);
      throw new Error("Failed to update profile");
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/password-reset`, {
        email,
      });
    } catch (error) {
      console.error("Reset password error", error);
      throw new Error("Failed to send password reset email");
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await authAxios.post(`${API_URL}/password-update`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error("Update password error", error);
      throw new Error("Failed to update password");
    }
  };

  const clearError = () => {
    setState({
      ...state,
      error: null,
    });
  };

  const authContext: AuthContextType = {
    state,
    signIn,
    signUp,
    signOut,
    checkUserExists,
    refreshToken,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
