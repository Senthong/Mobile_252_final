export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  note: string;
  date: string; // ISO string
  account: string;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'ewallet';
  currency: string;
};

export type Budget = {
  categoryId: string;
  limit: number;
  spent: number;
  month: string; // "YYYY-MM"
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: string;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Overview: undefined;
  Transactions: undefined;
  Reports: undefined;
  Budget: undefined;
  Profile: undefined;
};

export type OverviewStackParamList = {
  OverviewHome: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transaction: Transaction };
};
