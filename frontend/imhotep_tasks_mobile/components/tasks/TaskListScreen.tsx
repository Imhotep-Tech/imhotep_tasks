import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TaskItem } from './TaskItem';
import { TaskStats } from './TaskStats';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { EmptyTasks } from './EmptyTasks';
import { BulkActionBar } from './BulkActionBar';
import type { Task } from './types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTasks, TaskPageType } from '@/hooks/use-tasks';
import { useTaskModal } from '@/contexts/TaskModalContext';
// Theme colors matching routines.tsx and auth pages
const themes = {
  light: {
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#16A34A',
    successBg: '#DCFCE7',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    inputBg: '#FFFFFF',
    placeholder: '#9CA3AF',
    statsCard: '#FFFFFF',
  },
  dark: {
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    success: '#22C55E',
    successBg: '#14532D',
    error: '#EF4444',
    errorBg: '#450A0A',
    inputBg: '#374151',
    placeholder: '#6B7280',
    statsCard: '#1F2937',
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  study: '📚',
  work: '💼',
  personal: '🏠',
  health: '💪',
  finance: '💰',
  general: '📋',
};
const DEFAULT_ICON = '🔖';

interface TaskListScreenProps {
  pageType: TaskPageType;
  title: string;
  username?: string;
  showNavButtons?: boolean;
}

export function TaskListScreen({ pageType, title, username, showNavButtons = false }: TaskListScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();
  const colors = themes[colorScheme ?? 'light'];
  const router = useRouter();

  const {
    sortedTasks,
    totalTasks,
    completedCount,
    pendingCount,
    loading,
    refreshing,
    formLoading,
    actionLoading,
    bulkLoading,
    showFormModal,
    formMode,
    editingTask,
    detailsTask,
    // Selection state
    selectedIds,
    selectionMode,
    // Actions
    fetchTasks,
    onRefresh,
    handleLoadMore,
    openAddModal,
    openEditModal,
    closeFormModal,
    setDetailsTask,
    handleFormSubmit,
    handleToggleComplete,
    handleDeleteTask,
    // Selection actions
    toggleSelect,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    // Bulk actions
    handleBulkDelete,
    handleBulkComplete,
    handleBulkUpdateDate,
  } = useTasks({ pageType, sortOverdueFirst: pageType === 'today-tasks' });

  // Collapsed state for category sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((category: string) => {
    setCollapsedSections(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const formatCategory = useCallback((value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, []);

  // Group tasks by category, with optional consolidated "Done" section for today page.
  const sections = useMemo(() => {
    const categoryOrderSort = (a: string, b: string) => {
      if (a === 'study') return -1;
      if (b === 'study') return 1;
      return a.localeCompare(b);
    };

    if (pageType === 'today-tasks') {
      const pendingGroups: Record<string, Task[]> = {};
      const doneTasks: Task[] = [];

      sortedTasks.forEach(task => {
        const cat = (task.task_category || 'general').toLowerCase();
        if (task.status) {
          doneTasks.push(task);
          return;
        }
        if (!pendingGroups[cat]) pendingGroups[cat] = [];
        pendingGroups[cat].push(task);
      });

      const pendingSections = Object.keys(pendingGroups)
        .sort(categoryOrderSort)
        .map(cat => ({
          category: cat,
          icon: CATEGORY_ICONS[cat] || DEFAULT_ICON,
          pendingCount: pendingGroups[cat].length,
          doneCount: 0,
          doneGroup: false,
          data: collapsedSections[cat] ? [] : pendingGroups[cat],
        }));

      if (doneTasks.length > 0) {
        doneTasks.sort((a, b) => {
          const aCat = (a.task_category || 'general').toLowerCase();
          const bCat = (b.task_category || 'general').toLowerCase();
          return categoryOrderSort(aCat, bCat);
        });
        pendingSections.push({
          category: 'done',
          icon: '✅',
          pendingCount: 0,
          doneCount: doneTasks.length,
          doneGroup: true,
          data: collapsedSections.done ? [] : doneTasks,
        });
      }

      return pendingSections;
    }

    const groups: Record<string, Task[]> = {};
    sortedTasks.forEach(task => {
      const cat = (task.task_category || 'general').toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });

    // Sort within each group: pending first, then done
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status ? 1 : -1;
      });
    });

    // Category display order: study first, then rest alphabetically
    const orderedKeys = Object.keys(groups).sort(categoryOrderSort);

    return orderedKeys.map(cat => ({
      category: cat,
      icon: CATEGORY_ICONS[cat] || DEFAULT_ICON,
      pendingCount: groups[cat].filter(t => !t.status).length,
      doneCount: groups[cat].filter(t => t.status).length,
      doneGroup: false,
      data: collapsedSections[cat] ? [] : groups[cat],
    }));
  }, [sortedTasks, collapsedSections, pageType]);

  const { setOnTaskAdded } = useTaskModal();

  // Register the refresh callback when a task is added from the global modal
  useEffect(() => {
    const refreshCallback = () => {
      fetchTasks(1);
    };
    setOnTaskAdded(refreshCallback);
    
    // Cleanup on unmount
    return () => {
      setOnTaskAdded(null);
    };
  }, [fetchTasks, setOnTaskAdded]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleTaskPress = (task: Task) => {
    setDetailsTask(task);
  };

  const renderTask = ({ item, section }: { item: Task; section: { doneGroup?: boolean } }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDeleteTask}
      onEdit={openEditModal}
      onPress={handleTaskPress}
      loading={actionLoading === item.id}
      selectionMode={selectionMode}
      isSelected={selectedIds.includes(item.id)}
      onToggleSelect={toggleSelect}
      showDoneCategoryLabel={!!section.doneGroup}
    />
  );

  const ListHeader = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          {username && (
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Hello, {username}!
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {/* Selection mode toggle */}
          <Pressable 
            style={[
              styles.selectModeButton, 
              { backgroundColor: selectionMode ? colors.primary : colors.card, borderColor: colors.border }
            ]} 
            onPress={toggleSelectionMode}
          >
            <Ionicons 
              name={selectionMode ? "checkmark-done" : "checkbox-outline"} 
              size={20} 
              color={selectionMode ? "#FFFFFF" : colors.textSecondary} 
            />
          </Pressable>
          {/* Add task button */}
          <Pressable style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Navigation buttons for All Tasks page */}
      {showNavButtons && (
        <View style={[styles.navButtonsContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="today-outline" size={20} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.text }]}>Today's Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/next-week')}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.text }]}>Next 7 Days</Text>
          </TouchableOpacity>
        </View>
      )}

      <TaskStats
        totalTasks={totalTasks}
        completedCount={completedCount}
        pendingCount={pendingCount}
      />

      <View style={[styles.listHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          Tasks
        </Text>
      </View>
    </>
  );

  if (loading && sortedTasks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <SectionList
        sections={sections}
        renderItem={renderTask}
        renderSectionHeader={({ section }) => (
          <Pressable
            onPress={() => toggleSection(section.category)}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F9FAFB',
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.doneGroup ? 'Done' : formatCategory(section.category)}
              </Text>
              {!section.doneGroup && (
                <View style={[styles.sectionBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.sectionBadgeText, { color: colors.primary }]}>
                    {section.pendingCount} pending
                  </Text>
                </View>
              )}
              {!section.doneGroup && section.doneCount > 0 && (
                <View style={[styles.sectionBadge, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
                  <Text style={[styles.sectionBadgeText, { color: colors.textSecondary }]}>
                    {section.doneCount} done
                  </Text>
                </View>
              )}
              {section.doneGroup && (
                <View style={[styles.sectionBadge, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
                  <Text style={[styles.sectionBadgeText, { color: colors.textSecondary }]}>
                    {section.doneCount} done
                  </Text>
                </View>
              )}
            </View>
            <Ionicons
              name={collapsedSections[section.category] ? 'chevron-forward' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyTasks onAddTask={openAddModal} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={sortedTasks.length === 0 ? styles.emptyList : undefined}
        stickySectionHeadersEnabled={false}
      />

      {/* Add/Edit Task Modal */}
      <TaskFormModal
        visible={showFormModal}
        mode={formMode}
        task={editingTask}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        visible={!!detailsTask}
        task={detailsTask}
        onClose={() => setDetailsTask(null)}
        onEdit={(task) => {
          setDetailsTask(null);
          openEditModal(task);
        }}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={sortedTasks.length}
        loading={bulkLoading}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDelete={handleBulkDelete}
        onToggleComplete={handleBulkComplete}
        onChangeDueDate={handleBulkUpdateDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  greeting: {
    marginTop: 4,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
