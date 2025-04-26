import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ImageBackground, StyleSheet } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/sign-in");
      } else {
        router.replace("/home");
      }
    };

    setTimeout(() => {
      checkSession();
    }, 1500); // 1.5 seconds
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/logo3.png")}
      style={styles.container}
      resizeMode="contain"
    ></ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
});
