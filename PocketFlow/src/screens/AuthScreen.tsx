// src/screens/AuthScreen.tsx  ← THAY THẾ file cũ
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { login, register } from '../services/authService';

interface Props {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', password: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);

  const update = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  async function handleSubmit() {
    if (!form.email || !form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    if (mode === 'register') {
      if (!form.fullName) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
        return;
      }
      if (form.password !== form.confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          dob: form.dob || undefined,
        });
      }
      onLogin();
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Có lỗi xảy ra, thử lại sau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>🏦</Text>
            <Text style={styles.logoText}>PocketFlow</Text>
          </View>
          <Text style={styles.headerTitle}>{mode === 'login' ? 'Welcome' : 'Create Account'}</Text>
        </View>

        <View style={styles.card}>
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={Colors.textMuted}
                value={form.fullName}
                onChangeText={v => update('fullName', v)}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{mode === 'login' ? 'Email' : 'Email'}</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => update('email', v)}
            />
          </View>

          {mode === 'register' && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+84 123 456 789"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={v => update('phone', v)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Date Of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={Colors.textMuted}
                  value={form.dob}
                  onChangeText={v => update('dob', v)}
                />
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPwd}
                value={form.password}
                onChangeText={v => update('password', v)}
              />
              <TouchableOpacity onPress={() => setShowPwd(s => !s)} style={styles.eyeBtn}>
                <Text>{showPwd ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPwd}
                value={form.confirmPassword}
                onChangeText={v => update('confirmPassword', v)}
              />
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Login' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Log in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },
  headerBg: {
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.xl },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  headerTitle: { fontSize: FontSize.xxl + 4, fontWeight: '800', color: '#fff' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    ...Shadow.md,
  },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  pwdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  forgotBtn: { alignSelf: 'center', marginBottom: Spacing.lg },
  forgotText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  switchText: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md },
  switchLink: { color: Colors.primary, fontWeight: '600' },
});
