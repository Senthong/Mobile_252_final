import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { MOCK_TRANSACTIONS, MOCK_BUDGETS, CATEGORIES, formatCurrency } from '../data/mockData';

const { width } = Dimensions.get('window');

const periods = ['Tháng này', 'Tháng trước', 'Quý 3'];

export default function ReportsScreen() {
  const [activePeriod, setActivePeriod] = useState(0);

  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;

  const catData = CATEGORIES.slice(0, 5).map((cat) => {
    const total = MOCK_TRANSACTIONS
      .filter(t => t.category.id === cat.id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  const maxCat = Math.max(...catData.map(c => c.total), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Báo cáo</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
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

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F5EE' }]}>
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
          <Text style={styles.savingsAmount}>{formatCurrency(savings)}</Text>
          <Text style={styles.savingsGain}>+10% so với tháng trước</Text>
        </View>
        <View style={styles.savingsMeta}>
          <Text style={styles.savingsMetaItem}>Tổng chi: {formatCurrency(totalExpense)}</Text>
          <Text style={styles.savingsMetaItem}>Tổng thu: {formatCurrency(totalIncome)}</Text>
        </View>
      </View>

      {/* Donut Chart Visual */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Phân bổ chi tiêu</Text>
        <View style={styles.donutArea}>
          <View style={styles.donut}>
            <Text style={styles.donutLabel}>Chi tiêu</Text>
            <Text style={styles.donutValue}>100%</Text>
          </View>
        </View>

        {catData.map((cat) => (
          <View key={cat.id} style={styles.catRow}>
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            <Text style={styles.catName}>{cat.name}</Text>
            <View style={styles.catBarBg}>
              <View
                style={[
                  styles.catBar,
                  {
                    width: `${(cat.total / maxCat) * 100}%`,
                    backgroundColor: cat.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.catAmount}>{formatCurrency(cat.total)}</Text>
          </View>
        ))}
      </View>

      {/* AI Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipBadge}>💡 GỢI Ý TÀI CHÍNH</Text>
        <Text style={styles.tipText}>
          Khoản chi cho Mua sắm giảm 12% so với tháng trước. Đang dùng tốt lắm rồi, tiếp tục duy trì để quản lý ngân sách tốt hơn!
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
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
  filterBtn: { padding: 8 },
  filterIcon: { fontSize: 20 },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceGray,
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  periodTabTextActive: { color: '#fff' },

  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    margin: Spacing.lg,
    marginBottom: 0,
  },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  summaryCardLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  summaryCardVal: { fontSize: FontSize.lg, fontWeight: '800' },

  savingsCard: {
    margin: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.sm,
  },
  savingsLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  savingsAmount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginVertical: 4 },
  savingsGain: { fontSize: FontSize.xs, color: Colors.income },
  savingsMeta: {},
  savingsMetaItem: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },

  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },

  donutArea: { alignItems: 'center', marginBottom: Spacing.lg },
  donut: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  donutValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { width: 64, fontSize: FontSize.xs, color: Colors.textSecondary },
  catBarBg: { flex: 1, height: 8, backgroundColor: Colors.surfaceGray, borderRadius: 4, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 4 },
  catAmount: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, width: 90, textAlign: 'right' },

  tipCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipBadge: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  tipText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
});
