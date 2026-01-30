import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DueDate } from './DueDate';

interface Task {
  id: number;
  task_title: string;
  task_details?: string;
  due_date?: string;
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
}

export function TaskItem({ task, onToggleComplete, onDelete, onEdit, onPress, loading }: TaskItemProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor },
        task.status && styles.completedContainer,
      ]}
      onPress={() => onPress(task)}
      disabled={loading}
    >
      <Pressable
        style={styles.checkButton}
        onPress={() => onToggleComplete(task)}
        disabled={loading}
      >
        <View
          style={[
            styles.checkbox,
            task.status && styles.checkboxCompleted,
          ]}
        >
          {task.status && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: textColor },
            task.status && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {task.task_title}
        </Text>
        
        <View style={styles.metaRow}>
          {task.due_date && (
            <DueDate dueDate={task.due_date} isCompleted={task.status} />
          )}

          {task.transaction_id && (
            <View style={styles.transactionBadge}>
              <Ionicons name="cash-outline" size={12} color="#059669" />
              <Text style={styles.transactionText}>
                {task.transaction_status || 'Transaction'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => onEdit(task)}
          disabled={loading}
        >
          <Ionicons name="pencil-outline" size={18} color="#6366F1" />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => onDelete(task.id)}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  transactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  transactionText: {
    fontSize: 11,
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
});
