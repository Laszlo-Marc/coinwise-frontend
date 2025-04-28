import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Goal } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";
type ProgressHistoryItem = {
  date: string;
  amountAdded: number;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  isRecurring: boolean;
  category: string;
  status: string;
  progressHistory: ProgressHistoryItem[];
};

const AddContributionScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // State
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [goalData, setGoalData] = useState(null as Goal | null);

  // Animation
  const successOpacity = new Animated.Value(0);

  // Fetch goal data
  useEffect(() => {
    // In a real app, fetch from your state/API
    // Mock data for this example
    const mockGoals = [
      {
        id: "g1",
        title: "Emergency Fund",
        description: "Build a 6-month emergency fund",
        targetAmount: 10000,
        currentAmount: 4500,
        startDate: "2025-01-01",
        targetDate: "2025-12-31",
        isRecurring: false,
        category: "Savings",
        status: "active",
        progressHistory: [],
      },
      {
        id: "g2",
        title: "Trip to Japan ✈️",
        description: "Save for dream vacation",
        targetAmount: 5000,
        currentAmount: 1500,
        startDate: "2025-02-01",
        targetDate: "2025-09-01",
        isRecurring: false,
        category: "Travel",
        status: "active",
        progressHistory: [],
      },
    ];

    const goal = mockGoals.find((g) => g.id === id);
    console.log("Goal data:", goal);
    setGoalData(goal || null);
  }, [id]);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

  const handleAddContribution = () => {
    if (!validateAmount()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Prepare contribution data
    const contributionData = {
      date: date.toISOString().split("T")[0],
      amountAdded: parseFloat(amount),
      id,
    };

    // In a real app, you would save this to your state/API
    console.log("Adding contribution:", contributionData);

    // Show success animation
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate back after the animation
      router.back();
    });
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 200, 500];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header with gradient */}
          <LinearGradient
            colors={[colors.secondary[500], colors.primary[500]]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 10 }]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Contribution</Text>

            <View style={styles.placeholder}></View>
          </LinearGradient>

          <View style={styles.content}>
            {goalData && (
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goalData.title}</Text>
                <Text style={styles.goalProgress}>
                  Current:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(goalData.currentAmount)}
                </Text>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            </View>

            {/* Quick amount buttons */}
            <View style={styles.quickAmountContainer}>
              <Text style={styles.quickLabel}>Quick Add:</Text>
              <View style={styles.quickAmountButtons}>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickAmountButton}
                    onPress={() => {
                      setAmount(amt.toString());
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.quickAmountText}>${amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Contribution Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                !validateAmount() && styles.addButtonDisabled,
              ]}
              onPress={handleAddContribution}
              disabled={!validateAmount()}
            >
              <Text style={styles.addButtonText}>Add Contribution</Text>
            </TouchableOpacity>
          </View>

          {/* Success Animation Overlay */}
          {showSuccess && (
            <Animated.View
              style={[styles.successOverlay, { opacity: successOpacity }]}
            >
              <View style={styles.successContent}>
                <Feather name="check-circle" size={60} color={colors.success} />
                <Text style={styles.successText}>Contribution Added!</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  goalInfo: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: colors.text,
    padding: 16,
  },
  quickAmountContainer: {
    marginBottom: 24,
  },
  quickLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    width: "22%",
    alignItems: "center",
  },
  quickAmountText: {
    color: colors.text,
    fontSize: 16,
  },
  dateContainer: {
    marginBottom: 32,
  },
  dateLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
  },
});
export default AddContributionScreen;
