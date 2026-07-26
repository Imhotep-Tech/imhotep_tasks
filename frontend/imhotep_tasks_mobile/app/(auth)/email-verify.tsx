import React, { useState, useEffect } from 'react';
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
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

type VerificationStatus = 'input' | 'verifying' | 'success' | 'error';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('input');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    };
    loadEmail();
  }, []);

  const verifyEmail = async (otpCode: string, userEmail: string) => {
    try {
      const response = await axios.post('/api/auth/verify-email/', {
        otp: otpCode,
        email: userEmail,
      });
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
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setStatus('verifying');
    setError('');
    setLoading(true);

    const result = await verifyEmail(otp, email);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Your email has been verified successfully!');
      await AsyncStorage.removeItem('pendingVerificationEmail');

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
        return 'Verify Your Email';
      case 'verifying':
        return 'Verifying...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'input':
        return 'Enter the 6-digit OTP code sent to your email. The code expires in 10 minutes.';
      case 'verifying':
        return 'Please wait while we verify your email address.';
      case 'success':
        return message || 'Your email has been verified. Redirecting to login shortly.';
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

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address or Username</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter email or username"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>OTP Code</Text>
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
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }, 
                  (loading || otp.length !== 6 || !email) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || otp.length !== 6 || !email}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Didn't receive the code?{' '}
                <Link href="/(auth)/login" asChild>
                  <Text style={StyleSheet.flatten([styles.linkText, { color: colors.primary }])}>Login to resend</Text>
                </Link>
              </Text>
            </>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>Verifying your credentials...</Text>
            </View>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.button, { backgroundColor: colors.primary }])}>
                  <Text style={styles.buttonText}>Sign In Now</Text>
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
  helpText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '700',
  },
});