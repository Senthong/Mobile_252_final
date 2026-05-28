import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../utils/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Đạt mục tiêu tài chính',
    description: 'Thiết lập các kế hoạch tiết kiệm và theo dõi lộ trình hướng tới tương lai thịnh vượng.',
    emoji: '📈',
    bg: '#E8F5EE',
  },
  {
    id: 2,
    title: 'Nhập liệu nhanh với AI',
    description: 'Chỉ cần nhập một dòng văn bản đơn giản, AI sẽ tự động phân loại giao dịch cho bạn.',
    emoji: '✨',
    bg: '#E8F0FE',
    badge: 'AI PROCESSING',
  },
  {
    id: 3,
    title: 'Quản lý chi tiêu thông minh',
    description: 'Theo dõi mọi giao dịch và kiểm soát dòng tiền của bạn một cách dễ dàng và chính xác.',
    emoji: '📊',
    bg: '#E3F2FD',
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🏦</Text>
          <Text style={styles.logoText}>PocketFlow</Text>
        </View>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={[styles.imageContainer, { backgroundColor: slide.bg }]}>
              {slide.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{slide.badge}</Text>
                </View>
              )}
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.button} onPress={goNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Bắt đầu ngay →' : 'Tiếp tục →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  skip: { fontSize: FontSize.base, color: Colors.textSecondary },

  slide: { width, paddingHorizontal: Spacing.lg },
  imageContainer: {
    height: 220,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  emoji: { fontSize: 80 },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },

  button: {
    marginHorizontal: Spacing.lg,
    marginBottom: 48,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
