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
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import api from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login/', {
        username,
        password,
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.email_verification_required) {
        return {
          success: false,
          needsVerification: true,
          error: err.response?.data?.error || 'Email verification required.',
        };
      }
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check your credentials.',
        info: err.response?.data?.info || '',
      };
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    try {
      setGoogleLoading(true);
      setError('');
      setInfo('');

      const response = await api.get('/api/auth/google/url/', { params: { platform: 'mobile' } });
      const authUrl = response.data.auth_url;

      if (authUrl) {
        const urlWithMobileFlag = authUrl.includes('?')
          ? `${authUrl}&mobile=true`
          : `${authUrl}?mobile=true`;

        const result = await WebBrowser.openAuthSessionAsync(urlWithMobileFlag, 'imhotep-tasks://');
        if (result.type === 'success' && result.url) {
          const parsed = Linking.parse(result.url);
          const params = parsed.queryParams;

          if (params?.access && params?.refresh && params?.user) {
            let userData = params.user as string;
            try {
              userData = JSON.parse(decodeURIComponent(params.user as string));
            } catch (e) {
              try {
                userData = JSON.parse(params.user as string);
              } catch (err) {}
            }

            await login({
              access: params.access as string,
              refresh: params.refresh as string,
              user: userData,
            });
            router.replace('/(tabs)');
          }
        }
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError('Google authentication failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    const result = await loginUser(formData.username, formData.password);

    if (result.success && result.data) {
      await login(result.data);
      router.replace('/(tabs)');
    } else {
      if (result.needsVerification) {
        await AsyncStorage.setItem('pendingVerificationEmail', formData.username);
        setInfo('Please verify your email. A verification code has been sent.');
        setTimeout(() => router.push('/(auth)/email-verify'), 2000);
      } else {
        setError(result.error || 'Login failed');
        if (result.info) {
          setInfo(result.info);
        }
      }
    }

    setLoading(false);
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
          {/* Logo & Header */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
              <Image
                source={require('@/assets/images/imhotep_tasks.png')}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.primary }]}>Imhotep Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Organize Your Productivity</Text>
          
          <Text style={[styles.formHeading, { color: colors.text }]}>Welcome back</Text>

          {/* Alert Messages */}
          {error ? (
            <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2', borderColor: '#EF4444' }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontWeight: '600', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {info ? (
            <View style={[styles.messageBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF', borderColor: '#3B82F6' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
              <Text style={{ color: '#3B82F6', fontWeight: '600', flex: 1 }}>{info}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username or Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter username or email"
                placeholderTextColor={colors.textMuted}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData({ ...formData, username: text });
                  if (error) setError('');
                  if (info) setInfo('');
                }}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.forgotPassword, { color: colors.primary }]}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (error) setError('');
                  if (info) setInfo('');
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
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign up</Text>
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: '600',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});