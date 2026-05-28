import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { CATEGORIES, formatCurrency } from '../data/mockData';
import { Budget } from '../types';
import { getBudgets } from '../services/budgetsService';

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBudgets();
      setBudgets(data);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining   = totalBudget - totalSpent;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Ngân sách</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : budgets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💰</Text>
          <Text style={styles.emptyTitle}>Chưa có ngân sách nào</Text>
          <Text style={styles.emptyHint}>Nhấn "Thêm danh mục mới" để bắt đầu</Text>
        </View>
      ) : (
        <>
          {/* Total Budget Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TỔNG NGÂN SÁCH HÀNG THÁNG</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalBudget)}</Text>
            <View style={styles.totalBar}>
              <View style={styles.totalBarFill}>
                <View
                  style={[
                    styles.totalBarProgress,
                    { width: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.totalMetaRow}>
              <Text style={styles.totalMeta}>💰 {formatCurrency(totalSpent)} đã dùng</Text>
              <Text style={styles.totalMeta}>📦 {formatCurrency(remaining)} còn lại</Text>
            </View>
          </View>

          {/* Budget Items */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục chi tiêu</Text>
          </View>

          {budgets.map((budget) => {
            const cat = CATEGORIES.find(c => c.id === budget.categoryId);
            const pct = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            return (
              <BudgetItem
                key={budget.categoryId}
                icon={cat?.icon ?? '📦'}
                name={cat?.name ?? budget.categoryId}
                color={cat?.color ?? Colors.primary}
                spent={budget.spent}
                limit={budget.limit}
                pct={pct}
              />
            );
          })}
        </>
      )}

      {/* Add button always visible */}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>➕ Thêm danh mục mới</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function BudgetItem({ icon, name, color, spent, limit, pct }: {
  icon: string; name: string; color: string;
  spent: number; limit: number; pct: number;
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
          <Text style={styles.budgetItemMeta}>{Math.round(pct * 10) / 10}% ngân sách đã dùng</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.budgetItemAmt, { color: barColor }]}>{formatCurrency(spent)}</Text>
          <Text style={styles.budgetItemLimit}>/ {formatCurrency(limit)}</Text>
        </View>
      </View>
      <View style={styles.budgetBar}>
        <View style={[styles.budgetBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    padding: Spacing.lg, paddingTop: 56, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },

  loader: { paddingTop: 80, alignItems: 'center' },

  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: FontSize.sm, color: Colors.textMuted },

  totalCard: {
    margin: Spacing.lg, backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.lg,
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, letterSpacing: 0.5, marginBottom: 4 },
  totalAmount: { color: '#fff', fontSize: FontSize.xxl + 4, fontWeight: '800', marginBottom: 16 },
  totalBar: { marginBottom: 10 },
  totalBarFill: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  totalBarProgress: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  totalMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalMeta: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },

  sectionHeader: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },

  addBtn: {
    backgroundColor: Colors.primary, marginHorizontal: Spacing.lg,
    marginTop: Spacing.md, paddingVertical: 14,
    borderRadius: Radius.lg, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },

  budgetItem: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm,
  },
  budgetItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  budgetItemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  budgetItemEmoji: { fontSize: 22 },
  budgetItemInfo: { flex: 1 },
  budgetItemName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  budgetItemMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  budgetItemAmt: { fontSize: FontSize.base, fontWeight: '700' },
  budgetItemLimit: { fontSize: FontSize.xs, color: Colors.textMuted },

  budgetBar: { height: 6, backgroundColor: Colors.surfaceGray, borderRadius: 3, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 3 },
});
