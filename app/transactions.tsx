import ProcessingModal from "@/components/financesComponents/ProcessingModal";
import TransactionClassModal from "@/components/financesComponents/TransactionClasssModal";
import { TransactionList } from "@/components/financesComponents/TransactionList";
import { TransactionFilters } from "@/components/financesComponents/TransactionsFilters";
import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import MainSection from "@/components/mainComponents/MainSection";
import { useTransactionContext } from "@/contexts/AppContext";
import { useTransactionFilters } from "@/hooks/finances-page/handleFilterChange";
import { useDocumentUpload } from "@/hooks/transactions-page/useDocumentUpload";
import { useTransactionUIState } from "@/hooks/transactions-page/useTransactionUIState";
import { AntDesign, Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";

export default function TransactionsListScreen() {
  const router = useRouter();
  const {
    transactions,
    uploadBankStatement,
    deleteTransaction,
    refreshTransactions,
  } = useTransactionContext();

  const {
    refreshing,
    setRefreshing,
    classModalVisible,
    setClassModalVisible,
    modalVisible,
    setModalVisible,
    selectedTransactionId,
    setSelectedTransactionId,
    showFilters,
    setShowFilters,
    selectedClass,
  } = useTransactionUIState();

  const { uploadDocument, isLoading, processingStage } =
    useDocumentUpload(uploadBankStatement);

  const { displayedTransactions, handleFilterChange } =
    useTransactionFilters(transactions);

  const toggleFilters = () => setShowFilters(!showFilters);

  useEffect(() => {
    if (transactions.length > 0) {
      handleFilterChange({ transactionClass: "expense" });
    }
  }, [transactions]);

  const handleOpenModal = useCallback(() => {
    setClassModalVisible(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh transactions.");
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
                onPress={uploadDocument}
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
        onEdit={(id) => router.push(`/transaction/edit-transaction/${id}`)}
        onDelete={(id) => {
          setSelectedTransactionId(id);
          setModalVisible(true);
        }}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <TransactionClassModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        onSelect={(type) => {
          setClassModalVisible(false);
          router.push(`/transaction/add-transaction/${type}`);
        }}
      />

      <ProcessingModal visible={isLoading} currentStage={processingStage} />

      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          deleteTransaction(selectedTransactionId);
          setModalVisible(false);
        }}
      />

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
