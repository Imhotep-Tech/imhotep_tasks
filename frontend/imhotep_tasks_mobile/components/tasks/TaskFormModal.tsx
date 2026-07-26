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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Task {
  id: number;
  task_title: string;
  task_details?: string;
  due_date?: string;
  task_category?: string;
  status: boolean;
}

interface TaskFormModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  task?: Task | null;
  onClose: () => void;
  onSubmit: (task: { task_title: string; task_details: string; due_date: string; task_category: string }) => Promise<void>;
  loading?: boolean;
  minLoadingTime?: number;
}

const withMinDelay = async <T,>(promise: Promise<T>, minMs: number): Promise<T> => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minMs)),
  ]);
  return result;
};

const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];
const CATEGORY_LABELS: Record<string, string> = {
  general: '📋  General',
  study: '📚  Study',
  work: '💼  Work',
  personal: '🏠  Personal',
  health: '💪  Health',
  finance: '💰  Finance',
};

export function TaskFormModal({
  visible,
  mode,
  task,
  onClose,
  onSubmit,
  loading: externalLoading,
  minLoadingTime = 500,
}: TaskFormModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const resolvedCategory = selectedCategory === '__other__' ? customCategory.trim().toLowerCase() : selectedCategory;

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && task) {
        setTitle(task.task_title || '');
        setDescription(task.task_details || '');
        setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
        const existingCat = (task.task_category || 'general').toLowerCase();
        if (PRESET_CATEGORIES.includes(existingCat)) {
          setSelectedCategory(existingCat);
          setCustomCategory('');
        } else {
          setSelectedCategory('__other__');
          setCustomCategory(existingCat);
        }
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setSelectedCategory('general');
        setCustomCategory('');
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
    setInternalLoading(true);
    
    try {
      await withMinDelay(
        onSubmit({
          task_title: title.trim(),
          task_details: description.trim(),
          due_date: dueDate,
          task_category: resolvedCategory || 'general',
        }),
        minLoadingTime
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedCategory('general');
      setCustomCategory('');
      onClose();
    } catch (err) {
      setError(mode === 'edit' ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedCategory('general');
    setCustomCategory('');
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

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)' }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Grab handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
            </View>

            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
              <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Complete quarterly roadmap"
                  placeholderTextColor={colors.textMuted}
                  autoFocus={mode === 'add'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add task notes or context..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Due Date (optional)</Text>
                <Pressable
                  style={[styles.dateButton, { 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={dueDate ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.dateButtonText,
                      { color: colors.text },
                      !dueDate && { color: colors.textMuted },
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
                      hitSlop={6}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  )}
                </Pressable>
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <Pressable
                  style={[styles.dateButton, { 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.dateButtonText, { color: colors.text }]}>
                    {selectedCategory === '__other__'
                      ? (customCategory || 'Custom...')
                      : CATEGORY_LABELS[selectedCategory] || selectedCategory}
                  </Text>
                  <Ionicons
                    name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                {showCategoryPicker && (
                  <View style={[styles.categoryDropdown, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    {PRESET_CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.categoryOption,
                          { borderBottomColor: colors.cardBorder },
                          selectedCategory === cat && { backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                          {CATEGORY_LABELS[cat]}
                        </Text>
                        {selectedCategory === cat && (
                          <Ionicons name="checkmark" size={18} color={colors.primary} />
                        )}
                      </Pressable>
                    ))}
                    <Pressable
                      style={[
                        styles.categoryOption,
                        selectedCategory === '__other__' && { backgroundColor: colors.primaryLight },
                      ]}
                      onPress={() => {
                        setSelectedCategory('__other__');
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                        🔖  Other (custom)
                      </Text>
                      {selectedCategory === '__other__' && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </Pressable>
                  </View>
                )}

                {selectedCategory === '__other__' && (
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                      marginTop: 8,
                    }]}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Enter custom category"
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.actions}>
                <Pressable 
                  style={[styles.cancelButton, { borderColor: colors.cardBorder }]} 
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton, 
                    { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow },
                    loading && styles.submitButtonDisabled,
                    pressed && !loading && { transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name={isEditMode ? "checkmark" : "add"} size={20} color="#FFF" />
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '88%',
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
  },
  clearDateButton: {
    padding: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    marginBottom: 28,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
