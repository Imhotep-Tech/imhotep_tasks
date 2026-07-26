import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSelect: (date: string) => void;
  minimumDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePickerModal({
  visible,
  selectedDate,
  onClose,
  onSelect,
  minimumDate,
}: DatePickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setSelected(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    } else {
      setSelected(null);
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    }
  }, [selectedDate, visible]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isDateDisabled = (day: number) => {
    if (!minimumDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date < minimumDate;
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      day === selected.getDate() &&
      currentMonth === selected.getMonth() &&
      currentYear === selected.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    if (isDateDisabled(day)) return;
    const date = new Date(currentYear, currentMonth, day);
    setSelected(date);
  };

  const handleConfirm = () => {
    if (selected) {
      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const day = String(selected.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      onSelect(formatted);
    }
    onClose();
  };

  const handleQuickSelect = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const date = new Date(today);
    if (type === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (type === 'nextWeek') {
      date.setDate(date.getDate() + 7);
    }
    setSelected(date);
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  const days = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)' }]}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Grab handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Select Due Date</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Quick Select */}
          <View style={styles.quickSelect}>
            <Pressable
              style={({ pressed }) => [
                styles.quickButton, 
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handleQuickSelect('today')}
            >
              <Text style={[styles.quickButtonText, { color: colors.text }]}>Today</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickButton, 
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handleQuickSelect('tomorrow')}
            >
              <Text style={[styles.quickButtonText, { color: colors.text }]}>Tomorrow</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickButton, 
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handleQuickSelect('nextWeek')}
            >
              <Text style={[styles.quickButtonText, { color: colors.text }]}>Next Week</Text>
            </Pressable>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Pressable onPress={handlePrevMonth} style={styles.navButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.navButton} hitSlop={8}>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <Text key={day} style={[styles.dayHeader, { color: colors.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <View key={index} style={styles.dayCell}>
                {day !== null ? (
                  <Pressable
                    style={[
                      styles.dayButton,
                      isToday(day) && [styles.todayButton, { backgroundColor: colors.primaryLight }],
                      isSelected(day) && [styles.selectedButton, { backgroundColor: colors.primary }],
                      isDateDisabled(day) && styles.disabledButton,
                    ]}
                    onPress={() => handleSelectDay(day)}
                    disabled={isDateDisabled(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.text },
                        isToday(day) && { color: colors.primary, fontWeight: '700' },
                        isSelected(day) && { color: '#FFF', fontWeight: '800' },
                        isDateDisabled(day) && { color: colors.textMuted },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.cardBorder }]}>
            <Pressable 
              style={[styles.clearButton, { borderColor: colors.cardBorder }]} 
              onPress={handleClear}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton, 
                { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow },
                !selected && styles.confirmButtonDisabled,
                pressed && selected && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleConfirm}
              disabled={!selected}
            >
              <Text style={styles.confirmButtonText}>
                {selected ? `Confirm ${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Select a date'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  quickSelect: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navButton: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 3,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  todayButton: {},
  selectedButton: {},
  disabledButton: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  clearButton: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
