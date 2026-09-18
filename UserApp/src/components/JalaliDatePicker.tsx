import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface JalaliDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  label?: string;
}

export default function JalaliDatePicker({ value, onChange, label }: JalaliDatePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label ?? '📅 تاریخ سفر'}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="rgba(212,196,174,0.3)"
        keyboardType="numeric"
        maxLength={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    fontFamily: 'Estedad-Medium',
    fontSize: 13,
    color: '#d4c4ae',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Estedad-Bold',
    fontSize: 16,
    color: '#ffd899',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,216,153,0.3)',
    paddingVertical: 8,
    textAlign: 'left',
  },
});
