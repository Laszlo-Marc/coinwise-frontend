import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CreditCardProps {
  cardNumber: string;
  name: string;
  expiryDate: string;
}

const CreditCard: React.FC<CreditCardProps> = ({
  cardNumber,
  name,
  expiryDate,
}) => {
  // Format the card number with spaces every 4 digits
  const formattedNumber = cardNumber.replace(/(\d{4})/g, "$1 ").trim();

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <View style={styles.cardIcon}></View>
        </View>
        <Text style={styles.cardTitle}>Credit Card</Text>
      </View>
      <Text style={styles.cardNumber}>{formattedNumber}</Text>
      <View style={styles.cardDetailsContainer}>
        <View>
          <Text style={styles.cardDetailLabel}>Card Holder</Text>
          <Text style={styles.cardDetailValue}>{name}</Text>
        </View>
        <View>
          <Text style={styles.cardDetailLabel}>Expires</Text>
          <Text style={styles.cardDetailValue}>{expiryDate}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#2D2D2D",
    borderRadius: 8,
    padding: 16,
    color: "white",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: 24,
    color: "white",
  },
  cardDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
  },
  cardDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});

export default CreditCard;
