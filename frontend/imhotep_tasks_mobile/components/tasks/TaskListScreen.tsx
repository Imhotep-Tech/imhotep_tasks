import React, { useEffect } from 'react';
import {
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  TaskItem,
  TaskStats,
  TaskFormModal,
  TaskDetailsModal,
  EmptyTasks,
  Task,
} from '@/components/tasks';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTasks, TaskPageType } from '@/hooks/use-tasks';

interface TaskListScreenProps {
  pageType: TaskPageType;
  title: string;
  username?: string;
}

export function TaskListScreen({ pageType, title, username }: TaskListScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sortedTasks,
    totalTasks,
    completedCount,
    pendingCount,
    loading,
    refreshing,
    formLoading,
    actionLoading,
    showFormModal,
    formMode,
    editingTask,
    detailsTask,
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
  } = useTasks({ pageType, sortOverdueFirst: pageType === 'today-tasks' });

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleTaskPress = (task: Task) => {
    setDetailsTask(task);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDeleteTask}
      onEdit={openEditModal}
      onPress={handleTaskPress}
      loading={actionLoading === item.id}
    />
  );

  const ListHeader = () => (
    <>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          {username && (
            <ThemedText style={styles.greeting}>
              Hello, {username}!
            </ThemedText>
          )}
        </View>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </ThemedView>

      <TaskStats
        totalTasks={totalTasks}
        completedCount={completedCount}
        pendingCount={pendingCount}
      />

      <ThemedView style={styles.listHeader}>
        <ThemedText type="subtitle" style={styles.listTitle}>
          Tasks
        </ThemedText>
      </ThemedView>
    </>
  );

  if (loading && sortedTasks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <ThemedText style={styles.loadingText}>Loading tasks...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <FlatList
        data={sortedTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyTasks onAddTask={openAddModal} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={sortedTasks.length === 0 ? styles.emptyList : undefined}
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
    color: '#6B7280',
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
  },
  greeting: {
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
  },
  emptyList: {
    flex: 1,
  },
});
