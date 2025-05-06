import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DateRangeComponent from "./DateRangeComponent";
import DocumentPickerComponent from "./DocumentPicker";
import TransactionFilters from "./TransactionsFilters";

const ActionsComponent = () => {
  const [addingTransaction, setAddingTransaction] = React.useState(false);
  const [filtering, setFiltering] = React.useState(false);
  const [choosingDateRange, setChoosingDateRange] = React.useState(false);

  return (
    <View style={styles.middleSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionButtonsContainer}
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            addingTransaction && styles.actionButtonActive,
          ]}
          onPress={() => setAddingTransaction(!addingTransaction)}
        >
          <Text
            style={[
              styles.actionButtonText,
              addingTransaction && styles.actionButtonTextActive,
            ]}
          >
            {addingTransaction ? "Cancel" : "Upload Bank Statement"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, filtering && styles.actionButtonActive]}
          onPress={() => setFiltering(!filtering)}
        >
          <Text
            style={[
              styles.actionButtonText,
              filtering && styles.actionButtonTextActive,
            ]}
          >
            {filtering ? "Cancel" : "Filter Transactions"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            choosingDateRange && styles.actionButtonActive,
          ]}
          onPress={() => setChoosingDateRange(!choosingDateRange)}
        >
          <Text
            style={[
              styles.actionButtonText,
              choosingDateRange && styles.actionButtonTextActive,
            ]}
          >
            {choosingDateRange ? "Cancel" : "Choose Date Range"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {filtering && <TransactionFilters onFilterChange={() => {}} />}
      {addingTransaction && <DocumentPickerComponent />}
      {choosingDateRange && <DateRangeComponent />}
    </View>
  );
};

const styles = StyleSheet.create({
  middleSection: {
    padding: 16,
  },
  manualTransactionButton: {
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignContent: "center",
    justifyContent: "center",
  },
  manualTranasaction: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
  },
  actionButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  actionButtonTextActive: {
    color: colors.text,
    fontWeight: "600",
  },
});
export default ActionsComponent;
