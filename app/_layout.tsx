import { AuthProvider } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionsContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserat.ttf"),
  });

  // Prevent rendering until fonts are loaded
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TransactionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TransactionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
