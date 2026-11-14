import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { padTwo, persianDigits } from '../utils/tripDateTime';

export function draggedTimeValue(start: number, dy: number, count: number): number {
  return ((start - Math.round(dy / 36)) % count + count) % count;
}

export default function DragTimeWheel({ label, count, value, onChange }: {
  label: string; count: number; value: number; onChange: (value: number) => void;
}) {
  const latest = useRef({ value, onChange, count });
  latest.current = { value, onChange, count };
  const start = useRef(value);
  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => { start.current = latest.current.value; },
    onPanResponderMove: (_, gesture) => {
      const next = draggedTimeValue(start.current, gesture.dy, latest.current.count);
      if (next !== latest.current.value) latest.current.onChange(next);
    },
    onPanResponderTerminationRequest: () => false,
  })).current;
  return <View style={styles.column}>
    <Text style={styles.label}>{label}</Text>
    <View {...responder.panHandlers} style={styles.wheel} accessibilityRole="adjustable"
      accessibilityLabel={label} accessibilityValue={{ min: 0, max: count - 1, now: value, text: persianDigits(padTwo(value)) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => onChange((value + (nativeEvent.actionName === 'increment' ? 1 : -1) + count) % count)}>
      {[-2, -1, 0, 1, 2].map(offset => {
        const number = (value + offset + count) % count;
        return <TouchableOpacity key={offset} accessibilityRole="button" accessibilityLabel={`${label} ${persianDigits(number)}`}
          style={[styles.option, offset === 0 && styles.selected]} onPress={() => onChange(number)}>
          <Text style={[styles.number, offset === 0 ? styles.active : styles.muted]}>{persianDigits(padTwo(number))}</Text>
        </TouchableOpacity>;
      })}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  column: { flex: 1, gap: 8 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center' },
  wheel: { height: 180, overflow: 'hidden', borderRadius: 14, backgroundColor: colors.surfaceContainerLow, userSelect: 'none', touchAction: 'none' } as any,
  option: { height: 36, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.primary, borderRadius: 10 },
  number: { fontFamily: fonts.medium, fontSize: 18 },
  active: { color: colors.onPrimary, fontFamily: fonts.bold },
  muted: { color: colors.onSurfaceVariant, opacity: 0.5 },
});
