import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Search, SettingsIcon, User } from "lucide-react-native";
import { useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainSection({
  actionButtons,
}: {
  actionButtons?: React.ReactNode;
}) {
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
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const searchBarBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${colors.backgroundLight}80`, colors.primary[400]],
  });

  const searchBarBackgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${colors.backgroundLight}40`, `${colors.backgroundLight}60`],
  });
  return (
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
              <SettingsIcon color={colors.text} size={24} />
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
              <Search
                color={isFocused ? colors.primary[400] : colors.textSecondary}
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
              <User color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Main · USD</Text>
        <Text style={styles.balanceAmount}>$0</Text>
      </View>
      <View style={styles.quickActions}>{actionButtons}</View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  mainSection: {
    paddingTop: Platform.OS === "ios" ? 150 : 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
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
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
});
