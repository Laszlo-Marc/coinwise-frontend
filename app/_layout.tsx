import { TransactionProvider } from "@/contexts/TransactionsContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserat.ttf"),
  });
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return null; // Stay stuck on splash
  }

  return (
    <TransactionProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transactions"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="financial-goals" options={{ headerShown: false }} />
        <Stack.Screen name="budgets" options={{ headerShown: false }} />
        <Stack.Screen name="finances" options={{ headerShown: false }} />
        <Stack.Screen name="stats" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="add-goal" options={{ headerShown: false }} />
        <Stack.Screen
          name="goal-details/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="edit-goal/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="goal-details/add-contribution/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
    </TransactionProvider>
  );
}
