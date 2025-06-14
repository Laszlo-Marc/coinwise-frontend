import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated, { FadeIn } from "react-native-reanimated";

interface Props {
  transaction: TransactionModel;
  currentUser: string;
  onEdit?: (id: string, type: TransactionType) => void;
  onDelete?: (id: string, type: TransactionType) => void;
}

const TransactionItem: React.FC<Props> = ({
  transaction,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const {
    id,
    description,
    amount,
    date,
    type,
    category,
    sender,
    receiver,
    currency,
  } = transaction;

  const isTransferReceiver = type === "transfer" && receiver === currentUser;
  const isTransferSender = type === "transfer" && sender === currentUser;

  const formattedAmount = (() => {
    const prefix =
      type === "expense" || isTransferSender
        ? "-"
        : type === "income" || type === "deposit" || isTransferReceiver
        ? "+"
        : "";
    const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "RON";
    return `${prefix}${amount.toFixed(2)} ${symbol}`;
  })();

  const amountColor = (() => {
    if (isTransferReceiver) return "#4CAF50";
    if (isTransferSender) return "#F44336";
    return type === "income" || type === "deposit" ? "#4CAF50" : "#F44336";
  })();

  const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getIcon = () => {
    if (type === "expense") {
      switch (category?.toLowerCase()) {
        case "food":
          return "coffee";
        case "groceries":
          return "shopping-cart";
        case "transportation":
          return "truck";
        case "entertainment":
          return "tv";
        case "bills":
          return "file-text";
        case "health":
          return "heart";
        case "travel":
          return "map";
        default:
          return "credit-card";
      }
    } else if (type === "income") {
      return "arrow-up";
    } else if (type === "transfer") {
      return "refresh-cw";
    } else {
      return "dollar-sign";
    }
  };
  const renderLeftActions = useCallback(
    () => (
      <View style={styles.hiddenContainer}>
        <RectButton
          style={[
            styles.hiddenButtonLarge,
            { backgroundColor: colors.primary[500] },
          ]}
          onPress={() => onEdit?.(id ?? "", type)}
        >
          <Feather name="edit-2" size={24} color="#fff" />
          <Text style={styles.hiddenText}>Edit</Text>
        </RectButton>
        <RectButton
          style={[styles.hiddenButtonLarge, { backgroundColor: colors.error }]}
          onPress={() => onDelete?.(id ?? "", type)}
        >
          <Feather name="trash-2" size={24} color="#fff" />
          <Text style={styles.hiddenText}>Delete</Text>
        </RectButton>
      </View>
    ),
    [id, type, onEdit, onDelete]
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity onPress={() => router.push(`./transaction/${id}`)}>
        <Animated.View entering={FadeIn} style={styles.container}>
          <View style={styles.iconContainer}>
            <Feather name={getIcon()} size={22} color={amountColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {description || "No description"}
            </Text>
            <Text style={styles.subtitle}>{formatDate(date)}</Text>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {formattedAmount}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  subtitle: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
    fontFamily: "Montserrat",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat",
  },
  hiddenContainer: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 16,
  },
  hiddenButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 10,
    padding: 8,
  },
  hiddenText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },

  hiddenButtonLarge: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
});
const propsAreEqual = (prev: Props, next: Props) => {
  return (
    prev.transaction.id === next.transaction.id &&
    prev.currentUser === next.currentUser &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
};

export default React.memo(TransactionItem, propsAreEqual);
