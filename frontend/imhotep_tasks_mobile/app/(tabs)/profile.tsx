import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateChecker } from '@/hooks/use-update-checker';
import api from '@/constants/api';
import * as Updates from 'expo-updates';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { checking: checkingUpdates, checkForUpdates } = useUpdateChecker();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToInput = (yOffset: number) => {
    if (Platform.OS === 'android') {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
      }, 100);
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email verification modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [refreshingFrontend, setRefreshingFrontend] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/profile/update/', profileData);

      if (response.data.email_verification_required) {
        setPendingNewEmail(response.data.pending_new_email);
        setShowOtpModal(true);
        setSuccess('A verification code has been sent to your new email address.');
      } else {
        setSuccess(response.data.message || 'Profile updated successfully!');
      }

      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await api.post('/api/profile/verify-email-change/', { otp });

      setShowOtpModal(false);
      setOtp('');
      setSuccess('Email changed successfully! Please log in again with your new email.');

      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || 'Verification failed. Please try again.');
    }

    setOtpLoading(false);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpError('');
    setProfileData(prev => ({ ...prev, email: user?.email || '' }));
  };

  const handlePasswordSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/profile/change-password/', passwordData);
      setSuccess(response.data.message || 'Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRefreshFrontend = async () => {
    setRefreshingFrontend(true);
    try {
      const authEntries = await AsyncStorage.multiGet(['access_token', 'refresh_token', 'user']);
      const authMap = new Map(authEntries);

      if (LegacyFileSystem.cacheDirectory) {
        await LegacyFileSystem.deleteAsync(LegacyFileSystem.cacheDirectory, { idempotent: true });
        await LegacyFileSystem.makeDirectoryAsync(LegacyFileSystem.cacheDirectory, { intermediates: true });
      }

      const restorePairs: [string, string][] = [];
      const access = authMap.get('access_token');
      const refresh = authMap.get('refresh_token');
      const userValue = authMap.get('user');
      if (access) restorePairs.push(['access_token', access]);
      if (refresh) restorePairs.push(['refresh_token', refresh]);
      if (userValue) restorePairs.push(['user', userValue]);
      if (restorePairs.length > 0) {
        await AsyncStorage.multiSet(restorePairs);
      }

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        console.log('Update check failed during refresh:', error);
      }

      Alert.alert(
        'Frontend Refreshed',
        'Cache was cleared and the app will reload now.',
        [{ text: 'OK', onPress: () => Updates.reloadAsync() }]
      );
    } catch (error) {
      console.error('Frontend refresh failed:', error);
      Alert.alert('Error', 'Failed to refresh frontend cache. Please try again.');
    } finally {
      setRefreshingFrontend(false);
    }
  };

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>My Profile</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your account and preferences
            </ThemedText>
          </ThemedView>

          {/* User Avatar Card */}
          <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.avatarRing, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
            <ThemedText style={[styles.userName, { color: colors.text }]}>
              {user?.username || 'User'}
            </ThemedText>
            <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || ''}
            </ThemedText>
          </View>

          {/* Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'profile' && [styles.activeTab, { backgroundColor: colors.primary }],
              ]}
              onPress={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            >
              <ThemedText style={[styles.tabText, { color: activeTab === 'profile' ? '#FFF' : colors.textSecondary }]}>
                Profile Info
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === 'password' && [styles.activeTab, { backgroundColor: colors.primary }],
              ]}
              onPress={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            >
              <ThemedText style={[styles.tabText, { color: activeTab === 'password' ? '#FFF' : colors.textSecondary }]}>
                Security
              </ThemedText>
            </Pressable>
          </View>

          {/* Messages */}
          {error ? (
            <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2', borderColor: '#EF4444' }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <ThemedText style={{ color: '#EF4444', fontWeight: '600', flex: 1 }}>{error}</ThemedText>
            </View>
          ) : null}

          {success ? (
            <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <ThemedText style={{ color: '#10B981', fontWeight: '600', flex: 1 }}>{success}</ThemedText>
            </View>
          ) : null}

          {/* Profile Form */}
          {activeTab === 'profile' && (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>First Name</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={profileData.first_name}
                    onChangeText={(text) => setProfileData({ ...profileData, first_name: text })}
                    placeholder="First name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.halfInput}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>Last Name</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={profileData.last_name}
                    onChangeText={(text) => setProfileData({ ...profileData, last_name: text })}
                    placeholder="Last name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Username *
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  value={profileData.username}
                  onChangeText={(text) => setProfileData({ ...profileData, username: text })}
                  placeholder="Username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Email Address *
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => scrollToInput(350)}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton, 
                  { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }, 
                  loading && styles.buttonDisabled,
                  pressed && !loading && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleProfileSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.buttonText}>Update Profile</ThemedText>
                )}
              </Pressable>
            </View>
          )}

          {/* Password Form */}
          {activeTab === 'password' && (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Current Password *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={passwordData.current_password}
                    onChangeText={(text) => setPasswordData({ ...passwordData, current_password: text })}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPasswords.current}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPasswords.current ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  New Password *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={passwordData.new_password}
                    onChangeText={(text) => setPasswordData({ ...passwordData, new_password: text })}
                    placeholder="New password (min 8 characters)"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPasswords.new}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPasswords.new ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Confirm New Password *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={passwordData.confirm_password}
                    onChangeText={(text) => setPasswordData({ ...passwordData, confirm_password: text })}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPasswords.confirm}
                    onFocus={() => scrollToInput(450)}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPasswords.confirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton, 
                  { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }, 
                  loading && styles.buttonDisabled,
                  pressed && !loading && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={handlePasswordSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.buttonText}>Change Password</ThemedText>
                )}
              </Pressable>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <Pressable 
              style={({ pressed }) => [
                styles.actionCardButton, 
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                pressed && { transform: [{ scale: 0.98 }] },
              ]} 
              onPress={() => checkForUpdates()}
              disabled={checkingUpdates}
            >
              {checkingUpdates ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={22} color={colors.primary} />
                  <ThemedText style={[styles.actionCardText, { color: colors.text }]}>Check for Updates</ThemedText>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionCardButton, 
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleRefreshFrontend}
              disabled={refreshingFrontend}
            >
              {refreshingFrontend ? (
                <ActivityIndicator color="#F59E0B" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
                  <ThemedText style={[styles.actionCardText, { color: colors.text }]}>Clear Cache & Reload</ThemedText>
                </>
              )}
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.logoutButton, 
                pressed && { transform: [{ scale: 0.98 }] },
              ]} 
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#FFF" />
              <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        animationType="slide"
        transparent
        onRequestClose={closeOtpModal}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)' }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Verify Email Change</ThemedText>
              <Pressable onPress={closeOtpModal} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <ThemedText style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Enter the 6-digit OTP code sent to your new email address ({pendingNewEmail}).
              </ThemedText>

              {otpError ? (
                <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2', borderColor: '#EF4444' }]}>
                  <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                  <ThemedText style={{ color: '#EF4444', fontWeight: '600' }}>{otpError}</ThemedText>
                </View>
              ) : null}

              <TextInput
                style={[styles.otpInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/\D/g, ''));
                  if (otpError) setOtpError('');
                }}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.cancelModalButton, { borderColor: colors.cardBorder }]}
                  onPress={closeOtpModal}
                >
                  <ThemedText style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.verifyModalButton,
                    { backgroundColor: colors.primary },
                    (otpLoading || otp.length !== 6) && styles.buttonDisabled,
                  ]}
                  onPress={handleOtpSubmit}
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <ThemedText style={styles.buttonText}>Verify</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  avatarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionsSection: {
    gap: 10,
  },
  actionCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionCardText: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    gap: 8,
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalContent: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 8,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  verifyModalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
});
