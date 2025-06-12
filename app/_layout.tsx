import { TransactionProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BudgetsProvider } from "@/contexts/BudgetsContext";
import { GoalsProvider } from "@/contexts/GoalsContext";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserat.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TransactionProvider>
          <GoalsProvider>
            <BudgetsProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  freezeOnBlur: true,
                  animation: "fade",
                  gestureEnabled: true,
                  animationDuration: 300,
                }}
              />
            </BudgetsProvider>
          </GoalsProvider>
        </TransactionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
