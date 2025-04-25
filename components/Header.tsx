import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary[800],
      }}
    >
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "bold" }}>
        Dashboard
      </Text>
      <TouchableOpacity
        onPress={signOut}
        style={{
          backgroundColor: colors.primary[600],
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.text }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
