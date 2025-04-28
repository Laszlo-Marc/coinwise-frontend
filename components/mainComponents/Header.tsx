import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Search, Settings, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Animation value for search bar focus effect
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
  const renderBackground = () => {
    if (Platform.OS === "ios") {
      return (
        <>
          <BlurView
            intensity={20}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <View style={[StyleSheet.absoluteFill, styles.iosOverlay]} />
        </>
      );
    } else {
      return (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        {renderBackground()}
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <Settings color={colors.text} size={24} />
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  iosOverlay: {
    backgroundColor: "transparent", // Blue-green tint overlay
  },
  androidBackground: {
    backgroundColor: `${colors.secondary}100`, // Semi-transparent background
    borderBottomWidth: 1,
    borderBottomColor: `${colors.secondaryLight}30`,
  },
  container: {
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
});
