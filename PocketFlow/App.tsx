// App.tsx  ← THAY THẾ file cũ
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Colors, FontSize } from './src/utils/theme';
import { isAuthenticated, logout } from './src/services/authService';

import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import OverviewScreen from './src/screens/OverviewScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';

type AppScreen = 'loading' | 'onboarding' | 'auth' | 'main';
type TabScreen = 'overview' | 'transactions' | 'reports' | 'budget' | 'profile';

const TABS: { id: TabScreen; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Tổng quan', icon: '🏠' },
  { id: 'transactions', label: 'Giao dịch', icon: '💳' },
  { id: 'reports',      label: 'Báo cáo',   icon: '📊' },
  { id: 'budget',       label: 'Ngân sách', icon: '💰' },
  { id: 'profile',      label: 'Hồ sơ',     icon: '👤' },
];

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('loading');
  const [activeTab, setActiveTab] = useState<TabScreen>('overview');
  const [showAddTx, setShowAddTx] = useState(false);

  // Kiểm tra token đã lưu khi khởi động app
  useEffect(() => {
    async function checkAuth() {
      const loggedIn = await isAuthenticated();
      setAppScreen(loggedIn ? 'main' : 'onboarding');
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await logout();
    setAppScreen('auth');
  }

  // Màn hình loading
  if (appScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🏦</Text>
        <Text style={styles.loadingTitle}>PocketFlow</Text>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (appScreen === 'onboarding') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <OnboardingScreen onFinish={() => setAppScreen('auth')} />
      </>
    );
  }

  if (appScreen === 'auth') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <AuthScreen onLogin={() => setAppScreen('main')} />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewScreen onAddTransaction={() => setShowAddTx(true)} />;
      case 'transactions': return <TransactionsScreen />;
      case 'reports':      return <ReportsScreen />;
      case 'budget':       return <BudgetScreen />;
      case 'profile':      return <ProfileScreen onLogout={handleLogout} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>{renderTab()}</View>

      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, isActive && styles.tabIconActive]}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={showAddTx}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddTx(false)}
      >
        <AddTransactionScreen
          onClose={() => setShowAddTx(false)}
          onSave={() => setShowAddTx(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  loadingLogo: { fontSize: 56 },
  loadingTitle: { fontSize: 28, fontWeight: '800', color: Colors.primary, marginTop: 12 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingBottom: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: '#F0F2F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 12,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIconWrapper: {
    width: 40, height: 32, alignItems: 'center',
    justifyContent: 'center', borderRadius: 16,
  },
  tabIconActive: { backgroundColor: Colors.primaryLight },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: FontSize.xs - 1, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
  tabLabelActive: { color: Colors.primary, fontWeight: '700' },
});
