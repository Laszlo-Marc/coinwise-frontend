import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import LockScreen from "./LockScreen";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const router = useRouter();

  console.log("AuthGate state", state);

  // 🚫 Handle loading
  if (state.isLoading) return <ActivityIndicator />;

  // ✅ Use effect to redirect instead of inline
  useEffect(() => {
    if (!state.userToken || !state.user) {
      router.replace("/auth/sign-in");
    }
  }, [state.userToken, state.user]);

  // 🧱 Show lock screen after auth is confirmed
  if (!state.userToken || !state.user) {
    return null; // Wait for useEffect redirect
  }

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <>{children}</>;
}
