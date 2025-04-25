import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";
import { colors } from "../constants/colors";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Sidebar />
        <View style={{ flex: 1 }}>
          <Header />
          <View style={{ flex: 1, padding: 20 }}>{/* Main content */}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}
