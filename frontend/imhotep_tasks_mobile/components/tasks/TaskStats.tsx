import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TaskStatsProps {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
}

export function TaskStats({ totalTasks, completedCount, pendingCount }: TaskStatsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <View style={[styles.statCard, { backgroundColor }, styles.totalCard]}>
        <View style={[styles.iconContainer, styles.totalIcon]}>
          <Ionicons name="clipboard-outline" size={20} color="#6366F1" />
        </View>
        <View>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{totalTasks}</Text>
        </View>
      </View>

      <View style={[styles.statCard, { backgroundColor }, styles.completedCard]}>
        <View style={[styles.iconContainer, styles.completedIcon]}>
          <Ionicons name="checkmark-done-outline" size={20} color="#22C55E" />
        </View>
        <View>
          <Text style={styles.statLabel}>Done</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{completedCount}</Text>
        </View>
      </View>

      <View style={[styles.statCard, { backgroundColor }, styles.pendingCard]}>
        <View style={[styles.iconContainer, styles.pendingIcon]}>
          <Ionicons name="time-outline" size={20} color="#F59E0B" />
        </View>
        <View>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{pendingCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 8,
  },
  totalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  completedCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  pendingCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalIcon: {
    backgroundColor: '#EEF2FF',
  },
  completedIcon: {
    backgroundColor: '#DCFCE7',
  },
  pendingIcon: {
    backgroundColor: '#FEF3C7',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
