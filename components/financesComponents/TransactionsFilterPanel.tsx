import { TransactionFilters } from "@/components/financesComponents/TransactionsFilters";
import { colors } from "@/constants/colors";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onFilterChange: (filters: any) => void;
  selectedClass: "expense" | "income" | "transfer" | "deposit" | "all" | null;
};

const TransactionsFiltersPanel: React.FC<Props> = ({
  visible,
  onFilterChange,
  selectedClass,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.exp),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.exp),
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.filtersContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TransactionFilters
        onFilterChange={onFilterChange}
        selectedClass={selectedClass}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    zIndex: 1,
    marginTop: 12,
  },
});

export default TransactionsFiltersPanel;
