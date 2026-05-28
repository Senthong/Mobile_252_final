import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import {
  MOCK_TRANSACTIONS,
  ACCOUNTS,
  formatCurrency,
  formatDate,
} from '../data/mockData';
import { Transaction } from '../types';

interface Props {
  onAddTransaction: () => void;
}

export default function OverviewScreen({ onAddTransaction }: Props) {
  const [aiInput, setAiInput] = useState('');
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const monthExpense = MOCK_TRANSACTIONS
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const aiSuggestions = ['Cà phê 35k', 'Ăn trưa 50k', 'Taxi 75k', 'Siêu thị 200k'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.name}>Alexander</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Tổng số dư</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceGain}>▲ +12%</Text>
          <View style={styles.accountsBadge}>
            <Text style={styles.accountsBadgeText}>🏦 {ACCOUNTS.length} Tài khoản</Text>
          </View>
        </View>
      </View>

      {/* AI Input */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>Nhập liệu thông minh</Text>
        <View style={styles.aiInputRow}>
          <TextInput
            style={styles.aiInput}
            placeholder="Nhập nhanh bằng AI (vd: cà phê 35k)"
            placeholderTextColor={Colors.textMuted}
            value={aiInput}
            onChangeText={setAiInput}
          />
          <TouchableOpacity style={styles.aiSendBtn} onPress={onAddTransaction}>
            <Text style={styles.aiSendIcon}>▶</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.suggestRow}>
            {aiSuggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestChip} onPress={() => setAiInput(s)}>
                <Text style={styles.suggestChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Monthly Spend */}
      <View style={styles.spendSection}>
        <View style={styles.spendRow}>
          <View>
            <Text style={styles.spendLabel}>Chi tiêu tháng này</Text>
            <Text style={styles.spendAmount}>{formatCurrency(monthExpense)}</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>85%</Text>
          </View>
        </View>

        <View style={styles.spendCats}>
          {[
            { label: 'Vui chơi', amount: 4200000, icon: '🎮' },
            { label: 'Ăn uống', amount: 3150000, icon: '🍜' },
          ].map((c, i) => (
            <View key={i} style={styles.spendCat}>
              <Text style={styles.spendCatIcon}>{c.icon}</Text>
              <Text style={styles.spendCatLabel}>{c.label}</Text>
              <Text style={styles.spendCatAmt}>{formatCurrency(c.amount)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.txSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {MOCK_TRANSACTIONS.slice(0, 5).map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </View>

      {/* FAB */}
      <View style={{ height: 32 }} />
      <TouchableOpacity style={styles.fab} onPress={onAddTransaction} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: tx.category.color + '22' }]}>
        <Text style={styles.txIconEmoji}>{tx.category.icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txNote}>{tx.note}</Text>
        <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.income : Colors.expense }]}>
        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
      </Text>
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
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },
  avatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },

  balanceCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: FontSize.xxxl - 4, fontWeight: '800', marginBottom: 12 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceGain: { color: Colors.accentLight, fontSize: FontSize.sm, fontWeight: '600' },
  accountsBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  accountsBadgeText: { color: '#fff', fontSize: FontSize.xs },

  aiSection: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  aiInputRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.sm },
  aiInput: {
    flex: 1,
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  aiSendBtn: {
    width: 44, height: 44,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSendIcon: { color: '#fff', fontSize: 16 },
  suggestRow: { flexDirection: 'row', gap: 8 },
  suggestChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  suggestChipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  spendSection: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  spendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  spendLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  spendAmount: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  progressCircle: {
    width: 60, height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  spendCats: { flexDirection: 'row', gap: 12 },
  spendCat: {
    flex: 1,
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  spendCatIcon: { fontSize: 22, marginBottom: 4 },
  spendCatLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  spendCatAmt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },

  txSection: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  txIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txNote: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  txDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: FontSize.base, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
