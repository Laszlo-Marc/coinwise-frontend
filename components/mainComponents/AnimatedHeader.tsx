import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  animatedValue: Animated.Value;
  onBack?: () => void;
  onProfilePress?: () => void;
  gradientColors?: [string, string, ...string[]]; // At least two colors required
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  subtitle,
  animatedValue,
  onBack,
  onProfilePress,
  gradientColors = ["rgba(75, 108, 183, 0.8)", "rgba(24, 40, 72, 0.8)"] as [
    string,
    string
  ], // Default
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.spacer} />

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
            <Feather name="user" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 8,
  },
  spacer: {
    flex: 1,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Montserrat",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});

export default AnimatedHeader;
