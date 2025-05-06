import BottomBar from "@/components/mainComponents/BottomBar";
import { colors } from "@/constants/colors";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Finances() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [focusAnim] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const transactions = [
    { id: 1, title: "Spotify", amount: "-$9.99", date: "2025-04-20" },
    { id: 2, title: "Salary", amount: "+$3000", date: "2025-04-15" },
    { id: 3, title: "Groceries", amount: "-$45.80", date: "2025-04-12" },
    { id: 4, title: "Spotify", amount: "-$9.99", date: "2025-04-20" },
    { id: 5, title: "Salary", amount: "+$3000", date: "2025-04-15" },
    { id: 6, title: "Groceries", amount: "-$45.80", date: "2025-04-12" },
    { id: 7, title: "Spotify", amount: "-$9.99", date: "2025-04-20" },
    { id: 8, title: "Salary", amount: "+$3000", date: "2025-04-15" },
    { id: 9, title: "Groceries", amount: "-$45.80", date: "2025-04-12" },
  ];

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const onChange = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) setSelectedDate(selected);
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Main Balance Section with Gradient */}
        <LinearGradient
          colors={["rgba(28, 181, 224, 1)", "rgba(0, 8, 81, 1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainSection}
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
                  <MaterialIcons
                    name="search"
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
                  onPress={() => router.push("../auth/profile")}
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
          </View>
        </LinearGradient>

        {/* Date Picker */}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.datePickerText}>
            {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChange}
            />
          )}
        </View>

        {/* Income */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.incomeText}>Income</Text>
            <Feather name="arrow-up-right" size={24} color={colors.success} />
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>$0</Text>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.expensesText}>Expenses</Text>
            <Feather name="arrow-down-right" size={24} color={colors.error} />
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>$0</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderText}>Recent Transactions</Text>
          {transactions.map((txn) => (
            <View key={txn.id} style={styles.transactionItem}>
              <Text style={styles.transactionTitle}>{txn.title}</Text>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: txn.amount.startsWith("-")
                      ? colors.error
                      : colors.success,
                  },
                ]}
              >
                {txn.amount}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => {
              router.push("./transactions");
            }}
          >
            <Text style={styles.seeMoreButtonText}>See More</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  seeMoreButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  seeMoreButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  mainSection: {
    paddingTop: Platform.OS === "ios" ? 150 : 100,
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
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.backgroundLight}40`,
  },
  incomeText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Montserrat",
    textTransform: "capitalize",
  },
  expensesText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Montserrat",
    textTransform: "capitalize",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  cardText: {
    color: colors.text,
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
  datePickerButton: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: "Montserrat",
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Montserrat",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark || "#ccc",
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Montserrat",
    fontWeight: "500",
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
