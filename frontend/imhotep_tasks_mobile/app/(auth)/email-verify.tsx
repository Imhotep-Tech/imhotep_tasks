import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios, { AxiosError } from 'axios';

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function EmailVerificationScreen() {
  const { uid, token } = useLocalSearchParams<{ uid: string; token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const verifyEmail = async () => {
      try {
        await axios.post('/api/auth/verify-email/', { uid, token });
        setStatus('success');
        setMessage('Your email has been verified successfully!');

        timerId = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerId) clearInterval(timerId);
              router.replace('/(auth)/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        setStatus('error');
        const axiosError = error as AxiosError<any>;
        setMessage(
          axiosError.response?.data?.error ||
            'The verification link is invalid or has expired.'
        );
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [uid, token, router]);

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
      case 'error':
        return (
          <View style={[styles.iconCircle, styles.iconCircleRed]}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
          </View>
        );
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified';
      case 'error':
        return 'Verification Failed';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'verifying':
        return 'Please wait while we verify your email address.';
      case 'success':
        return message || 'Your email has been verified. Redirecting to login shortly.';
      case 'error':
        return message;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="checkmark-done" size={32} color="#2563EB" />
          </View>
        </View>

        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* Status Icon */}
        <View style={styles.statusIconContainer}>{getIcon()}</View>

        {/* Progress Bar (verifying) */}
        {status === 'verifying' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>Processing verification...</Text>
          </View>
        )}

        {/* Action Button */}
        {status !== 'verifying' && (
          <Link
            href={status === 'success' ? '/(auth)/login' : '/(auth)/register'}
            asChild
          >
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>
                {status === 'success' ? 'Back to Login' : 'Register'}
              </Text>
            </TouchableOpacity>
          </Link>
        )}

        {/* Countdown Message */}
        {status === 'success' && countdown > 0 && (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownText}>
              Redirecting to login in {countdown} second
              {countdown !== 1 ? 's' : ''}...
            </Text>
          </View>
        )}

        {/* Error Help Text */}
        {status === 'error' && (
          <Text style={styles.helpText}>
            If this problem persists, try registering again or contact support.
          </Text>
        )}

        {/* Support Link */}
        <Text style={styles.supportText}>
          Need help? Contact support
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
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