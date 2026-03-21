import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatePickerModal } from './DatePickerModal';

// Theme colors matching the app
const themes = {
  light: {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#16A34A',
    successBg: '#DCFCE7',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    warning: '#D97706',
    warningBg: '#FEF3C7',
  },
  dark: {
    background: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    success: '#22C55E',
    successBg: '#14532D',
    error: '#EF4444',
    errorBg: '#450A0A',
    warning: '#F59E0B',
    warningBg: '#451A03',
  },
};

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  loading: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onChangeDueDate: (date: string) => void;
  onChangeCategory: (category: string) => void;
}

const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];
const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  study: 'Study',
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  finance: 'Finance',
};

export function BulkActionBar({
  selectedCount,
  totalCount,
  loading,
  onSelectAll,
  onClearSelection,
  onDelete,
  onToggleComplete,
  onChangeDueDate,
  onChangeCategory,
}: BulkActionBarProps) {
  const colorScheme = useColorScheme();
  const colors = themes[colorScheme ?? 'light'];
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const allSelected = selectedCount === totalCount && totalCount > 0;
  
  const handleDateSelect = (date: string) => {
    setShowDatePicker(false);
    onChangeDueDate(date);
  };

  const handleCategorySelect = (category: string) => {
    setShowCategoryPicker(false);
    onChangeCategory(category);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {/* Selection info */}
        <View style={styles.selectionInfo}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={allSelected ? onClearSelection : onSelectAll}
            disabled={loading}
          >
            <View style={[
              styles.selectAllCheckbox,
              { borderColor: colors.primary },
              allSelected && { backgroundColor: colors.primary }
            ]}>
              {allSelected && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.selectionText, { color: colors.text }]}>
            {selectedCount} selected
          </Text>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearSelection}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              {/* Toggle Complete */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.successBg }]}
                onPress={onToggleComplete}
              >
                <Ionicons name="checkmark-done" size={20} color={colors.success} />
                <Text style={[styles.actionText, { color: colors.success }]}>Done</Text>
              </TouchableOpacity>

              {/* Change Date */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.warningBg }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.warning} />
                <Text style={[styles.actionText, { color: colors.warning }]}>Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Ionicons name="pricetag" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Category</Text>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.errorBg }]}
                onPress={onDelete}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={new Date().toISOString().split('T')[0]}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        minimumDate={new Date()}
      />

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.categoryOverlay}>
          <View style={[styles.categoryModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>Change Category</Text>
            {PRESET_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryOption, { borderBottomColor: colors.border }]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryCancel, { borderColor: colors.border }]}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={[styles.categoryCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllButton: {
    padding: 4,
  },
  selectAllCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  categoryModal: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  categoryCancel: {
    margin: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
