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
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios, { AxiosError } from 'axios';
import { useAuth } from '@/contexts/AuthContext';

type VerificationStatus = 'input' | 'verifying' | 'success' | 'error';

export default function EmailChangeVerificationScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('input');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);

  const verifyEmailChange = async (otpCode: string) => {
    try {
      const response = await axios.post(
        '/api/profile/verify-email-change/',
        { otp: otpCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Verification failed. Please try again.',
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

      // Log out user since email changed
      await logout();

      // Start countdown
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

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <View style={[styles.iconCircle, styles.iconCircleBlue]}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconCircle, styles.iconCircleGreen]}>
            <Ionicons name="checkmark" size={24} color="#16A34A" />
          </View>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'input':
        return 'Verify Email Change';
      case 'verifying':
        return 'Updating...';
      case 'success':
        return 'Email Updated';
      case 'error':
        return 'Update Failed';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'input':
        return 'Enter the 6-digit verification code sent to your new email address. The code expires in 10 minutes.';
      case 'verifying':
        return 'Please wait while we update your email address.';
      case 'success':
        return message || 'Your email has been updated. You will be redirected to login shortly.';
      case 'error':
        return message;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/imhotep_tasks.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          {(status === 'verifying' || status === 'success') && (
            <View style={styles.statusIconContainer}>{getIcon()}</View>
          )}

          {/* Input Form */}
          {status === 'input' && (
            <>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
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
                style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email Change</Text>
                )}
              </TouchableOpacity>

              {/* Cancel Link */}
              <Link href="/(tabs)" asChild>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Processing update...</Text>
            </View>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Log In Again</Text>
                </TouchableOpacity>
              </Link>
              {countdown > 0 && (
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownText}>
                    Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Support Link */}
          <Text style={styles.supportText}>Need help? Contact support</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  statusIconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleBlue: {
    backgroundColor: '#EFF6FF',
  },
  iconCircleGreen: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleRed: {
    backgroundColor: '#FEE2E2',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  countdownBox: {
    marginTop: 16,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  countdownText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  helpText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  supportText: {
    marginTop: 24,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});