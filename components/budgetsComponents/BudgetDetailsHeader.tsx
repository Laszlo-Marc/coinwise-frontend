import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BudgetDetailsHeaderProps {
  budget: BudgetModel;
}

const BudgetDetailsHeader: React.FC<BudgetDetailsHeaderProps> = ({
  budget,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.primary[300], colors.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {budget.title}
          </Text>
        </View>

        <View style={styles.budgetIconHeader}>
          <MaterialIcons
            name="account-balance-wallet"
            size={24}
            color="white"
          />
        </View>
      </View>
      {budget.description && (
        <Text style={styles.budgetDescription}>{budget.description}</Text>
      )}
      <View style={styles.budgetInfo}>
        <View style={styles.budgetDetails}>
          <Text style={styles.budgetSubtitle}>
            {budget.category} • {budget.is_recurring ? "Recurring" : "One-time"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Montserrat",
  },
  budgetIconHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  budgetInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  budgetDetails: {
    alignItems: "center",
  },
  budgetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  budgetSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  budgetDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    textAlign: "center",
  },
});

export default BudgetDetailsHeader;
