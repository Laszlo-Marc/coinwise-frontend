import { TransactionModel } from "@/models/transaction";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  transaction: TransactionModel;
};

export default function TransactionItem({ transaction }: Props) {
  const { id, description, amount, date, type } = transaction;

  // Format amount with currency
  const getCurrencySymbol = () => {
    if (type === "expense" && "currency" in transaction) {
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
    return "$"; // Default currency symbol
  };

  const formattedAmount =
    type === "expense" || type === "transfer"
      ? `-${getCurrencySymbol()}${amount.toFixed(2)}`
      : `+${getCurrencySymbol()}${amount.toFixed(2)}`;

  // Format date from ISO string
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "";

    try {
      // Handle both Date objects and ISO strings
      const dateObj =
        typeof dateString === "string" ? new Date(dateString) : dateString;

      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const getSubtitle = () => {
    const formattedDate = formatDate(date);

    switch (type) {
      case "expense":
        // Use optional chaining to safely access expense-specific fields
        return `Merchant: ${
          transaction.merchant || "Unknown"
        } • ${formattedDate}`;
      case "income":
        return `Income • ${formattedDate}`;
      case "transfer":
        // Use optional chaining to safely access transfer-specific fields
        const sender = transaction.sender || "Unknown";
        const receiver = transaction.receiver || "Unknown";
        return `From: ${sender} → To: ${receiver} • ${formattedDate}`;
      case "deposit":
        return `Deposit • ${formattedDate}`;
      default:
        return formattedDate;
    }
  };

  // Handle potentially undefined description
  const displayDescription = description || "No description";

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{displayDescription}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color:
              type === "income" || type === "deposit" ? "#4CAF50" : "#F44336",
          },
        ]}
      >
        {formattedAmount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
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
