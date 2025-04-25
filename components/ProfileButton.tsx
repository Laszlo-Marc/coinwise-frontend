import { User } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

interface ProfileButtonProps {
  onPress?: () => void;
}

export default function ProfileButton({ onPress }: ProfileButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[600] + "20",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <User size={20} color={colors.text} />
    </TouchableOpacity>
  );
}
