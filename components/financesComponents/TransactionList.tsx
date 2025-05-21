// TransactionList.jsx - Improved component
import { Feather } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SwipeListView } from "react-native-swipe-list-view";

import TransactionItem from "@/components/financesComponents/TransactionItem";
import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";

type TransactionType = "expense" | "income" | "transfer" | "deposit";

interface TransactionListProps {
  transactions: TransactionModel[];
  onEdit: (id: string, type: string) => void;
  onDelete: (id: string, type: TransactionType) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onRefresh,
  refreshing,
  onEndReached,
  hasMore,
  loadingMore,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: TransactionModel | undefined }) => {
      if (!item) return null;
      return <TransactionItem transaction={item} />;
    },
    []
  );
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: "center", color: colors.textSecondary }}>
          Loading more transactions...
        </Text>
      </View>
    );
  };

  const renderHiddenItem = useCallback(
    ({ item }: { item: TransactionModel | undefined }, rowMap: any) => {
      if (!item || !item.id || !item.type) return null;
      const itemId = item.id;
      return (
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
                onEdit(itemId, item.type);
                if (rowMap[itemId]) rowMap[itemId].closeRow();
              }}
            >
              <Feather name="edit-2" size={20} color="#FFF" />
              <Text style={styles.hiddenText}>Edit</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInRight}
            style={[styles.hiddenButton, { backgroundColor: "#D32F2F" }]}
          >
            <TouchableOpacity
              style={styles.hiddenTouchable}
              onPress={() => {
                onDelete(itemId, item.type);
                if (rowMap[itemId]) rowMap[itemId].closeRow();
              }}
            >
              <Feather name="trash-2" size={20} color="#FFF" />
              <Text style={styles.hiddenText}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    },
    [onEdit, onDelete]
  );

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No transactions found</Text>
        <Text style={styles.emptySubText}>
          Pull down to refresh or add a new transaction
        </Text>
      </View>
    );
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
      );
    },
    []
  );

  return (
    <SwipeListView
      data={transactions}
      keyExtractor={(item) => item?.id || ""}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-100}
      leftOpenValue={100}
      disableRightSwipe={false}
      disableLeftSwipe={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary[500]}
          colors={[colors.primary[500]]}
        />
      }
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={renderEmpty}
      useNativeDriver={true}
      removeClippedSubviews={true}
      friction={15}
      tension={30}
      swipeToOpenPercent={30}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingTop: 8,
    paddingBottom: 120,
    flexGrow: 1,
  },
  hiddenButton: {
    width: 100,
    height: "86%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: "3%",
  },
  hiddenTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  hiddenContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 16,
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontFamily: "Montserrat",
    marginTop: 16,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "Montserrat",
    opacity: 0.7,
    marginTop: 8,
  },
  sectionHeader: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 14,
  },
});
