import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

type DateRangeSelectorProps = {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
};

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"start" | "end">("start");

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  const openDatePicker = (mode: "start" | "end") => {
    setDatePickerMode(mode);
    setDatePickerVisible(true);
  };

  const onDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setDatePickerVisible(false);
    }

    if (selectedDate) {
      if (datePickerMode === "start") {
        setLocalStartDate(selectedDate);
        // Ensure end date is not before start date
        if (selectedDate > localEndDate) {
          setLocalEndDate(selectedDate);
        }
        onDateChange(selectedDate, selectedDate > localEndDate ? selectedDate : localEndDate);
      } else {
        setLocalEndDate(selectedDate);
        onDateChange(localStartDate, selectedDate);
      }
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker("start")}
        >
          <Text style={styles.dateButtonLabel}>From</Text>
          <Text style={styles.dateButtonText}>{formatDate(localStartDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker("end")}
        >
          <Text style={styles.dateButtonLabel}>To</Text>
          <Text style={styles.dateButtonText}>{formatDate(localEndDate)}</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" && datePickerVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={datePickerVisible}
          onRequestClose={hideDatePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  Select {datePickerMode === "start" ? "Start" : "End"} Date
                </Text>
                <TouchableOpacity
                  onPress={hideDatePicker}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={datePickerMode === "start" ? localStartDate : localEndDate}
                mode="date"
                display="spinner"
                onChange={onDateTimeChange}
                maximumDate={new Date()}
                minimumDate={datePickerMode === "end" ? localStartDate : undefined}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && datePickerVisible && (
        <DateTimePicker
          value={datePickerMode === "start" ? localStartDate : localEndDate}
          mode="date"
          display="default"
          onChange={onDateTimeChange}
          maximumDate={new Date()}
          minimumDate={datePickerMode === "end" ? localStartDate : undefined}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  datePicker: {
    height: 200,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
    alignItems: "center",
  },
  dateButtonLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Montserrat",
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[300],
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});

export default DateRangeSelector;