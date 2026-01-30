import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePickerModal } from './DatePickerModal';

interface Task {
  id: number;
  task_title: string;
  task_details?: string;
  due_date?: string;
  status: boolean;
}

interface TaskFormModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  task?: Task | null;
  onClose: () => void;
  onSubmit: (task: { task_title: string; task_details: string; due_date: string }) => Promise<void>;
  loading?: boolean;
}

export function TaskFormModal({
  visible,
  mode,
  task,
  onClose,
  onSubmit,
  loading,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && task) {
        setTitle(task.task_title || '');
        setDescription(task.task_details || '');
        // Slice date to YYYY-MM-DD format (first 10 chars)
        setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
      }
      setError('');
    }
  }, [visible, mode, task]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    try {
      await onSubmit({
        task_title: title.trim(),
        task_details: description.trim(),
        due_date: dueDate,
      });
      // Reset form and close only on success
      setTitle('');
      setDescription('');
      setDueDate('');
      onClose();
    } catch (err) {
      // Don't close on error, show error message
      setError(mode === 'edit' ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setError('');
    onClose();
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Select due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isEditMode = mode === 'edit';
  const headerTitle = isEditMode ? 'Edit Task' : 'Add New Task';
  const submitText = isEditMode ? 'Update Task' : 'Create Task';
  const submitIcon = isEditMode ? 'checkmark' : 'add';

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Write project proposal"
                  placeholderTextColor="#9CA3AF"
                  autoFocus={mode === 'add'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add details to help you remember"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Due Date (optional)</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={dueDate ? '#6366F1' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.dateButtonText,
                      !dueDate && styles.dateButtonPlaceholder,
                    ]}
                  >
                    {formatDateDisplay(dueDate)}
                  </Text>
                  {dueDate ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setDueDate('');
                      }}
                      style={styles.clearDateButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.actions}>
                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name={submitIcon} size={20} color="#fff" />
                      <Text style={styles.submitText}>{submitText}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={dueDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => setDueDate(date)}
      />
    </>
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
    maxHeight: '90%',
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  dateButtonPlaceholder: {
    color: '#9CA3AF',
  },
  clearDateButton: {
    padding: 2,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
