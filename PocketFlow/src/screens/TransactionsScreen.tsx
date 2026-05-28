import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { formatCurrency, formatDate } from '../data/mockData';
import { Transaction } from '../types';
import { getTransactions } from '../services/transactionsService';

export default function TransactionsScreen() {
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<'all' | 'income' | 'expense'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);

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

  const filtered = transactions.filter((t) => {
    const matchSearch = t.note?.toLowerCase().includes(search.toLowerCase()) ?? true;
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giao dịch</Text>
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

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <TxCard tx={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>{search ? '🔍' : '💳'}</Text>
              <Text style={styles.emptyText}>
                {search ? 'Không tìm thấy giao dịch' : 'Chưa có giao dịch nào'}
              </Text>
              {!search && (
                <Text style={styles.emptyHint}>Thêm giao dịch từ màn hình Tổng quan</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

function TxCard({ tx }: { tx: Transaction }) {
  return (
    <TouchableOpacity style={styles.txCard} activeOpacity={0.85}>
      <View style={[styles.txIcon, { backgroundColor: (tx.category?.color ?? '#ccc') + '22' }]}>
        <Text style={styles.txEmoji}>{tx.category?.icon ?? '📦'}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txNote}>{tx.note}</Text>
        <Text style={styles.txMeta}>{tx.category?.name ?? ''} • {formatDate(tx.date)}</Text>
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
    padding: Spacing.lg, paddingTop: 56, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },

  searchRow: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: '#fff', paddingBottom: Spacing.md,
  },
  searchInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceGray, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchText: { flex: 1, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.text },

  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: '#fff', paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.surfaceGray,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },

  loader: { paddingTop: 80, alignItems: 'center' },
  list: { padding: Spacing.lg, gap: 10 },

  txCard: {
    backgroundColor: '#fff', borderRadius: Radius.xl,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.sm,
  },
  txIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txNote: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  txMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  txAmount: { fontSize: FontSize.base, fontWeight: '700' },
  txAccount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 64 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '600' },
  emptyHint: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 6 },
});
