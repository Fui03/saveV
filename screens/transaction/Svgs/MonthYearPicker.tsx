// MonthYearPicker.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import RNPickerSelect from 'react-native-picker-select';

type MonthYearPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: { month: number; year: number }) => void;
  defaultMonth?: number;
  defaultYear?: number;
};

const MonthYearPicker = ({
  visible,
  onClose,
  onSelect,
  defaultMonth = new Date().getMonth() + 1,
  defaultYear = new Date().getFullYear()
}: MonthYearPickerProps) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  useEffect(() => {
    if (visible) {
      setSelectedMonth(defaultMonth);
      setSelectedYear(defaultYear);
    }
  }, [visible, defaultMonth, defaultYear]);

  const months = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 },
    { label: 'March', value: 3 }, { label: 'April', value: 4 },
    { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 },
    { label: 'September', value: 9 }, { label: 'October', value: 10 },
    { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];

  const years = [];
  for (let i = 2020; i <= new Date().getFullYear(); i++) {
    years.push({ label: i.toString(), value: i });
  }

  const handleConfirm = () => {
    onSelect({ month: selectedMonth, year: selectedYear });
    onClose();
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Month and Year</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            value={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
            items={months}
          />
          <Text style={styles.textMonth}>
            {months[selectedMonth - 1].label}
          </Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            items={years}
          />
          <Text style={styles.textMonth}>
            {selectedYear}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: "center",
    width: '100%',
    borderWidth:1
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 100,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textMonth: {
    fontSize: 17,
    fontWeight:"400",
    marginRight: 20
  },

});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, 
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
  },
});

export default MonthYearPicker;