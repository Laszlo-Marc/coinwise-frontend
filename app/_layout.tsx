import { AuthProvider } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserat.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash when fonts are ready
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    SplashScreen.preventAutoHideAsync(); // Keep splash visible
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
