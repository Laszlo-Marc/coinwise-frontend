import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "../components/mainComponents/BottomBar";
import { colors } from "../constants/colors";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [appIsReady, setAppIsReady] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate animation values
  const searchBarBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${colors.backgroundLight}80`, colors.primary[400]],
  });

  const searchBarBackgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${colors.backgroundLight}40`, `${colors.backgroundLight}60`],
  });

  // Render the appropriate background based on platform

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Main Balance Section with Gradient */}
        <LinearGradient
          colors={["rgba(253, 187, 45, 1)", "rgba(34, 193, 195, 1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceSection}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push("/settings")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.searchContainer,
                    {
                      borderColor: searchBarBorderColor,
                      backgroundColor: searchBarBackgroundColor,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-sharp"
                    color={
                      isFocused ? colors.primary[400] : colors.textSecondary
                    }
                    size={20}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={colors.textMuted}
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={colors.primary[300]}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchText !== "" && isFocused && (
                    <TouchableOpacity
                      onPress={() => setSearchText("")}
                      style={styles.clearButton}
                    >
                      <View style={styles.clearIcon}>
                        <View style={styles.clearIconLine1} />
                        <View style={styles.clearIconLine2} />
                      </View>
                    </TouchableOpacity>
                  )}
                </Animated.View>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push("/profile")}
                  activeOpacity={0.7}
                >
                  <Feather name="user" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Main · USD</Text>
            <Text style={styles.balanceAmount}>$0</Text>
            <TouchableOpacity style={styles.accountsButton}>
              <Text style={styles.accountsButtonText}>Accounts</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/transactions")}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="wallet-outline" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Feather name="archive" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Archive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <SimpleLineIcons
                  name="paper-plane"
                  size={24}
                  color={colors.text}
                />
              </View>
              <Text style={styles.actionText}>Travel account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Feather name="list" size={24} color={colors.text} />
              </View>
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Transactions Preview Card */}
        <View style={styles.card}>
          <View style={styles.transactionsEmptyState}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateIconText}>🧩</Text>
            </View>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        </View>

        {/* Total Wealth Section */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Total wealth</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.totalAmount}>$0</Text>

          {/* Account Items */}
          <TouchableOpacity style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: "#4169E1" }]}>
              <Ionicons name="wallet-outline" size={24} color={colors.text} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountTitle}>Cash</Text>
              <Text style={styles.accountSubtitle}>0 Accounts</Text>
            </View>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: "#4682B4" }]}>
              <Feather name="trending-up" size={24} color={colors.text} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountTitle}>Invest</Text>
              <Text style={styles.accountSubtitle}>
                Invest for as little as $1
              </Text>
            </View>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: "#9370DB" }]}>
              <Bitcoin color={colors.text} size={24} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountTitle}>Crypto</Text>
              <Text style={styles.accountSubtitle}>
                Invest for as little as $1
              </Text>
            </View>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: "#40E0D0" }]}>
              <Entypo name="link" size={24} color={colors.text} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountTitle}>Linked</Text>
              <Text style={styles.accountSubtitle}>Link external account</Text>
            </View>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Statistics</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.statGraphPlaceholder}>
            <Feather name="pie-chart" size={24} color={colors.text} />
            <Text style={styles.statPlaceholderText}>
              Track your spending patterns
            </Text>
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Financial Goals</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.goalPlaceholder}>
            <Feather name="target" size={40} color={colors.textSecondary} />
            <Text style={styles.statPlaceholderText}>
              Set your first savings goal
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budgets Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionHeaderText}>Budgets</Text>
            <Entypo name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.goalPlaceholder}>
            <AntDesign
              name="creditcard"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.statPlaceholderText}>
              Create a budget to manage expenses
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for scrolling past the bottom bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomBar />
    </View>
  );
}

// Define SVG component for the Bitcoin icon
const Bitcoin: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color, fontSize: size * 0.7, fontWeight: "bold" }}>₿</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  balanceLabel: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Montserrat",
  },
  accountsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  accountsButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
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
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionsEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateIconText: {
    fontSize: 28,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "bold",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  cardItem: {
    marginRight: 24,
    alignItems: "center",
  },
  virtualCard: {
    width: 80,
    height: 50,
    backgroundColor: "#E57373",
    borderRadius: 8,
    padding: 8,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLogo: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  cardChip: {
    width: 12,
    height: 12,
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
  cardLabel: {
    color: colors.text,
    fontSize: 14,
  },
  cardLabelBlue: {
    color: "#4285F4",
    fontSize: 14,
  },
  addCardButton: {
    width: 80,
    height: 50,
    backgroundColor: "#E9F0FE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  totalAmount: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 16,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  accountSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statGraphPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  statPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  goalPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  createButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  createButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iosOverlay: {
    backgroundColor: "transparent", // Blue-green tint overlay
  },
  androidBackground: {
    backgroundColor: `${colors.secondary}100`, // Semi-transparent background
    borderBottomWidth: 1,
    borderBottomColor: `${colors.secondaryLight}30`,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.backgroundLight}40`,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    padding: 0,
    fontSize: 16,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.backgroundLight}80`,
  },
  clearIcon: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  clearIconLine1: {
    position: "absolute",
    width: 2,
    height: 10,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: "45deg" }],
  },
  clearIconLine2: {
    position: "absolute",
    width: 2,
    height: 10,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: "-45deg" }],
  },
});
