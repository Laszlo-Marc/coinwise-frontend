import { Link, usePathname } from "expo-router";
import { Home, PieChart, Plus, Wallet } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";

const tabs = [
  {
    name: "Home",
    href: "/" as const, // Use "as const" to tell TypeScript this is a literal type
    icon: Home,
  },
  {
    name: "Transactions",
    href: "/transactions" as const,
    icon: Wallet,
  },
  {
    name: "Add",
    href: "/add" as const,
    icon: Plus,
  },
  {
    name: "Statistics",
    href: "/statistics" as const,
    icon: PieChart,
  },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundLight }]}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link key={tab.href} href={tab.href} asChild>
            <TouchableOpacity
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: colors.primary[600] + "20",
                },
              ]}
            >
              <Icon
                size={20}
                color={isActive ? colors.text : colors.textSecondary}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.text : colors.textSecondary,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.primary[800],
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
