import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

const DefaultPage: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Default Page</Text>
        <Text style={styles.description}>
          This is a default React Native page.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    backgroundColor: colors.primary[600],
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default DefaultPage;
