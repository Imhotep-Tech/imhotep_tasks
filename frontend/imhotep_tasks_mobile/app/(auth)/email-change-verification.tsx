import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  useColorScheme,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/constants/api';
import { Colors } from '@/constants/theme';

type VerificationStatus = 'input' | 'verifying' | 'success' | 'error';

export default function EmailChangeVerificationScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('input');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);

  const verifyEmailChange = async (otpCode: string) => {
    try {
      const response = await api.post('/api/profile/verify-email-change/', { otp: otpCode });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || 'Verification failed. Please try again.',
      };
    }
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setStatus('verifying');
    setError('');
    setLoading(true);

    const result = await verifyEmailChange(otp);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Your email has been changed successfully!');
      await logout();

      let count = 5;
      const timerId = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timerId);
          router.replace('/(auth)/login');
        }
      }, 1000);
    } else {
      setStatus('input');
      setError(result.error || 'Verification failed');
    }

    setLoading(false);
  };

  const getTitle = () => {
    switch (status) {
      case 'input':
        return 'Verify Email Change';
      case 'verifying':
        return 'Updating...';
      case 'success':
        return 'Email Updated!';
      case 'error':
        return 'Update Failed';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'input':
        return 'Enter the 6-digit verification code sent to your new email address.';
      case 'verifying':
        return 'Please wait while we update your email address.';
      case 'success':
        return message || 'Your email has been updated. Redirecting to login shortly.';
      case 'error':
        return message;
    }
  };

  return (
    <KeyboardAvoidingView
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
              <Image
                source={require('@/assets/images/imhotep_tasks.png')}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{getSubtitle()}</Text>

          {/* Input Form */}
          {status === 'input' && (
            <>
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2', borderColor: '#EF4444' }]}>
                  <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.otpInput, { color: colors.text }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text.replace(/\D/g, ''));
                      if (error) setError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }, 
                  (loading || otp.length !== 6) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || otp.length !== 6}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email Change</Text>
                )}
              </TouchableOpacity>

              {/* Cancel Link */}
              <Link href="/(tabs)" asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.cancelButton, { borderColor: colors.cardBorder }])} activeOpacity={0.7}>
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>Updating your email address...</Text>
            </View>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.button, { backgroundColor: colors.primary }])}>
                  <Text style={styles.buttonText}>Log In Again</Text>
                </TouchableOpacity>
              </Link>
              {countdown > 0 && (
                <View style={[styles.countdownBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5', borderColor: '#10B981' }]}>
                  <Text style={[styles.countdownText, { color: '#10B981' }]}>
                    Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    width: '100%',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countdownBox: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    width: '100%',
  },
  countdownText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});