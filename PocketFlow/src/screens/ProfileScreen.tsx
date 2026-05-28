import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { MOCK_USER } from '../data/mockData';

interface Props {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kiến trúc sư Tài chính</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <Text style={styles.avatarBtnText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>AS</Text>
        </View>
        <Text style={styles.profileName}>{MOCK_USER.name}</Text>
        <Text style={styles.profileEmail}>{MOCK_USER.email}</Text>

        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>⭐ {MOCK_USER.tier}</Text>
        </View>

        <TouchableOpacity style={styles.manageBtn}>
          <Text style={styles.manageBtnText}>ĐÃ QUẢN LÝ DANH MỤC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Security */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>BẢO MẬT TÀI KHOẢN</Text>
        <SettingRow icon="🔒" title="Xác thực hai yếu tố" subtitle="Đã tắt • Đang dùng bảo mật SMS" hasArrow />
        <SettingRow icon="👤" title="Đăng nhập sinh trắc học" subtitle="Face ID đang hoạt động" hasArrow />
      </View>

      {/* Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>TÙY CHỌN</Text>
        <SettingRow icon="🔔" title="Tùy chọn thông báo" subtitle="Cài đặt cảnh báo thông minh" hasArrow />
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <Text>🌐</Text>
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Cài đặt Tiền tệ/Giao diện</Text>
            <Text style={styles.settingSubtitle}>USD $ • Chế độ tối tùy chọn</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <Text>🔄</Text>
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Đồng bộ hóa tự động</Text>
            <Text style={styles.settingSubtitle}>Luôn cập nhật từ giờ tới đoái mới nhất</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>QUYỀN RIÊNG TƯ & TRỢ GIÚP</Text>
        <SettingRow icon="📄" title="Chính sách quyền riêng tư" subtitle="Cập nhật lần cuối 1h.10.2023" hasArrow />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>↩ Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>KIẾN TRÚC SƯ TÀI CHÍNH • V2.4.1</Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function SettingRow({ icon, title, subtitle, hasArrow }: {
  icon: string; title: string; subtitle?: string; hasArrow?: boolean
}) {
  return (
    <TouchableOpacity style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 56,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  avatarBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: { fontWeight: '700', color: Colors.text },

  profileCard: {
    margin: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  profileAvatar: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  profileAvatarText: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  profileName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  tierBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: 8,
  },
  tierText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  manageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  manageBtnText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  editBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },

  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingIcon: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  settingSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 20, color: Colors.textMuted },

  logoutBtn: {
    marginHorizontal: Spacing.lg,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoutBtnText: { color: Colors.error, fontSize: FontSize.md, fontWeight: '700' },

  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
