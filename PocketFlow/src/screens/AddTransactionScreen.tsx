import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, TextInput,
  Animated, Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../utils/theme';
import { createTransaction } from '../services/transactionsService';
import { getAccounts } from '../services/accountsService';
import { getCategories } from '../services/budgetsService';
import { CATEGORIES } from '../data/mockData';
import { Account, Category, TransactionType } from '../types';
import { formatCurrency } from '../data/mockData';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Custom Numpad ────────────────────────────────────────────
const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['.','0','⌫'],
];

function NumPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function press(key: string) {
    if (key === '⌫') {
      onChange(value.length > 1 ? value.slice(0, -1) : '0');
      return;
    }
    // chặn nhiều dấu chấm
    if (key === '.' && value.includes('.')) return;
    // chặn quá 2 chữ số thập phân
    const dotIdx = value.indexOf('.');
    if (dotIdx !== -1 && value.length - dotIdx > 2) return;
    // thay 0 ban đầu
    const next = value === '0' && key !== '.' ? key : value + key;
    // giới hạn 12 ký tự
    if (next.length > 12) return;
    onChange(next);
  }

  return (
    <View style={numStyles.pad}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={numStyles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[numStyles.key, key === '⌫' && numStyles.keyDel]}
              onPress={() => press(key)}
              activeOpacity={0.6}
            >
              <Text style={[numStyles.keyText, key === '⌫' && numStyles.keyDelText]}>
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const numStyles = StyleSheet.create({
  pad: { backgroundColor: '#F5F7FA', paddingBottom: 8, paddingTop: 4 },
  row: { flexDirection: 'row' },
  key: {
    flex: 1, paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
    margin: 2, borderRadius: Radius.md,
  },
  keyDel: { backgroundColor: '#FEF2F2' },
  keyText: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.text },
  keyDelText: { fontSize: FontSize.xl, color: Colors.error },
});

