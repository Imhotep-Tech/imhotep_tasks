import { Platform } from 'react-native';

const primaryIndigoLight = '#4F46E5';
const primaryIndigoDark = '#6366F1';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: 'rgba(226, 232, 240, 0.8)',
    inputBg: 'rgba(241, 245, 249, 0.9)',
    inputBorder: '#E2E8F0',
    tint: primaryIndigoLight,
    primary: primaryIndigoLight,
    primaryLight: 'rgba(79, 70, 229, 0.08)',
    accent: '#8B5CF6',
    icon: '#64748B',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryIndigoLight,
    addButton: primaryIndigoLight,
    addButtonShadow: 'rgba(79, 70, 229, 0.35)',
    skeletonBg: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#080C14',
    card: '#0F172A',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    inputBg: 'rgba(15, 23, 42, 0.8)',
    inputBorder: '#1E293B',
    tint: primaryIndigoDark,
    primary: primaryIndigoDark,
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    accent: '#A78BFA',
    icon: '#94A3B8',
    tabBar: '#0D1117',
    tabBarBorder: '#1E293B',
    tabIconDefault: '#64748B',
    tabIconSelected: primaryIndigoDark,
    addButton: primaryIndigoDark,
    addButtonShadow: 'rgba(99, 102, 241, 0.45)',
    skeletonBg: '#1E293B',
  },
};

export const CategoryColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  general: { bg: '#EFF6FF', text: '#2563EB', darkBg: 'rgba(37, 99, 235, 0.2)', darkText: '#60A5FA' },
  work: { bg: '#F0FDF4', text: '#16A34A', darkBg: 'rgba(22, 163, 74, 0.2)', darkText: '#4ADE80' },
  personal: { bg: '#FDF2F8', text: '#DB2777', darkBg: 'rgba(219, 39, 119, 0.2)', darkText: '#F472B6' },
  shopping: { bg: '#FFF7ED', text: '#EA580C', darkBg: 'rgba(234, 88, 12, 0.2)', darkText: '#FB923C' },
  health: { bg: '#F5F3FF', text: '#7C3AED', darkBg: 'rgba(124, 58, 237, 0.2)', darkText: '#A78BFA' },
};

export const PriorityColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  high: { bg: '#FEF2F2', text: '#DC2626', darkBg: 'rgba(220, 38, 38, 0.2)', darkText: '#F87171' },
  medium: { bg: '#FFFBEB', text: '#D97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#FBBF24' },
  low: { bg: '#F0FDF4', text: '#16A34A', darkBg: 'rgba(22, 163, 74, 0.2)', darkText: '#4ADE80' },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
