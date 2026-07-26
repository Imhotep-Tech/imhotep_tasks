import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { DatePickerModal } from './DatePickerModal';

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
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const floatingBottom = (insets.bottom || 0) + (Platform.OS === 'ios' ? 62 : 56);

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
      <View style={[styles.floatingWrapper, { bottom: floatingBottom }]}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Selection badge */}
            <View style={[styles.selectionBadge, { backgroundColor: colors.primaryLight }]}>
              <TouchableOpacity
                style={styles.checkboxTouch}
                onPress={allSelected ? onClearSelection : onSelectAll}
                disabled={loading}
                hitSlop={6}
              >
                <View style={[
                  styles.selectAllCheckbox,
                  { borderColor: colors.primary },
                  allSelected && { backgroundColor: colors.primary }
                ]}>
                  {allSelected && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              
              <Text style={[styles.selectionText, { color: colors.primary }]}>
                {selectedCount} selected
              </Text>
              
              <TouchableOpacity
                style={styles.clearButton}
                onPress={onClearSelection}
                disabled={loading}
                hitSlop={6}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Action buttons */}
            {loading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}
                  onPress={onToggleComplete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-done" size={16} color={isDark ? '#34D399' : '#10B981'} />
                  <Text style={[styles.actionText, { color: isDark ? '#34D399' : '#10B981' }]}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB' }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={16} color={isDark ? '#FBBF24' : '#F59E0B'} />
                  <Text style={[styles.actionText, { color: isDark ? '#FBBF24' : '#F59E0B' }]}>Date</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pricetag" size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Cat.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.categoryOverlay}>
          <View style={[styles.categoryModal, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>Change Category</Text>
            {PRESET_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryOption, { borderBottomColor: colors.cardBorder }]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryCancel, { borderColor: colors.cardBorder }]}
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
  floatingWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 10,
  },
  container: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  checkboxTouch: {
    padding: 2,
  },
  selectAllCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearButton: {
    padding: 2,
    marginLeft: 2,
  },
  loadingWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  categoryModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingVertical: 16,
    letterSpacing: -0.3,
  },
  categoryOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryCancel: {
    margin: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
