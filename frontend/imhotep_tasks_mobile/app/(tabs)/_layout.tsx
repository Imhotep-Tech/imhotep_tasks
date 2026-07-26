import { Tabs, Redirect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskModal } from '@/contexts/TaskModalContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { TaskFormModal } from '@/components/tasks';
import api from '@/constants/api';
import { enqueue } from '@/utils/mutation-queue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[activeScheme];
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12);

  const { isAuthenticated, loading } = useAuth();
  const { onTaskAdded } = useTaskModal();
  const { isOnline, refreshPendingCount } = useNetwork();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskLoading, setAddTaskLoading] = useState(false);

  const handleAddTask = useCallback(async (formData: { task_title: string; task_details: string; due_date: string; task_category: string }) => {
    setAddTaskLoading(true);
    try {
      const payload = {
        ...formData,
        task_category: formData.task_category || 'general',
      };

      if (isOnline) {
        await api.post('api/tasks/add_task/', payload);
      } else {
        await enqueue({
          action: 'add_task',
          endpoint: 'api/tasks/add_task/',
          method: 'POST',
          payload,
        });
        await refreshPendingCount();
      }

      if (onTaskAdded) {
        onTaskAdded();
      }
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    } finally {
      setAddTaskLoading(false);
    }
  }, [onTaskAdded, isOnline, refreshPendingCount]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="checkmark-done" size={32} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Imhotep Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Loading your workspace...</Text>

          <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            height: 56 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 6,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: activeScheme === 'dark' ? 0.4 : 0.06,
            shadowRadius: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="all-tasks"
          options={{
            title: 'All Tasks',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
          }}
        />
        {/* Center Add Task Button */}
        <Tabs.Screen
          name="add-task"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={[styles.addTaskButton, { backgroundColor: colors.addButton, shadowColor: colors.addButtonShadow }]}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </View>
            ),
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => setShowAddTaskModal(true)}
                style={styles.addTaskButtonContainer}
                activeOpacity={0.85}
              >
                <View style={[styles.addTaskButton, { backgroundColor: colors.addButton, shadowColor: colors.addButtonShadow }]}>
                  <Ionicons name="add" size={32} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Routines',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="repeat" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="next-week"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Global Add Task Modal */}
      <TaskFormModal
        visible={showAddTaskModal}
        onClose={() => !addTaskLoading && setShowAddTaskModal(false)}
        onSubmit={handleAddTask}
        loading={addTaskLoading}
        mode="add"
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
  },
  spinner: {
    marginTop: 8,
  },
  addTaskButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  addTaskButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
});
