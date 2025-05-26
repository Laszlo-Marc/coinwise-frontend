// TransactionItem.jsx - Improved component
import { useAuth } from "@/contexts/AuthContext";
import { TransactionModel } from "@/models/transaction";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Props = {
  transaction: TransactionModel;
};

export default function TransactionItem({ transaction }: Props) {
  const { id, description, amount, date, type, category, sender, receiver } =
    transaction;
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string>("");
  const { getStoredUserData } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getStoredUserData();
        if (userData) {
          setCurrentUser(userData["full_name"] ?? "");
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    fetchUser();
  }, []);

  const isTransferReceiver =
    type === "transfer" && currentUser && receiver === currentUser;
  const isTransferSender =
    type === "transfer" && currentUser && sender === currentUser;

  const getCurrencySymbol = () => {
    if ("currency" in transaction) {
      switch (transaction.currency) {
        case "RON":
          return "RON";
        case "EUR":
          return "€";
        case "USD":
          return "$";
        default:
          return "RON";
      }
    }
    return "$";
  };

  const formattedAmount = (() => {
    if (type === "transfer") {
      if (isTransferReceiver)
        return `+${getCurrencySymbol()}${amount.toFixed(2)}`;
      if (isTransferSender)
        return `-${getCurrencySymbol()}${amount.toFixed(2)}`;
    }
    return (
      (type === "expense" ? "-" : "+") + getCurrencySymbol() + amount.toFixed(2)
    );
  })();

  const amountColor = (() => {
    if (type === "transfer") {
      if (isTransferReceiver) return "#4CAF50"; // green
      if (isTransferSender) return "#F44336"; // red
    }
    return type === "income" || type === "deposit" ? "#4CAF50" : "#F44336";
  })();
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "";

    try {
      const dateObj =
        typeof dateString === "string" ? new Date(dateString) : dateString;

      return dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const displayDescription = description || "No description";

  const getIcon = () => {
    if (type === "expense") {
      if (category) {
        switch (category.toLowerCase()) {
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
      }
      return "arrow-down";
    } else if (type === "income") {
      return "arrow-up";
    } else if (type === "transfer") {
      return "refresh-cw";
    } else {
      return "dollar-sign";
    }
  };

  return (
    <TouchableOpacity onPress={() => router.replace(`./transaction/${id}`)}>
      <Animated.View entering={FadeIn} style={styles.container}>
        <View style={styles.iconContainer}>
          <Feather name={getIcon()} size={22} color={amountColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {displayDescription}
          </Text>
          <Text style={styles.subtitle}>{formatDate(date)}</Text>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {formattedAmount}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

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
});
