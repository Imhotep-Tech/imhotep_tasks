import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import api from '@/constants/api';
import axios from 'axios';
import { cacheSet, cacheGet, buildCacheKey } from '@/utils/cache';
import { enqueue } from '@/utils/mutation-queue';
import { Colors } from '@/constants/theme';

interface Routine {
  id: number;
  routines_title: string;
  routines_dates: string[];
  routine_type: 'weekly' | 'monthly' | 'yearly';
  routine_category?: string;
  status: boolean;
  created_by: number;
}

type RoutineType = 'weekly' | 'monthly' | 'yearly';

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const ALL_MONTHLY_DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];
const CATEGORY_LABELS: Record<string, string> = {
  general: '📋  General',
  study: '📚  Study',
  work: '💼  Work',
  personal: '🏠  Personal',
  health: '💪  Health',
  finance: '💰  Finance',
};

export default function RoutinesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user, token } = useAuth();
  const { isOnline, refreshPendingCount } = useNetwork();
  const userId = user?.id || user?.pk || 'unknown';

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoutines, setTotalRoutines] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [routineType, setRoutineType] = useState<RoutineType>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [yearlyInput, setYearlyInput] = useState('');
  const [yearlyError, setYearlyError] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fetchRoutines = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!token) return;
    
    try {
      setLoading(true);

      if (isOnline) {
        const response = await axios.get(`api/routines/?page=${pageNum}`);
        const data = response.data;
        const newRoutines = data.user_routines || [];

        setRoutines(append ? [...routines, ...newRoutines] : newRoutines);
        setPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.num_pages || 1);
        setTotalRoutines(data.pagination?.total || 0);
        
        const active = newRoutines.filter((r: Routine) => r.status).length;
        setActiveCount(append ? activeCount + active : active);
        setInactiveCount(append ? inactiveCount + (newRoutines.length - active) : newRoutines.length - active);

        const cacheKey = buildCacheKey(userId, `routines:page${pageNum}`);
        cacheSet(cacheKey, data).catch(() => {});
      } else {
        const cacheKey = buildCacheKey(userId, `routines:page${pageNum}`);
        const cached = await cacheGet(cacheKey);

        if (cached) {
          const data = cached.data;
          const newRoutines = data.user_routines || [];

          setRoutines(append ? [...routines, ...newRoutines] : newRoutines);
          setPage(data.pagination?.page || 1);
          setTotalPages(data.pagination?.num_pages || 1);
          setTotalRoutines(data.pagination?.total || 0);

          const active = newRoutines.filter((r: Routine) => r.status).length;
          setActiveCount(append ? activeCount + active : active);
          setInactiveCount(append ? inactiveCount + (newRoutines.length - active) : newRoutines.length - active);
        }
      }
    } catch (error: any) {
      const isNetworkError = !error?.response;
      if (isNetworkError) {
        const cacheKey = buildCacheKey(userId, `routines:page${pageNum}`);
        const cached = await cacheGet(cacheKey);
        if (cached) {
          const data = cached.data;
          const newRoutines = data.user_routines || [];
          setRoutines(append ? [...routines, ...newRoutines] : newRoutines);
          setPage(data.pagination?.page || 1);
          setTotalPages(data.pagination?.num_pages || 1);
          setTotalRoutines(data.pagination?.total || 0);
          const active = newRoutines.filter((r: Routine) => r.status).length;
          setActiveCount(append ? activeCount + active : active);
          setInactiveCount(append ? inactiveCount + (newRoutines.length - active) : newRoutines.length - active);
        }
      } else {
        console.error('Failed to fetch routines:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, routines, activeCount, inactiveCount, isOnline, userId]);

  useEffect(() => {
    fetchRoutines(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchRoutines(page + 1, true);
    }
  };

  const resetForm = () => {
    setTitle('');
    setRoutineType('weekly');
    setSelectedDays([]);
    setYearlyInput('');
    setYearlyError('');
    setFormError('');
    setEditingRoutine(null);
    setSelectedCategory('general');
    setCustomCategory('');
    setShowCategoryPicker(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setTitle(routine.routines_title);
    setRoutineType(routine.routine_type);
    setSelectedDays(routine.routines_dates);
    if (routine.routine_type === 'yearly') {
      setYearlyInput(routine.routines_dates.join(', '));
    }
    const existingCat = (routine.routine_category || 'general').toLowerCase();
    if (PRESET_CATEGORIES.includes(existingCat)) {
      setSelectedCategory(existingCat);
      setCustomCategory('');
    } else {
      setSelectedCategory('__other__');
      setCustomCategory(existingCat);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleQuickSelect = (type: 'all' | 'weekdays' | 'weekends' | 'none') => {
    if (type === 'all') setSelectedDays([...ALL_DAYS]);
    else if (type === 'weekdays') setSelectedDays(ALL_DAYS.slice(0, 5));
    else if (type === 'weekends') setSelectedDays(ALL_DAYS.slice(5));
    else setSelectedDays([]);
  };

  const handleYearlyChange = (value: string) => {
    setYearlyInput(value);
    setYearlyError('');

    if (!value.trim()) {
      setSelectedDays([]);
      return;
    }

    const parts = value.split(',').map(s => s.trim()).filter(s => s);
    const validDates: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!/^\d{1,2}-\d{1,2}$/.test(part)) {
        errors.push(`"${part}" invalid format`);
        continue;
      }

      const [monthStr, dayStr] = part.split('-');
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      if (isNaN(month) || month < 1 || month > 12) {
        errors.push(`"${part}" invalid month`);
        continue;
      }

      let maxDay: number;
      if ([1, 3, 5, 7, 8, 10, 12].includes(month)) maxDay = 31;
      else if ([4, 6, 9, 11].includes(month)) maxDay = 30;
      else maxDay = 29;

      if (isNaN(day) || day < 1 || day > maxDay) {
        errors.push(`"${part}" invalid day`);
        continue;
      }

      const paddedMonth = month.toString().padStart(2, '0');
      const paddedDay = day.toString().padStart(2, '0');
      validDates.push(`${paddedMonth}-${paddedDay}`);
    }

    if (errors.length > 0) {
      setYearlyError(errors.join(', '));
    }

    setSelectedDays(validDates);
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!title.trim()) {
      setFormError('Routine title is required');
      return;
    }

    if (selectedDays.length === 0) {
      setFormError('At least one date must be selected');
      return;
    }

    if (routineType === 'yearly' && yearlyError) {
      setFormError('Please fix date format errors');
      return;
    }

    try {
      setFormLoading(true);
      const finalCategory = selectedCategory === '__other__' ? customCategory.trim().toLowerCase() : selectedCategory;
      const payload = {
        routines_title: title,
        routine_type: routineType,
        routines_dates: selectedDays,
        routine_category: finalCategory || 'general',
      };

      if (isOnline) {
        if (editingRoutine) {
          await api.post(`api/update_routine/${editingRoutine.id}/`, payload);
        } else {
          await api.post('api/add_routine/', payload);
        }
      } else {
        if (editingRoutine) {
          await enqueue({
            action: 'update_task',
            endpoint: `api/update_routine/${editingRoutine.id}/`,
            method: 'POST',
            payload,
            taskId: editingRoutine.id,
          });
        } else {
          await enqueue({
            action: 'add_task',
            endpoint: 'api/add_routine/',
            method: 'POST',
            payload,
          });
        }
        await refreshPendingCount();
      }

      closeModal();
      fetchRoutines(1);
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to save routine');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (routine: Routine) => {
    try {
      setActionLoading(routine.id);
      if (isOnline) {
        await api.post(`api/update_routine_status/${routine.id}/`);
      } else {
        await enqueue({
          action: 'toggle_complete',
          endpoint: `api/update_routine_status/${routine.id}/`,
          method: 'POST',
          payload: {},
          taskId: routine.id,
        });
        await refreshPendingCount();
        setRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, status: !r.status } : r));
      }
      if (isOnline) fetchRoutines(1);
    } catch (error) {
      console.error('Failed to toggle routine status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (routine: Routine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.routines_title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(routine.id);
              if (isOnline) {
                await api.post(`api/delete_routine/${routine.id}/`);
              } else {
                await enqueue({
                  action: 'delete_task',
                  endpoint: `api/delete_routine/${routine.id}/`,
                  method: 'POST',
                  payload: {},
                  taskId: routine.id,
                });
                await refreshPendingCount();
                setRoutines(prev => prev.filter(r => r.id !== routine.id));
              }
              if (isOnline) fetchRoutines(1);
            } catch (error) {
              console.error('Failed to delete routine:', error);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleApplyRoutines = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Routines can only be applied while online.');
      return;
    }
    try {
      setApplyLoading(true);
      await api.post('api/apply_routines/');
      Alert.alert('Success', 'Routines applied successfully! Tasks have been created for matching routines.');
    } catch (error) {
      console.error('Failed to apply routines:', error);
      Alert.alert('Error', 'Failed to apply routines. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  const getTypeColor = (type: RoutineType) => {
    switch (type) {
      case 'weekly': return { bg: isDark ? 'rgba(139, 92, 246, 0.2)' : '#F5F3FF', text: isDark ? '#A78BFA' : '#7C3AED' };
      case 'monthly': return { bg: isDark ? 'rgba(14, 165, 233, 0.2)' : '#F0F9FF', text: isDark ? '#38BDF8' : '#0284C7' };
      case 'yearly': return { bg: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF7ED', text: isDark ? '#FB923C' : '#EA580C' };
    }
  };

  const formatDates = (routine: Routine) => {
    const dates = routine.routines_dates;
    if (routine.routine_type === 'weekly') {
      return dates.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
    } else if (routine.routine_type === 'monthly') {
      return dates.slice(0, 5).join(', ') + (dates.length > 5 ? ` +${dates.length - 5}` : '');
    } else {
      return dates.slice(0, 3).join(', ') + (dates.length > 3 ? ` +${dates.length - 3}` : '');
    }
  };

  const renderRoutine = ({ item }: { item: Routine }) => {
    const typeColor = getTypeColor(item.routine_type);
    const isLoading = actionLoading === item.id;

    return (
      <Pressable
        style={({ pressed }: { pressed: boolean }) => [
          styles.routineCard, 
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
          pressed && !isLoading && { transform: [{ scale: 0.985 }] },
        ]}
        onPress={() => openEditModal(item)}
        disabled={isLoading}
      >
        <View style={styles.routineHeader}>
          <View style={styles.routineInfo}>
            <Text style={[styles.routineTitle, { color: colors.text }]} numberOfLines={1}>
              {item.routines_title}
            </Text>
            <View style={styles.routineMeta}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                <Text style={[styles.typeText, { color: typeColor.text }]}>
                  {item.routine_type}
                </Text>
              </View>
              {item.routine_category && item.routine_category !== 'general' && (
                <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.typeText, { color: colors.primary, textTransform: 'capitalize' }]}>
                    {item.routine_category}
                  </Text>
                </View>
              )}
              <Text style={[styles.datesText, { color: colors.textSecondary }]}>
                {formatDates(item)}
              </Text>
            </View>
          </View>

          <View style={styles.routineActions}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: item.status ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9') },
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons
                    name={item.status ? 'checkmark-circle' : 'pause-circle'}
                    size={22}
                    color={item.status ? (isDark ? '#34D399' : '#10B981') : colors.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{totalRoutines}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Total</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statNumber, { color: isDark ? '#34D399' : '#10B981' }]}>{activeCount}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Active</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statNumber, { color: colors.textMuted }]}>{inactiveCount}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Inactive</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="repeat-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Routines Yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Create routines to automatically generate recurring tasks.
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Add Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Grab handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
          </View>

          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingRoutine ? 'Edit Routine' : 'Add Routine'}
            </Text>
            <TouchableOpacity onPress={closeModal} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Routine Title *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
                placeholder="Enter routine title"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Routine Type Tabs */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Routine Type *</Text>
              <View style={[styles.typeTabs, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                {(['weekly', 'monthly', 'yearly'] as RoutineType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeTab,
                      routineType === type && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      setRoutineType(type);
                      setSelectedDays([]);
                      setYearlyInput('');
                      setYearlyError('');
                    }}
                  >
                    <Text
                      style={[
                        styles.typeTabText,
                        { color: routineType === type ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Days Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                {routineType === 'weekly'
                  ? 'Days of the Week'
                  : routineType === 'monthly'
                  ? 'Days of the Month'
                  : 'Specific Dates (MM-DD)'}
              </Text>

              {routineType === 'weekly' && (
                <>
                  <View style={styles.quickSelectRow}>
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'weekdays', label: 'Weekdays' },
                      { key: 'weekends', label: 'Weekends' },
                      { key: 'none', label: 'Clear' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.quickSelectButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                        onPress={() => handleQuickSelect(item.key as any)}
                      >
                        <Text style={[styles.quickSelectText, { color: colors.textSecondary }]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.daysGrid}>
                    {ALL_DAYS.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          selectedDays.includes(day) && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => handleDayToggle(day)}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            { color: selectedDays.includes(day) ? '#FFFFFF' : colors.text },
                          ]}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {routineType === 'monthly' && (
                <View style={styles.monthlyGrid}>
                  {ALL_MONTHLY_DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.monthDayButton,
                        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                        selectedDays.includes(day) && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => handleDayToggle(day)}
                    >
                      <Text
                        style={[
                          styles.monthDayText,
                          { color: selectedDays.includes(day) ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {routineType === 'yearly' && (
                <>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.inputBg, borderColor: yearlyError ? '#EF4444' : colors.inputBorder, color: colors.text },
                    ]}
                    placeholder="e.g., 12-25, 01-01, 06-15"
                    placeholderTextColor={colors.textMuted}
                    value={yearlyInput}
                    onChangeText={handleYearlyChange}
                  />
                  {yearlyError ? (
                    <Text style={styles.errorText}>{yearlyError}</Text>
                  ) : (
                    <Text style={[styles.hintText, { color: colors.textMuted }]}>
                      Format: MM-DD (e.g., 12-25 for Christmas)
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                ]}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                <Text style={[styles.categoryButtonText, { color: colors.text }]}>
                  {selectedCategory === '__other__'
                    ? (customCategory || 'Custom...')
                    : CATEGORY_LABELS[selectedCategory] || selectedCategory}
                </Text>
                <Ionicons
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={[styles.categoryDropdown, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  {PRESET_CATEGORIES.map((cat) => (
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
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
                  </TouchableOpacity>
                </View>
              )}

              {selectedCategory === '__other__' && (
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginTop: 8 },
                  ]}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="Enter custom category"
                  placeholderTextColor={colors.textMuted}
                />
              )}
            </View>

            {formError ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2' }]}>
                <Text style={styles.errorBoxText}>{formError}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.cancelModalButton, { borderColor: colors.cardBorder }]}
              onPress={closeModal}
            >
              <Text style={[styles.cancelModalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }]}
              onPress={handleSubmit}
              disabled={formLoading}
            >
              {formLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingRoutine ? 'Update' : 'Add'} Routine
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Routines</Text>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Recurring task templates
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.applyButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5', borderColor: '#10B981' }]} 
            onPress={handleApplyRoutines}
            disabled={applyLoading}
            activeOpacity={0.7}
          >
            {applyLoading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={isDark ? '#34D399' : '#10B981'} />
                <Text style={[styles.applyButtonText, { color: isDark ? '#34D399' : '#10B981' }]}>Apply</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }]} 
            onPress={openAddModal}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {renderStats()}

      {loading && routines.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutine}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            loading && routines.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}

      {renderModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 4,
  },
  routineCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineInfo: {
    flex: 1,
    marginRight: 12,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  routineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  datesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  typeTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 3,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickSelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickSelectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthDayButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
  },
  errorBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  errorBoxText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 15,
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
