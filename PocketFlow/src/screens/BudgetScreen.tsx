import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { MOCK_BUDGETS, CATEGORIES, formatCurrency } from '../data/mockData';

export default function BudgetScreen() {
  const [showFilter, setShowFilter] = useState(false);

  const totalBudget = MOCK_BUDGETS.reduce((s, b) => s + b.limit, 0);
  const totalSpent = MOCK_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Ngân sách</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <Text style={styles.avatarBtnText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* Total Budget Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TỔNG NGÂN SÁCH HÀNG THÁNG</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalBudget)}</Text>
        <View style={styles.totalBar}>
          <View style={styles.totalBarFill}>
            <View
              style={[
                styles.totalBarProgress,
                { width: `${(totalSpent / totalBudget) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.totalMetaRow}>
          <Text style={styles.totalMeta}>💰 {formatCurrency(totalSpent)} đã dùng</Text>
          <Text style={styles.totalMeta}>📦 {formatCurrency(remaining)} còn lại</Text>
        </View>
      </View>

      {/* Add category */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionSubtitle}>HỆ THỐNG QUẢN LÝ</Text>
          <Text style={styles.sectionTitle}>Danh mục chi tiêu</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>➕ Thêm danh mục mới</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Items */}
      {MOCK_BUDGETS.map((budget) => {
        const cat = CATEGORIES.find(c => c.id === budget.categoryId)!;
        const pct = (budget.spent / budget.limit) * 100;
        const isOver = pct > 85;
        return (
          <BudgetItem
            key={budget.categoryId}
            icon={cat?.icon || '📦'}
            name={cat?.name || budget.categoryId}
            color={cat?.color || Colors.primary}
            spent={budget.spent}
            limit={budget.limit}
            pct={pct}
            isOver={isOver}
          />
        );
      })}

      {/* Tip Banner */}
      <View style={styles.tipBanner}>
        <Text style={styles.tipBannerBadge}>💡 MẸO QUẢN LÝ</Text>
        <Text style={styles.tipBannerText}>
          Việc phân loại chi tiết giúp bạn hiểu rõ hơn về tài chính và tự động hóa các khoản chi không cần thiết.
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function BudgetItem({
  icon, name, color, spent, limit, pct, isOver
}: {
  icon: string; name: string; color: string;
  spent: number; limit: number; pct: number; isOver: boolean;
}) {
  const barColor = pct > 90 ? Colors.error : pct > 70 ? Colors.warning : Colors.income;

  return (
    <View style={styles.budgetItem}>
      <View style={styles.budgetItemHeader}>
        <View style={[styles.budgetItemIcon, { backgroundColor: color + '22' }]}>
          <Text style={styles.budgetItemEmoji}>{icon}</Text>
        </View>
        <View style={styles.budgetItemInfo}>
          <Text style={styles.budgetItemName}>{name}</Text>
          <Text style={styles.budgetItemMeta}>
            {Math.round(pct * 10) / 10}% ngân sách đã dùng
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.budgetItemAmt, { color: barColor }]}>{formatCurrency(spent)}</Text>
          <Text style={styles.budgetItemLimit}>/ {formatCurrency(limit)}</Text>
        </View>
      </View>
      <View style={styles.budgetBar}>
        <View
          style={[
            styles.budgetBarFill,
            { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
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
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  avatarBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },

  totalCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, letterSpacing: 0.5, marginBottom: 4 },
  totalAmount: { color: '#fff', fontSize: FontSize.xxl + 4, fontWeight: '800', marginBottom: 16 },
  totalBar: { marginBottom: 10 },
  totalBarFill: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalBarProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  totalMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalMeta: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },

  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1, fontWeight: '600', marginBottom: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },

  budgetItem: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  budgetItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  budgetItemIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetItemEmoji: { fontSize: 22 },
  budgetItemInfo: { flex: 1 },
  budgetItemName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  budgetItemMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  budgetItemAmt: { fontSize: FontSize.base, fontWeight: '700' },
  budgetItemLimit: { fontSize: FontSize.xs, color: Colors.textMuted },

  budgetBar: {
    height: 6,
    backgroundColor: Colors.surfaceGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBarFill: { height: '100%', borderRadius: 3 },

  tipBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: '#1A1F2E',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  tipBannerBadge: { fontSize: FontSize.xs, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  tipBannerText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
});
