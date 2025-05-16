import { TransactionProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";

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
          <Stack
            screenOptions={{
              headerShown: false,
              freezeOnBlur: true,
              animation: "fade",
              gestureEnabled: true,
              animationDuration: 300,
            }}
          />
        </TransactionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
