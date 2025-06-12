import TransactionQuickActionsCard from "@/components/financesComponents/TransactionDetailsActions";
import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { TransactionModel } from "@/models/transaction";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions, deleteTransaction } = useTransactionContext();
  const [transaction, setTransaction] = useState<TransactionModel | null>(null);
  const [loading, setLoading] = useState(true);
  const isExpense = transaction?.type === "expense";
  const isTransfer = transaction?.type === "transfer";

  useEffect(() => {
    const found = transactions.find((t) => t.id === id);
    setTransaction(found || null);
    setLoading(false);
  }, [id, transactions]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }
  const handleEdit = () => {
    router.push(`./edit-transaction/${id}`);
  };

  const handleDelete = () => {
    if (transaction) {
      deleteTransaction(id as string);
      router.back();
    }
  };
  if (!transaction) {
    return <Text style={styles.notFound}>Transaction not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["rgb(198, 119, 0)", "rgb(251, 193, 105)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction</Text>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Feather name="user" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{transaction.description}</Text>

          <Text style={styles.label}>Amount</Text>
          <Text
            style={[
              styles.value,
              { color: isExpense ? colors.error : colors.success },
            ]}
          >
            {isExpense ? "-" : "+"}
            {transaction.amount.toFixed(2)} RON
          </Text>

          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {new Date(transaction.date).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>

          {isExpense && (
            <>
              <Text style={styles.label}>Category</Text>
              <Text
                style={[
                  styles.value,
                  { opacity: transaction.category ? 1 : 0.5 },
                ]}
              >
                {transaction.category || "Uncategorized"}
              </Text>
              <Text style={styles.label}>Merchant</Text>
              <Text style={styles.value}>{transaction.merchant || "N/A"}</Text>
            </>
          )}

          {isTransfer && (
            <>
              <Text style={styles.label}>Sender</Text>
              <Text style={styles.value}>{transaction.sender}</Text>
              <Text style={styles.label}>Receiver</Text>
              <Text style={styles.value}>{transaction.receiver}</Text>
            </>
          )}
        </Animated.View>
        <View style={styles.quickActionsContainer}>
          <TransactionQuickActionsCard
            onEdit={handleEdit}
            onDelete={handleDelete}
            transactionDescription={transaction.description}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickActionsContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notFound: {
    padding: 20,
    color: "red",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 16,
    fontFamily: "Montserrat",
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
    fontFamily: "Montserrat",
  },
});
