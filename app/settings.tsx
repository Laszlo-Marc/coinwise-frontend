import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function DefaultPage() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View>
        <Text>Default Page</Text>
      </View>
    </SafeAreaView>
  );
}
