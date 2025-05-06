import { colors } from "@/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DateRangeComponent = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"start" | "end">(
    "start"
  );

  const openDatePicker = (mode: "start" | "end") => {
    setDatePickerMode(mode);
    setDatePickerVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setDatePickerVisible(false);
    }

    if (selectedDate) {
      if (datePickerMode === "start") {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
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
      <View style={styles.contentContainer}>
        <View style={styles.dateFilterSection}>
          <Text style={styles.filterTitle}>Date Range</Text>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("start")}
            >
              <Text style={styles.dateButtonLabel}>From</Text>
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("end")}
            >
              <Text style={styles.dateButtonLabel}>To</Text>
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                value={datePickerMode === "start" ? startDate : endDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && datePickerVisible && (
        <DateTimePicker
          value={datePickerMode === "start" ? startDate : endDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  dateFilterSection: {
    marginBottom: 16,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.text,
    fontFamily: "Montserrat",
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

export default DateRangeComponent;
