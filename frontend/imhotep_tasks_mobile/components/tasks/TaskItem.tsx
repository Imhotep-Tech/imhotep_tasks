import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CategoryColors } from '@/constants/theme';
import { DueDate } from './DueDate';

interface Task {
  id: number;
  task_title: string;
  task_details?: string;
  due_date?: string;
  task_category?: string;
  status: boolean;
  transaction_id?: number;
  transaction_status?: string;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onPress: (task: Task) => void;
  loading?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (taskId: number) => void;
  showDoneCategoryLabel?: boolean;
}

export function TaskItem({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  onPress, 
  loading,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  showDoneCategoryLabel = false,
}: TaskItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const categoryKey = (task.task_category || 'general').toLowerCase();
  const catTheme = CategoryColors[categoryKey] || CategoryColors.general;

  const handlePress = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(task.id);
    } else {
      onPress(task);
    }
  };

  const handleLongPress = () => {
    if (onToggleSelect) {
      onToggleSelect(task.id);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.cardBorder,
        },
        task.status && styles.completedCard,
        isSelected && [styles.selectedCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)' }],
        pressed && !loading && { transform: [{ scale: 0.985 }] },
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={loading}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <Pressable
          style={styles.selectionCheckButton}
          onPress={() => onToggleSelect?.(task.id)}
          disabled={loading}
          hitSlop={8}
        >
          <View
            style={[
              styles.selectionCheckbox,
              { borderColor: colors.primary },
              isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            )}
          </View>
        </Pressable>
      )}

      {/* Task Completion Checkbox */}
      <Pressable
        style={styles.checkButton}
        onPress={() => onToggleComplete(task)}
        disabled={loading}
        hitSlop={8}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.primary },
            task.status && [styles.checkboxCompleted, { backgroundColor: '#10B981', borderColor: '#10B981' }],
            loading && { borderColor: colors.primary, backgroundColor: 'transparent' },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : task.status ? (
            <Ionicons name="checkmark" size={15} color="#FFF" />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            task.status && [styles.titleCompleted, { color: colors.textMuted }],
          ]}
          numberOfLines={2}
        >
          {task.task_title}
        </Text>
        
        <View style={styles.metaRow}>
          {/* Category Pill */}
          <View 
            style={[
              styles.categoryBadge, 
              { backgroundColor: isDark ? catTheme.darkBg : catTheme.bg }
            ]}
          >
            <Text style={[styles.categoryBadgeText, { color: isDark ? catTheme.darkText : catTheme.text }]}>
              {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
            </Text>
          </View>

          {task.due_date && (
            <DueDate dueDate={task.due_date} isCompleted={task.status} />
          )}

          {task.transaction_id && (
            <View style={[styles.transactionBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
              <Ionicons name="cash-outline" size={12} color={isDark ? '#34D399' : '#059669'} />
              <Text style={[styles.transactionText, { color: isDark ? '#34D399' : '#059669' }]}>
                {task.transaction_status || 'Transaction'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => onEdit(task)}
          disabled={loading}
          hitSlop={6}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => onDelete(task.id)}
          disabled={loading}
          hitSlop={6}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.72,
  },
  selectedCard: {},
  selectionCheckButton: {
    marginRight: 10,
  },
  selectionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    marginRight: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {},
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  transactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  transactionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  actionButton: {
    padding: 8,
    borderRadius: 10,
  },
});
