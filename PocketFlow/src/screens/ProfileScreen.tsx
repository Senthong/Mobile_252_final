import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { getMe } from '../services/authService';
import { User } from '../types';

interface Props {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: Props) {
  const [user, setUser]             = useState<User | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync]     = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch {
      // giữ null, hiện placeholder
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const avatarLetters = user?.name
    ? user.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : '?';

  function confirmLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: onLogout },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        {!loading && (
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{avatarLetters}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{avatarLetters}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name ?? 'Người dùng'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>

            {user?.tier ? (
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>⭐ {user.tier}</Text>
              </View>
            ) : null}

            {user?.phone ? (
              <Text style={styles.profilePhone}>📱 {user.phone}</Text>
            ) : null}

            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>✏️  Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Account info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>THÔNG TIN TÀI KHOẢN</Text>
            <InfoRow icon="📧" label="Email" value={user?.email ?? '—'} />
            <InfoRow icon="👤" label="Tên"   value={user?.name  ?? '—'} />
            {user?.phone && <InfoRow icon="📱" label="Điện thoại" value={user.phone} />}
          </View>

          {/* Settings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>CÀI ĐẶT</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Thông báo</Text>
                <Text style={styles.settingSubtitle}>Nhắc nhở chi tiêu và ngân sách</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🔄</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Đồng bộ tự động</Text>
                <Text style={styles.settingSubtitle}>Luôn cập nhật dữ liệu mới nhất</Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingIcon}>🔒</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Đổi mật khẩu</Text>
                <Text style={styles.settingSubtitle}>Cập nhật mật khẩu tài khoản</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingIcon}>📄</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Chính sách bảo mật</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
            <Text style={styles.logoutBtnText}>↩  Đăng xuất</Text>
          </TouchableOpacity>

          <Text style={styles.version}>POCKETFLOW • v1.0.0</Text>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingInfo}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, paddingTop: 56, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },

  loader: { paddingTop: 80, alignItems: 'center' },

  profileCard: {
    margin: Spacing.lg, backgroundColor: '#fff',
    borderRadius: Radius.xl, padding: Spacing.lg,
    alignItems: 'center', ...Shadow.sm,
  },
  profileAvatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.sm,
  },
  profileAvatarText: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800' },
  profileName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  profilePhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  tierBadge: {
    backgroundColor: Colors.primaryLight, paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: Radius.full, marginBottom: Spacing.sm,
  },
  tierText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  editBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: Radius.full, marginTop: Spacing.sm,
  },
  editBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },

  sectionCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, marginTop: 1 },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  settingIcon: { fontSize: 20, marginRight: 12, width: 28, textAlign: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  settingSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 22, color: Colors.textMuted },

  logoutBtn: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    backgroundColor: '#FEF2F2', borderRadius: Radius.xl,
    paddingVertical: 16, alignItems: 'center',
  },
  logoutBtnText: { color: Colors.error, fontSize: FontSize.base, fontWeight: '700' },

  version: {
    textAlign: 'center', marginTop: Spacing.lg,
    fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 0.5,
  },
});
