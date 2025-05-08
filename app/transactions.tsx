import TransactionClassModal from "@/components/financesComponents/TransactionClasssModal";
import TransactionItem from "@/components/financesComponents/TransactionItem";
import TransactionFilters from "@/components/financesComponents/TransactionsFilters";
import {
  DepositForm,
  ExpenseForm,
  IncomeForm,
  TransferForm,
} from "@/components/financesComponents/TransactionsForms";
import BottomBar from "@/components/mainComponents/BottomBar";
import MainSection from "@/components/mainComponents/MainSection";
import { useTransactions } from "@/contexts/ExpensesContext";
import Transaction from "@/data/transaction";
import { TransactionModel } from "@/models/transaction";
import { AntDesign, Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SwipeListView } from "react-native-swipe-list-view";
import { colors } from "../constants/colors";

export default function TransactionsListScreen() {
  const {
    transactions,

    uploadBankStatement,
  } = useTransactions();

  const [refreshing, setRefreshing] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const router = useRouter();
  const [formType, setFormType] = useState<
    "expense" | "income" | "transfer" | "deposit" | null
  >(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
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

  // Stable handler functions with useCallback
  const handleFilterChange = useCallback(
    (filters: { transactionClass: string }) => {
      if (filters.transactionClass !== selectedClass) {
        setSelectedClass(filters.transactionClass);
      }
    },
    [selectedClass]
  );

  const handleOpenModal = useCallback(() => {
    setFormType(null);
    setClassModalVisible(true);
  }, []);

  const handleEditTransaction = useCallback((id: string, type: string) => {
    console.log("Edit transaction", id, type);
    // Implement your edit logic here
  }, []);

  const handleDeleteTransaction = useCallback((id: string, type: string) => {
    console.log("Delete transaction", id, type);
    // Implement your delete logic here
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormType(null);
  }, []);

  const handleSubmitForm = useCallback((formData: any) => {
    console.log("Submit form", formData);
    // Implement your form submission logic
    setFormType(null);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Fetch your data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  const renderForm = () => {
    switch (formType) {
      case "expense":
        return (
          <ExpenseForm
            visible={formType === "expense"}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        );
      case "income":
        return (
          <IncomeForm
            visible={formType === "income"}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        );
      case "transfer":
        return (
          <TransferForm
            visible={formType === "transfer"}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        );
      case "deposit":
        return (
          <DepositForm
            visible={formType === "deposit"}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        );
      default:
        return null;
    }
  };

  const renderHiddenItem = useCallback(
    ({ item }: { item: Transaction }, rowMap: any) => (
      <View style={styles.hiddenContainer}>
        <Animated.View
          entering={FadeInLeft}
          style={[
            styles.hiddenButton,
            { backgroundColor: colors.primary[500] },
          ]}
        >
          <TouchableOpacity
            style={styles.hiddenTouchable}
            onPress={() => {
              handleEditTransaction(item.id, item.type);
              rowMap[item.id]?.closeRow();
            }}
          >
            <Ionicons name="pencil" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInRight}
          style={[styles.hiddenButton, { backgroundColor: "#D32F2F" }]}
        >
          <TouchableOpacity
            style={styles.hiddenTouchable}
            onPress={() => {
              handleDeleteTransaction(item.id, item.type);
              rowMap[item.id]?.closeRow();
            }}
          >
            <Ionicons name="trash" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    ),
    [handleEditTransaction, handleDeleteTransaction]
  );

  const renderItem = useCallback(({ item }: { item: TransactionModel }) => {
    return <TransactionItem transaction={item} />;
  }, []);

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found</Text>
      </View>
    );
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
                <Text style={styles.actionText}>Add transaction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDocumentUpload}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name="upload" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Upload Statement</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={colors.text}
                  />
                </View>
                <Text style={styles.actionText}>Delete multiple</Text>
              </TouchableOpacity>
            </>
          }
        />

        <View style={{ padding: 10 }}>
          <TransactionFilters onFilterChange={handleFilterChange} />
        </View>
      </View>
      {/* Transactions List */}
      <SwipeListView
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        leftOpenValue={150}
        disableRightSwipe={false}
        disableLeftSwipe={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={renderEmpty}
        useNativeDriver={true}
        removeClippedSubviews={true}
      />
      <TransactionClassModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        onSelect={(type) => {
          setFormType(type);
          setClassModalVisible(false);
        }}
      />
      {formType && (
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
  },
});
