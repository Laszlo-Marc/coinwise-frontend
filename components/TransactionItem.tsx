import { StyleSheet, Text, View } from "react-native";

interface TransactionItemProps {
  title: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
}

export default function TransactionItem({
  title,
  amount,
  date,
  category,
  type,
}: TransactionItemProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {category} • {date}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: type === "income" ? "#4CAF50" : "#F44336" },
        ]}
      >
        {type === "expense" ? "-" : "+"}${amount.toFixed(2)}
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
    marginBottom: 10,
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
