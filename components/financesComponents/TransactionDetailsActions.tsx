// TransactionQuickActionsCard.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface QuickActionsCardProps {
  onEdit: () => void;
  onDelete: () => void;
  transactionDescription?: string;
}

export default function TransactionQuickActionsCard({
  onEdit,
  onDelete,
  transactionDescription = "transaction",
}: QuickActionsCardProps) {
  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${transactionDescription}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete();
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <BlurView intensity={15} tint="dark" style={styles.card}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Quick Actions</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.edit]}
              onPress={onEdit}
            >
              <Feather name="edit-2" size={18} color={colors.primary[500]} />
              <Text style={[styles.buttonText, { color: colors.primary[500] }]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.delete]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={18} color={colors.error} />
              <Text style={[styles.buttonText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginHorizontal: 10,
  },
  innerContainer: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
  },
  title: {
    fontFamily: "Montserrat",
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  edit: {
    borderColor: "rgba(198, 119, 0, 0.4)",
  },
  delete: {
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
});
