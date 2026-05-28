// src/screens/AddTransactionScreen.tsx  ← THAY THẾ file cũ
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../utils/theme';
import { createTransaction } from '../services/transactionsService';
import { getAccounts } from '../services/accountsService';
import { getCategories } from '../services/budgetsService';
import { Account, Category, TransactionType } from '../types';

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function AddTransactionScreen({ onClose, onSave }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, accs] = await Promise.all([getCategories(), getAccounts()]);
        setCategories(cats);
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccount(accs[0]);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu');
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, []);

  async function handleSave() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('Lỗi', 'Vui lòng chọn tài khoản');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        amount: Number(amount),
        type,
        category_id: selectedCategory.id,
        account_id: selectedAccount.id,
        note,
        date: new Date().toISOString(),
      });
      onSave();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu giao dịch');
    } finally {
      setLoading(false);
    }
  }

  if (fetchingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelBtn}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thêm giao dịch</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.primary} />
            : <Text style={styles.saveBtn}>Lưu</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Income / Expense toggle */}
        <View style={styles.typeRow}>
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'expense' ? '💸 Chi tiêu' : '💰 Thu nhập'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Số tiền</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.currency}>VND</Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionLabel}>Danh mục</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                selectedCategory?.id === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catName, selectedCategory?.id === cat.id && { color: cat.color, fontWeight: '700' }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Accounts */}
        <Text style={styles.sectionLabel}>Tài khoản</Text>
        <View style={styles.accountRow}>
          {accounts.map(acc => (
            <TouchableOpacity
              key={acc.id}
              style={[styles.accChip, selectedAccount?.id === acc.id && styles.accChipActive]}
              onPress={() => setSelectedAccount(acc)}
            >
              <Text style={styles.accName}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.sectionLabel}>Ghi chú</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Thêm ghi chú..."
          placeholderTextColor={Colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: '#fff',
  },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  cancelBtn: { fontSize: FontSize.base, color: Colors.textSecondary },
  saveBtn: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '700' },
  body: { padding: Spacing.md, gap: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontWeight: '600', color: Colors.textSecondary },
  typeBtnTextActive: { color: '#fff' },
  amountBox: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  amountLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  amountInput: {
    fontSize: 36, fontWeight: '800', color: Colors.text, textAlign: 'center', width: '100%',
  },
  currency: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.sm },
  categoryScroll: { marginVertical: 8 },
  catChip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: '#fff', marginRight: 8,
  },
  catIcon: { fontSize: 22 },
  catName: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  accountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  accChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  accChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  accName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  noteInput: {
    backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.text, minHeight: 80, textAlignVertical: 'top',
    marginTop: 8,
  },
});
