import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { MOCK_TRANSACTIONS, formatCurrency, formatDate } from '../data/mockData';
import { Transaction } from '../types';

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    const matchSearch = t.note.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giao dịch</Text>
        <TouchableOpacity style={styles.filterIconBtn}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="Tìm kiếm giao dịch..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterBtnText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'expense', 'income'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'Tất cả' : f === 'expense' ? 'Chi phí' : 'Thu nhập'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TxCard tx={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Không tìm thấy giao dịch</Text>
          </View>
        }
      />
    </View>
  );
}

function TxCard({ tx }: { tx: Transaction }) {
  return (
    <TouchableOpacity style={styles.txCard} activeOpacity={0.85}>
      <View style={[styles.txIcon, { backgroundColor: tx.category.color + '22' }]}>
        <Text style={styles.txEmoji}>{tx.category.icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txNote}>{tx.note}</Text>
        <Text style={styles.txMeta}>{tx.category.name} • {formatDate(tx.date)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.income : Colors.expense }]}>
          {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
        </Text>
        <Text style={styles.txAccount}>{tx.account}</Text>
      </View>
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
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  filterIconBtn: { padding: 8 },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#fff',
    paddingBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchText: { flex: 1, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.text },
  filterBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  filterBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#fff',
    paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceGray,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },

  list: { padding: Spacing.lg, gap: 10 },

  txCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.sm,
  },
  txIcon: {
    width: 46, height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txNote: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  txMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  txAmount: { fontSize: FontSize.base, fontWeight: '700' },
  txAccount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 64 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
