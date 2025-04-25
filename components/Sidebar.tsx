import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type AppRoute = "/" | "/profile" | "/transactions";

interface NavItem {
  label: string;
  href: AppRoute;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/" },
    { label: "Transactions", href: "/transactions" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <SafeAreaView
      style={{
        width: 250,
        backgroundColor: colors.backgroundLight,
        borderRightWidth: 1,
        borderRightColor: colors.primary[800],
      }}
    >
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "bold" }}>
          CoinWise
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} asChild>
            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor:
                  item.href === "/"
                    ? colors.primary[600] + "80"
                    : "transparent",
              }}
            >
              <Text style={{ color: colors.text }}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  );
}