// ─── Main Screen ──────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function AddTransactionScreen({ onClose, onSave }: Props) {
  const [type, setType]                     = useState<TransactionType>('expense');
  const [amount, setAmount]                 = useState('0');
  const [note, setNote]                     = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount]   = useState<Account | null>(null);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [accounts, setAccounts]             = useState<Account[]>([]);
  const [loading, setLoading]               = useState(false);
  const [fetchingData, setFetchingData]     = useState(true);
  const [step, setStep]                     = useState<'amount' | 'detail'>('amount');

  // animation slide
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const goToDetail = () => {
    if (amount === '0' || Number(amount) <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền trước');
      return;
    }
    Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 60 }).start();
    setStep('detail');
  };

  const goBack = () => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60 }).start();
    setStep('amount');
  };

  const loadData = useCallback(async () => {
    try {
      setFetchingData(true);
      const [cats, accs] = await Promise.all([
        getCategories().catch(() => CATEGORIES),   // fallback về local nếu API lỗi
        getAccounts(),
      ]);
      setCategories(cats.length > 0 ? cats : CATEGORIES);
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccount(accs[0]);
    } catch {
      setCategories(CATEGORIES);
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSave() {
    if (!selectedCategory) { Alert.alert('Lỗi', 'Vui lòng chọn danh mục'); return; }
    if (!selectedAccount)  { Alert.alert('Lỗi', 'Vui lòng chọn tài khoản'); return; }

    setLoading(true);
    try {
      await createTransaction({
        amount: Number(amount),
        type,
        category_id: selectedCategory.id,
        account_id: selectedAccount.id,
        note: note.trim(),
        date: new Date().toISOString(),
      });
      onSave();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu giao dịch');
    } finally {
      setLoading(false);
    }
  }

  // màu theo loại giao dịch
  const typeColor = type === 'expense' ? Colors.expense : Colors.income;
  const amountDisplay = Number(amount) > 0
    ? formatCurrency(Number(amount))
    : '0đ';

  if (fetchingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={step === 'amount' ? onClose : goBack} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>{step === 'amount' ? 'Hủy' : '‹ Quay lại'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm giao dịch</Text>
        {step === 'detail' ? (
          <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerBtn}>
            {loading
              ? <ActivityIndicator color={Colors.primary} size="small" />
              : <Text style={[styles.headerBtnSave]}>Lưu ✓</Text>}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* ── Type Toggle ── */}
      <View style={styles.typeRow}>
        {(['expense', 'income'] as TransactionType[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && {
              backgroundColor: t === 'expense' ? Colors.expense : Colors.income,
              borderColor: t === 'expense' ? Colors.expense : Colors.income,
            }]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
              {t === 'expense' ? '💸 Chi tiêu' : '💰 Thu nhập'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── STEP 1: Amount + NumPad ── */}
      {step === 'amount' && (
        <View style={styles.amountStep}>
          {/* Display */}
          <View style={styles.amountDisplay}>
            <Text style={styles.amountLabel}>Nhập số tiền</Text>
            <Text style={[styles.amountValue, { color: typeColor }]} numberOfLines={1} adjustsFontSizeToFit>
              {amountDisplay}
            </Text>
            {/* raw number small */}
            {Number(amount) > 0 && (
              <Text style={styles.amountRaw}>{amount} VND</Text>
            )}
          </View>

          {/* Numpad */}
          <NumPad value={amount} onChange={setAmount} />

          {/* Next button */}
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: typeColor }]} onPress={goToDetail}>
            <Text style={styles.nextBtnText}>Tiếp theo ›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 2: Detail ── */}
      {step === 'detail' && (
        <ScrollView style={styles.detailStep} contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>

          {/* Amount summary */}
          <View style={[styles.amountSummaryCard, { borderLeftColor: typeColor }]}>
            <Text style={styles.amountSummaryLabel}>{type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}</Text>
            <Text style={[styles.amountSummaryValue, { color: typeColor }]}>{amountDisplay}</Text>
          </View>

          {/* Category */}
          <Text style={styles.sectionLabel}>Danh mục *</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => {
              const active = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catItem, active && { backgroundColor: cat.color + '25', borderColor: cat.color }]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catName, active && { color: cat.color, fontWeight: '700' }]}>
                    {cat.name}
                  </Text>
                  {active && <View style={[styles.catCheck, { backgroundColor: cat.color }]}><Text style={styles.catCheckText}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Account */}
          <Text style={styles.sectionLabel}>Tài khoản *</Text>
          <View style={styles.accountRow}>
            {accounts.map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accChip, selectedAccount?.id === acc.id && styles.accChipActive]}
                onPress={() => setSelectedAccount(acc)}
              >
                <Text style={styles.accIcon}>
                  {acc.type === 'cash' ? '💵' : acc.type === 'bank' ? '🏦' : '📱'}
                </Text>
                <Text style={[styles.accName, selectedAccount?.id === acc.id && styles.accNameActive]}>
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text style={styles.sectionLabel}>Ghi chú</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Thêm ghi chú (tùy chọn)..."
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: typeColor }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>💾  Lưu giao dịch</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  headerBtn: { minWidth: 72 },
  headerBtnText: { fontSize: FontSize.base, color: Colors.textSecondary },
  headerBtnSave: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '700', textAlign: 'right' },

  typeRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  typeBtnText: { fontWeight: '600', color: Colors.textSecondary, fontSize: FontSize.sm },
  typeBtnTextActive: { color: '#fff' },

  // ── Step 1: Amount ──
  amountStep: { flex: 1 },
  amountDisplay: {
    backgroundColor: '#fff', alignItems: 'center',
    paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg,
  },
  amountLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  amountValue: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  amountRaw: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  nextBtn: {
    marginHorizontal: Spacing.md, marginVertical: Spacing.sm,
    paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  // ── Step 2: Detail ──
  detailStep: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  amountSummaryCard: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 4, marginBottom: Spacing.md, ...Shadow.sm,
  },
  amountSummaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  amountSummaryValue: { fontSize: FontSize.xl, fontWeight: '800' },

  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    marginBottom: Spacing.sm, marginTop: Spacing.md,
  },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: {
    width: (SCREEN_W - Spacing.md * 2 - 8 * 3) / 4,
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: '#fff', position: 'relative',
  },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catName: { fontSize: FontSize.xs - 1, color: Colors.textSecondary, textAlign: 'center' },
  catCheck: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  catCheckText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  accountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  accChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  accIcon: { fontSize: 16 },
  accName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  accNameActive: { color: '#fff' },

  noteInput: {
    backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.text, minHeight: 80,
    textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.border,
  },

  saveBtn: {
    marginTop: Spacing.lg, paddingVertical: 16,
    borderRadius: Radius.lg, alignItems: 'center', ...Shadow.md,
  },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
