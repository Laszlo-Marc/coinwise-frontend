import { AppProvider } from "@/contexts/AppContext";
import { TransactionProvider } from "@/contexts/ExpensesContext";
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
      <TransactionProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              freezeOnBlur: true,
              animation: "fade",
              gestureEnabled: true,
              animationDuration: 300,
            }}
          />
        </AppProvider>
      </TransactionProvider>
    </GestureHandlerRootView>
  );
}
