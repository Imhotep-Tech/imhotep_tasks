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

import { TaskItem } from './TaskItem';
import { TaskStats } from './TaskStats';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { EmptyTasks } from './EmptyTasks';
import { BulkActionBar } from './BulkActionBar';
import type { Task } from './types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTasks, TaskPageType } from '@/hooks/use-tasks';
import { useTaskModal } from '@/contexts/TaskModalContext';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
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
    selectedIds,
    selectionMode,
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
    toggleSelect,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    handleBulkDelete,
    handleBulkComplete,
    handleBulkUpdateDate,
    handleBulkUpdateCategory,
  } = useTasks({ pageType, sortOverdueFirst: pageType === 'today-tasks' });

  // Collapsed state for category sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((category: string) => {
    setCollapsedSections(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const formatCategory = useCallback((value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, []);

  // Group tasks by category
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

    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status ? 1 : -1;
      });
    });

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

  useEffect(() => {
    const refreshCallback = () => {
      fetchTasks(1);
    };
    setOnTaskAdded(refreshCallback);
    
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
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          {username && (
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Hello, {username}! 👋
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <Pressable 
            style={({ pressed }) => [
              styles.selectModeButton, 
              { 
                backgroundColor: selectionMode ? colors.primary : colors.card, 
                borderColor: colors.cardBorder 
              },
              pressed && { transform: [{ scale: 0.95 }] },
            ]} 
            onPress={toggleSelectionMode}
          >
            <Ionicons 
              name={selectionMode ? "checkmark-done" : "checkbox-outline"} 
              size={20} 
              color={selectionMode ? "#FFFFFF" : colors.textSecondary} 
            />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.addButton, 
              { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow },
              pressed && { transform: [{ scale: 0.95 }] },
            ]} 
            onPress={openAddModal}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* Quick Navigation Pills for All Tasks */}
      {showNavButtons && (
        <View style={styles.navButtonsContainer}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Ionicons name="today-outline" size={18} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.text }]}>Today's Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/next-week')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.text }]}>Next 7 Days</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bento Task Stats */}
      <TaskStats
        totalTasks={totalTasks}
        completedCount={completedCount}
        pendingCount={pendingCount}
      />
    </View>
  );

  // Skeleton Loader for initial fetch state
  if (loading && sortedTasks.length === 0) {
    return (
      <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])} edges={['top']}>
        <View style={styles.skeletonContainer}>
          <ListHeader />
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map(idx => (
              <View 
                key={idx} 
                style={[styles.skeletonCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.skeletonCircle, { backgroundColor: colors.skeletonBg }]} />
                <View style={styles.skeletonTextCol}>
                  <View style={[styles.skeletonLineLong, { backgroundColor: colors.skeletonBg }]} />
                  <View style={[styles.skeletonLineShort, { backgroundColor: colors.skeletonBg }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])} edges={['top']}>
      <SectionList
        sections={sections}
        renderItem={renderTask}
        renderSectionHeader={({ section }) => (
          <Pressable
            onPress={() => toggleSection(section.category)}
            style={({ pressed }) => [
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
              pressed && { opacity: 0.8 },
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
              {section.doneCount > 0 && (
                <View style={[styles.sectionBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
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
        contentContainerStyle={[styles.listContentContainer, selectedIds.length > 0 && { paddingBottom: 160 }]}
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
        onChangeCategory={handleBulkUpdateCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greeting: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectModeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 10,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 8,
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
    fontWeight: '700',
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonList: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    height: 72,
  },
  skeletonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 14,
  },
  skeletonTextCol: {
    flex: 1,
    gap: 8,
  },
  skeletonLineLong: {
    height: 14,
    borderRadius: 7,
    width: '70%',
  },
  skeletonLineShort: {
    height: 10,
    borderRadius: 5,
    width: '40%',
  },
});
