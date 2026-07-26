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
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const router = useRouter();

  const registerUser = async (
    username: string,
    email: string,
    password: string,
    password2: string
  ) => {
    try {
      await axios.post('/api/auth/register/', {
        username,
        email,
        password,
        password2,
      });

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration failed:', error);

      let errorMessage = 'Registration failed';

      const axiosError = error as AxiosError<any>;
      if (axiosError.response?.data?.error) {
        const errorData = axiosError.response.data.error;
        errorMessage = Array.isArray(errorData)
          ? errorData.join(', ')
          : errorData;
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.password2
    ) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await registerUser(
      formData.username,
      formData.email,
      formData.password,
      formData.password2
    );

    if (result.success) {
      await AsyncStorage.setItem('pendingVerificationEmail', formData.email);
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)/email-verify'), 2000);
    } else {
      setError(
        typeof result.error === 'string' ? result.error : 'Registration failed'
      );
    }

    setLoading(false);
  };

  if (success) {
    return (
      <View style={StyleSheet.flatten([styles.successContainer, { backgroundColor: colors.background }])}>
        <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.successIconContainer, { backgroundColor: '#10B981' }]}>
            <Ionicons name="checkmark" size={40} color="#FFF" />
          </View>

          <Text style={[styles.successTitle, { color: colors.primary }]}>Imhotep Tasks</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>Organize Your Productivity</Text>

          <Text style={[styles.successHeading, { color: colors.text }]}>Welcome aboard!</Text>

          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            We've sent a verification code to your email. Redirecting you to enter your code...
          </Text>

          <Link href="/(auth)/email-verify" asChild>
            <TouchableOpacity style={StyleSheet.flatten([styles.successButton, { backgroundColor: colors.primary }])}>
              <Text style={styles.successButtonText}>Verify Email</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

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

          <Text style={[styles.title, { color: colors.text }]}>Join Imhotep Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Organize your work. Achieve more. Stay focused.
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2', borderColor: '#EF4444' }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Choose a username"
                placeholderTextColor={colors.textMuted}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData({ ...formData, username: text });
                  if (error) setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textMuted}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (error) setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Create a strong password"
                placeholderTextColor={colors.textMuted}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textMuted}
                value={formData.password2}
                onChangeText={(text) => {
                  setFormData({ ...formData, password2: text });
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword2}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword2(!showPassword2)}
                style={styles.eyeIcon}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword2 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary, shadowColor: colors.addButtonShadow }, 
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.signInLink, { color: colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  logoContainer: {
    alignItems: 'center',
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
    fontSize: 28,
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
  eyeIcon: {
    paddingRight: 14,
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  successButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});