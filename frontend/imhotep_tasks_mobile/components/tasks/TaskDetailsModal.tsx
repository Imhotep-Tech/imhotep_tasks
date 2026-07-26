import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
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
  created_at?: string;
  updated_at?: string;
}

interface TaskDetailsModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => Promise<void>;
  onDelete: (taskId: number) => void;
  minLoadingTime?: number;
}

const withMinDelay = async <T,>(promise: Promise<T>, minMs: number): Promise<T> => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minMs)),
  ]);
  return result;
};

export function TaskDetailsModal({
  visible,
  task,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
  minLoadingTime = 500,
}: TaskDetailsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [completeLoading, setCompleteLoading] = useState(false);

  if (!task) return null;

  const handleToggleComplete = async () => {
    setCompleteLoading(true);
    try {
      await withMinDelay(onToggleComplete(task), minLoadingTime);
      onClose();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setCompleteLoading(false);
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Task Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge & Due Date */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: task.status 
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5')
                      : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB') 
                  },
                ]}
              >
                <Ionicons
                  name={task.status ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={task.status ? (isDark ? '#34D399' : '#10B981') : (isDark ? '#FBBF24' : '#F59E0B')}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: task.status ? (isDark ? '#34D399' : '#10B981') : (isDark ? '#FBBF24' : '#F59E0B') },
                  ]}
                >
                  {task.status ? 'Completed' : 'Pending'}
                </Text>
              </View>
              {task.due_date && (
                <DueDate dueDate={task.due_date} isCompleted={task.status} />
              )}
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Title</Text>
              <Text
                style={[
                  styles.title,
                  { color: colors.text },
                  task.status && [styles.titleCompleted, { color: colors.textMuted }],
                ]}
              >
                {task.task_title}
              </Text>
            </View>

            {/* Description */}
            {task.task_details ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Description</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{task.task_details}</Text>
              </View>
            ) : null}

            {/* Category */}
            {task.task_category ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Category</Text>
                <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="pricetag-outline" size={15} color={colors.primary} />
                  <Text style={[styles.pillText, { color: colors.primary, textTransform: 'capitalize' }]}>
                    {task.task_category}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Transaction Info */}
            {task.transaction_id && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Transaction</Text>
                <View style={[styles.pillBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                  <Ionicons name="cash-outline" size={15} color={isDark ? '#34D399' : '#059669'} />
                  <Text style={[styles.pillText, { color: isDark ? '#34D399' : '#059669' }]}>
                    {task.transaction_status || `Transaction #${task.transaction_id}`}
                  </Text>
                </View>
              </View>
            )}

            {/* Timestamps */}
            <View style={[styles.timestampsContainer, { borderTopColor: colors.cardBorder }]}>
              {task.created_at && (
                <View style={styles.timestamp}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                    Created: {formatDateTime(task.created_at)}
                  </Text>
                </View>
              )}
              {task.updated_at && (
                <View style={styles.timestamp}>
                  <Ionicons name="refresh-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                    Updated: {formatDateTime(task.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Row */}
          <View style={[styles.actions, { borderTopColor: colors.cardBorder }]}>
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton, 
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  onEdit(task);
                  onClose();
                }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: task.status ? (isDark ? 'rgba(245,158,11,0.2)' : '#FFFBEB') : (isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5'),
                    borderColor: task.status ? '#F59E0B' : '#10B981',
                  },
                  completeLoading && styles.actionButtonDisabled,
                  pressed && !completeLoading && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleToggleComplete}
                disabled={completeLoading}
              >
                {completeLoading ? (
                  <ActivityIndicator size="small" color={task.status ? '#F59E0B' : '#10B981'} />
                ) : (
                  <>
                    <Ionicons
                      name={task.status ? 'close-circle' : 'checkmark-circle'}
                      size={18}
                      color={task.status ? '#F59E0B' : '#10B981'}
                    />
                    <Text style={[styles.actionButtonText, { color: task.status ? '#F59E0B' : '#10B981' }]}>
                      {task.status ? 'Undo' : 'Done'}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton, 
                  { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', borderColor: '#EF4444' },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
              </Pressable>
            </View>
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
    maxHeight: '85%',
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
  content: {
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestampsContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 8,
    marginBottom: 20,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 12,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
});
