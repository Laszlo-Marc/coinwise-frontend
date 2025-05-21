import TransactionClassModal from "@/components/financesComponents/TransactionClasssModal";
import { TransactionFilters } from "@/components/financesComponents/TransactionsFilters";
import {
  DepositForm,
  ExpenseForm,
  IncomeForm,
  TransferForm,
} from "@/components/financesComponents/TransactionsForms";
import BottomBar from "@/components/mainComponents/BottomBar";
import MainSection from "@/components/mainComponents/MainSection";

import { TransactionList } from "@/components/financesComponents/TransactionList";
import { useTransactionContext } from "@/contexts/AppContext";
import { TransactionModel } from "@/models/transaction";
import { AntDesign, Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";

export default function TransactionsListScreen() {
  const {
    transactions,
    addTransaction,
    uploadBankStatement,
    deleteTransaction,
    loadMore,
    refreshTransactions,
    fetchTransactions,
    updateTransaction,
  } = useTransactionContext();
  const [displayedTransactions, setDisplayedTransactions] = useState<
    TransactionModel[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const router = useRouter();
  type TransactionType = "expense" | "income" | "transfer" | "deposit";
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (transactions.length > 0) {
      handleFilterChange({ transactionClass: "expenses" });
    } else {
      fetchTransactions();
    }
  }, [transactions]);
  const handleDocumentUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("User canceled document picker");
        return;
      }

      const document = result.assets[0];
      console.log("Picked document:", document);

      setIsLoading(true);
      setUploadStatus("Preparing document for upload...");

      const formData = new FormData();

      formData.append("file", {
        uri: document.uri,
        name: document.name || "upload.pdf",
        type: document.mimeType || "application/pdf",
      } as any);

      setUploadStatus("Uploading document to server...");

      const response = await uploadBankStatement(formData);

      console.log("Upload response:", response);
      setUploadStatus("Document processed successfully!");

      setTimeout(() => {
        setIsLoading(false);
        setUploadStatus("");
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsLoading(false);
      setUploadStatus("");
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your document."
      );
    }
  }, [uploadBankStatement]);
  const handleFilterChange = useCallback(
    (filters: {
      transactionClass: string;
      category?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      startDate?: Date;
      endDate?: Date;
    }) => {
      setSelectedClass(filters.transactionClass);

      // Filter by transaction type first
      let filteredTransactions = transactions;

      // Filter by transaction class
      switch (filters.transactionClass) {
        case "expenses":
          filteredTransactions = transactions.filter(
            (t) => t.type === "expense"
          );
          break;
        case "incomes":
          filteredTransactions = transactions.filter(
            (t) => t.type === "income"
          );
          break;
        case "deposits":
          filteredTransactions = transactions.filter(
            (t) => t.type === "deposit"
          );
          break;
        case "transfers":
          filteredTransactions = transactions.filter(
            (t) => t.type === "transfer"
          );
          break;
        case "all":
          filteredTransactions = transactions;
          break;
        default:
          filteredTransactions = transactions.filter(
            (t) => t.type === "expense"
          );
      }

      // Filter by category if provided
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.category === filters.category
        );
      }

      // Filter by date range if provided
      if (filters.startDate && filters.endDate) {
        const startTime = filters.startDate.getTime();
        const endTime = filters.endDate.getTime();

        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.date).getTime();
          return transactionDate >= startTime && transactionDate <= endTime;
        });
      }

      // Sort the transactions
      if (filters.sortBy) {
        filteredTransactions = [...filteredTransactions].sort((a, b) => {
          if (filters.sortBy === "date") {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          } else if (filters.sortBy === "amount") {
            return filters.sortOrder === "asc"
              ? a.amount - b.amount
              : b.amount - a.amount;
          }
          return 0;
        });
      }

      setDisplayedTransactions(filteredTransactions);
    },
    [transactions]
  );

  const handleOpenModal = useCallback(() => {
    setClassModalVisible(true);
  }, []);

  const handleEditTransaction = useCallback(
    (id: string, type: string) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;
      setSelectedTransaction(transaction);
      setFormType(type as TransactionType);

      setIsFormVisible(true);
    },
    [transactions]
  );
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  const handleDeleteTransaction = useCallback(
    (id: string, type: TransactionType) => {
      Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              deleteTransaction(id);
            },
          },
        ]
      );
    },
    []
  );

  const handleCloseForm = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  const handleSubmitForm = useCallback(
    (formData: any) => {
      if (!formType) return;

      if (selectedTransaction && selectedTransaction.id) {
        updateTransaction(selectedTransaction.id, formData);
      } else {
        addTransaction(formData);
      }

      setIsFormVisible(false);
      setSelectedTransaction(null);
    },
    [formType, addTransaction, updateTransaction, selectedTransaction]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshTransactions();
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, []);
  const renderForm = () => {
    const commonProps = {
      visible: isFormVisible,
      onClose: handleCloseForm,
      onSubmit: handleSubmitForm,
      initialData: selectedTransaction,
    };
    console.log(selectedTransaction);
    switch (formType) {
      case "expense":
        return <ExpenseForm {...commonProps} />;
      case "income":
        return <IncomeForm {...commonProps} />;
      case "transfer":
        return <TransferForm {...commonProps} />;
      case "deposit":
        return <DepositForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <MainSection
          actionButtons={
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenModal}
              >
                <View style={styles.actionIconContainer}>
                  <AntDesign name="plus" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDocumentUpload}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name="upload" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleFilters}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="filter" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Filter</Text>
              </TouchableOpacity>
            </>
          }
        />

        {showFilters && (
          <View style={styles.filtersContainer}>
            <TransactionFilters
              onFilterChange={handleFilterChange}
              selectedClass={selectedClass}
            />
          </View>
        )}
      </View>
      <TransactionList
        transactions={displayedTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <TransactionClassModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        onSelect={(type) => {
          setFormType(type);
          setIsFormVisible(true);
          setClassModalVisible(false);
        }}
      />
      {formType && isFormVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          {renderForm()}
        </View>
      )}
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  hiddenButton: {
    width: 75,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  hiddenTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  hiddenContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 17,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  actionButton: {
    alignItems: "center",
    width: 100,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 10,
    zIndex: 1,
  },
});
