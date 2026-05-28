import { Transaction, Category, Account, Budget, User } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Ăn uống', icon: '🍜', color: '#FF6B6B' },
  { id: 'transport', name: 'Di chuyển', icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: '#45B7D1' },
  { id: 'housing', name: 'Nhà cửa', icon: '🏠', color: '#96CEB4' },
  { id: 'health', name: 'Sức khỏe', icon: '❤️', color: '#FFEAA7' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#DDA0DD' },
  { id: 'salary', name: 'Lương', icon: '💰', color: '#98FB98' },
  { id: 'other', name: 'Khác', icon: '📦', color: '#B0C4DE' },
];

export const ACCOUNTS: Account[] = [
  { id: 'cash', name: 'Tiền mặt', balance: 2500000, type: 'cash', currency: 'VND' },
  { id: 'vcb', name: 'Vietcombank', balance: 28780000, type: 'bank', currency: 'VND' },
  { id: 'momo', name: 'MoMo', balance: 14000000, type: 'ewallet', currency: 'VND' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 35000,
    type: 'expense',
    category: CATEGORIES[0],
    note: 'Cà phê Highlands',
    date: new Date().toISOString(),
    account: 'cash',
  },
  {
    id: '2',
    amount: 1240000,
    type: 'expense',
    category: CATEGORIES[4],
    note: 'Tiền điện tháng 10',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    account: 'vcb',
  },
  {
    id: '3',
    amount: 25000000,
    type: 'income',
    category: CATEGORIES[6],
    note: 'Lương tháng 10',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    account: 'vcb',
  },
  {
    id: '4',
    amount: 150000,
    type: 'expense',
    category: CATEGORIES[0],
    note: 'Bữa trưa văn phòng',
    date: new Date(Date.now() - 3600000 * 25).toISOString(),
    account: 'cash',
  },
  {
    id: '5',
    amount: 450000,
    type: 'expense',
    category: CATEGORIES[2],
    note: 'Mua sắm cuối tuần',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    account: 'momo',
  },
  {
    id: '6',
    amount: 85000,
    type: 'expense',
    category: CATEGORIES[1],
    note: 'Grab tháng này',
    date: new Date(Date.now() - 3600000 * 50).toISOString(),
    account: 'momo',
  },
  {
    id: '7',
    amount: 200000,
    type: 'expense',
    category: CATEGORIES[5],
    note: 'Netflix + Spotify',
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    account: 'vcb',
  },
];

export const MOCK_BUDGETS: Budget[] = [
  { categoryId: 'food', limit: 3000000, spent: 2200000, month: '2023-10' },
  { categoryId: 'transport', limit: 1000000, spent: 650000, month: '2023-10' },
  { categoryId: 'shopping', limit: 2000000, spent: 1800000, month: '2023-10' },
  { categoryId: 'entertainment', limit: 500000, spent: 200000, month: '2023-10' },
  { categoryId: 'health', limit: 800000, spent: 120000, month: '2023-10' },
];

export const MOCK_USER: User = {
  id: 'user1',
  name: 'Alexander Sterling',
  email: 'alex@example.com',
  tier: 'HẠNG TINH HOA',
};

export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'Vừa xong';
  if (diffHours < 24) return `Hôm nay, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (diffHours < 48) return 'Hôm qua';

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
