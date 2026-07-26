import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TaskStatsProps {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
}

export function TaskStats({ totalTasks, completedCount, pendingCount }: TaskStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      {/* Total Card */}
      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="clipboard-outline" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalTasks}</Text>
        </View>
        <Text 
          style={[styles.statLabel, { color: colors.textSecondary }]} 
          numberOfLines={1} 
          adjustsFontSizeToFit
        >
          Total
        </Text>
      </View>

      {/* Done Card */}
      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
            <Ionicons name="checkmark-done-outline" size={16} color={isDark ? '#34D399' : '#10B981'} />
          </View>
          <Text style={[styles.statValue, { color: isDark ? '#34D399' : '#10B981' }]}>{completedCount}</Text>
        </View>
        <Text 
          style={[styles.statLabel, { color: colors.textSecondary }]} 
          numberOfLines={1} 
          adjustsFontSizeToFit
        >
          Done
        </Text>
      </View>

      {/* Pending Card */}
      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB' }]}>
            <Ionicons name="time-outline" size={16} color={isDark ? '#FBBF24' : '#F59E0B'} />
          </View>
          <Text style={[styles.statValue, { color: isDark ? '#FBBF24' : '#F59E0B' }]}>{pendingCount}</Text>
        </View>
        <Text 
          style={[styles.statLabel, { color: colors.textSecondary }]} 
          numberOfLines={1} 
          adjustsFontSizeToFit
        >
          Pending
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
