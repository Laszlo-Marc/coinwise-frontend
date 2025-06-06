import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSummaryData } from "@/hooks/home-page/useSummaryData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAuth();

  const { transactions } = useTransactionContext();
  const summaryData = useSummaryData(transactions, state.user);
  const balance = summaryData.allTime.income - summaryData.allTime.expenses;
  return (
    <LinearGradient
      colors={["rgba(252, 255, 158, 1)", "rgba(198, 119, 0, 1)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.mainSection}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("./profile")}
              activeOpacity={0.7}
            >
              <Feather name="user" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceAmount}>{balance.toFixed(2)} RON</Text>
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
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "rgba(208, 208, 208, 0.4)",
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "space-evenly",
  },
});
