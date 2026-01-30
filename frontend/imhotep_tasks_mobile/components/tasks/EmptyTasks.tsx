import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyTasksProps {
  onAddTask: () => void;
}

export function EmptyTasks({ onAddTask }: EmptyTasksProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={64} color="#F59E0B" />
      </View>
      <Text style={styles.title}>No tasks for today</Text>
      <Text style={styles.subtitle}>
        You don't have any tasks scheduled for today. Enjoy your free time or create a new task!
      </Text>
      <Pressable style={styles.button} onPress={onAddTask}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add a Task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
