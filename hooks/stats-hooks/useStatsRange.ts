import { useState } from "react";

const ranges = [
  { label: "Week", value: "last_week" },
  { label: "Month", value: "this_month" },
  { label: "3 Months", value: "last_3_months" },
  { label: "6 Months", value: "last_6_months" },
  { label: "Year", value: "this_year" },
];

export const useStatsRange = () => {
  const [selectedRange, setSelectedRange] = useState("this_month");
  const [modalVisible, setModalVisible] = useState(false);

  const label = ranges.find((r) => r.value === selectedRange)?.label || "Month";

  return {
    selectedRange,
    setSelectedRange,
    modalVisible,
    setModalVisible,
    ranges,
    label,
  };
};
