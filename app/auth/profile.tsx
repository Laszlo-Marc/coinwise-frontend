import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("./sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <View style={styles.container}>
      <Text>Profile</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
