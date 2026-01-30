import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DueDate } from './DueDate';

interface Task {
  id: number;
  task_title: string;
  task_details?: string;
  due_date?: string;
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
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export function TaskDetailsModal({
  visible,
  task,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
}: TaskDetailsModalProps) {
  if (!task) return null;

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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Task Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  task.status ? styles.statusCompleted : styles.statusPending,
                ]}
              >
                <Ionicons
                  name={task.status ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={task.status ? '#22C55E' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: task.status ? '#22C55E' : '#F59E0B' },
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
              <Text style={styles.sectionLabel}>Title</Text>
              <Text
                style={[
                  styles.title,
                  task.status && styles.titleCompleted,
                ]}
              >
                {task.task_title}
              </Text>
            </View>

            {/* Description */}
            {task.task_details ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.description}>{task.task_details}</Text>
              </View>
            ) : null}

            {/* Transaction Info */}
            {task.transaction_id && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Transaction</Text>
                <View style={styles.transactionBadge}>
                  <Ionicons name="cash-outline" size={16} color="#059669" />
                  <Text style={styles.transactionText}>
                    {task.transaction_status || `Transaction #${task.transaction_id}`}
                  </Text>
                </View>
              </View>
            )}

            {/* Timestamps */}
            <View style={styles.timestampsContainer}>
              {task.created_at && (
                <View style={styles.timestamp}>
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.timestampText}>
                    Created: {formatDateTime(task.created_at)}
                  </Text>
                </View>
              )}
              {task.updated_at && (
                <View style={styles.timestamp}>
                  <Ionicons name="refresh-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.timestampText}>
                    Updated: {formatDateTime(task.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  onEdit(task);
                  onClose();
                }}
              >
                <Ionicons name="pencil" size={18} color="#6366F1" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, task.status ? styles.incompleteButton : styles.completeButton]}
                onPress={() => {
                  onToggleComplete(task);
                  onClose();
                }}
              >
                <Ionicons
                  name={task.status ? 'close-circle' : 'checkmark-circle'}
                  size={18}
                  color={task.status ? '#F59E0B' : '#22C55E'}
                />
                <Text style={task.status ? styles.incompleteButtonText : styles.completeButtonText}>
                  {task.status ? 'Undo' : 'Done'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  transactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  transactionText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  timestampsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 8,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
  },
  incompleteButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  incompleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
  },
  editButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});
