import { colors } from "@/constants/colors";
import { BlurView } from "expo-blur";
import { Link, usePathname } from "expo-router";
import {
  Home,
  PieChart,
  PiggyBankIcon,
  Trophy,
  Wallet,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = [
  {
    name: "Finances",
    href: "/finances" as const,
    icon: Wallet,
  },
  {
    name: "Stats",
    href: "/stats" as const,
    icon: PieChart,
  },
  {
    name: "Home",
    href: "/" as const,
    icon: Home,
  },
  {
    name: "Goals",
    href: "/financial-goals" as const,
    icon: Trophy,
  },
  {
    name: "Budgets",
    href: "/budgets" as const,
    icon: PiggyBankIcon,
  },
];

export default function BottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding to account for safe area
  const bottomPadding = useMemo(() => {
    return Math.max(insets.bottom, 10);
  }, [insets.bottom]);

  // Render the glass effect background based on platform
  const renderBackground = () => {
    if (Platform.OS === "ios") {
      return (
        <>
          <BlurView
            intensity={35}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <View style={[StyleSheet.absoluteFill, styles.iosOverlay]} />
        </>
      );
    } else {
      // For Android, use a semi-transparent background with a blue-green tint
      return (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      );
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {renderBackground()}
      <View style={styles.container}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link key={tab.href} href={tab.href} asChild>
              <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <Icon
                    size={24}
                    color={isActive ? colors.primary[500] : colors.text}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? colors.primary[500] : colors.text,
                      opacity: isActive ? 1 : 0.8,
                    },
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopWidth: 0.5,
    borderTopColor: `${colors.secondaryLight}60`, // Adding some transparency to the border
  },
  androidBackground: {
    backgroundColor: `${colors.secondary}99`, // Adding transparency to the secondary color
    borderTopWidth: 1,
    borderTopColor: `${colors.secondaryLight}30`,
  },
  iosOverlay: {
    backgroundColor: `${colors.secondary}40`, // Light blue-green tint overlay
  },
  container: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[300],
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Montserrat",
  },
});
