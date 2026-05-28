import { Category } from '../types';

// CATEGORIES giữ nguyên vì đây là dữ liệu cấu hình, không phải mock
export const CATEGORIES: Category[] = [
  { id: 'food',          name: 'Ăn uống',   icon: '🍜', color: '#FF6B6B' },
  { id: 'transport',     name: 'Di chuyển', icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping',      name: 'Mua sắm',   icon: '🛍️', color: '#45B7D1' },
  { id: 'housing',       name: 'Nhà cửa',   icon: '🏠', color: '#96CEB4' },
  { id: 'health',        name: 'Sức khỏe',  icon: '❤️', color: '#FFEAA7' },
  { id: 'entertainment', name: 'Giải trí',  icon: '🎮', color: '#DDA0DD' },
  { id: 'salary',        name: 'Lương',     icon: '💰', color: '#98FB98' },
  { id: 'other',         name: 'Khác',      icon: '📦', color: '#B0C4DE' },
];

// Tất cả mock data đã bị xóa:
// ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_USER
// → dữ liệu thật lấy từ API (services/)

export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1)  return 'Vừa xong';
  if (diffHours < 24) return `Hôm nay, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (diffHours < 48) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
