import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { CATEGORIES, formatCurrency } from '../data/mockData';
import { Transaction } from '../types';
import { getTransactions } from '../services/transactionsService';

const periods = ['Tháng này', 'Tháng trước', 'Quý này'];

export default function ReportsScreen() {
  const [activePeriod, setActivePeriod]   = useState(0);
  const [transactions, setTransactions]   = useState<Transaction[]>([]);
  const [loading, setLoading]             = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const txRes = await getTransactions();
      setTransactions(txRes.data ?? []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings      = totalIncome - totalExpense;

  const catData = CATEGORIES.map((cat) => {
    const total = transactions
      .filter(t => t.category?.id === cat.id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  const maxCat = Math.max(...catData.map(c => c.total), 1);

  const isEmpty = transactions.length === 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo</Text>
      </View>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {periods.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.periodTab, activePeriod === i && styles.periodTabActive]}
            onPress={() => setActivePeriod(i)}
          >
            <Text style={[styles.periodTabText, activePeriod === i && styles.periodTabTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu báo cáo</Text>
          <Text style={styles.emptyHint}>Thêm giao dịch để xem báo cáo tài chính</Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#FDECEA' }]}>
              <Text style={styles.summaryCardLabel}>Tổng chi</Text>
              <Text style={[styles.summaryCardVal, { color: Colors.expense }]}>{formatCurrency(totalExpense)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#E3F9EE' }]}>
              <Text style={styles.summaryCardLabel}>Tổng thu</Text>
              <Text style={[styles.summaryCardVal, { color: Colors.income }]}>{formatCurrency(totalIncome)}</Text>
            </View>
          </View>

          {/* Savings */}
          <View style={styles.savingsCard}>
            <View>
              <Text style={styles.savingsLabel}>TIẾT KIỆM</Text>
              <Text style={[styles.savingsAmount, { color: savings >= 0 ? Colors.income : Colors.expense }]}>
                {formatCurrency(Math.abs(savings))}
              </Text>
              <Text style={[styles.savingsGain, { color: savings >= 0 ? Colors.income : Colors.expense }]}>
                {savings >= 0 ? '✅ Dương' : '⚠️ Âm'}
              </Text>
            </View>
            <View>
              <Text style={styles.savingsMetaItem}>Chi: {formatCurrency(totalExpense)}</Text>
              <Text style={styles.savingsMetaItem}>Thu: {formatCurrency(totalIncome)}</Text>
            </View>
          </View>

          {/* Category breakdown */}
          {catData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Phân bổ chi tiêu theo danh mục</Text>
              {catData.map((cat) => (
                <View key={cat.id} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catName}>{cat.name}</Text>
                  <View style={styles.catBarBg}>
                    <View
                      style={[
                        styles.catBar,
                        { width: `${(cat.total / maxCat) * 100}%`, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.catAmount}>{formatCurrency(cat.total)}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { padding: Spacing.lg, paddingTop: 56, backgroundColor: '#fff' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },

  periodRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 8,
  },
  periodTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surfaceGray },
  periodTabActive: { backgroundColor: Colors.primary },
  periodTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  periodTabTextActive: { color: '#fff' },

  loader: { paddingTop: 80, alignItems: 'center' },

  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: FontSize.sm, color: Colors.textMuted },

  summaryRow: { flexDirection: 'row', gap: Spacing.md, margin: Spacing.lg, marginBottom: 0 },
  summaryCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md },
  summaryCardLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  summaryCardVal: { fontSize: FontSize.lg, fontWeight: '800' },

  savingsCard: {
    margin: Spacing.lg, backgroundColor: '#fff', borderRadius: Radius.xl,
    padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', ...Shadow.sm,
  },
  savingsLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  savingsAmount: { fontSize: FontSize.xxl, fontWeight: '800', marginVertical: 4 },
  savingsGain: { fontSize: FontSize.xs },
  savingsMetaItem: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },

  chartCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { width: 72, fontSize: FontSize.xs, color: Colors.textSecondary },
  catBarBg: { flex: 1, height: 8, backgroundColor: Colors.surfaceGray, borderRadius: 4, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 4 },
  catAmount: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, width: 90, textAlign: 'right' },
});
