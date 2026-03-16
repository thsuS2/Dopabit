import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { api } from '../services/api';
import { Weight } from '../types';
import ScreenLayout from '../components/ScreenLayout';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function RecordScreen() {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [streak, setStreak] = useState({ streak: 0, total_score: 0, level: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [weightData, streakData] = await Promise.all([
        api.get<Weight[]>('/api/records/weights'),
        api.get<{ streak: number; total_score: number; level: number }>('/api/records/streak'),
      ]);
      setWeights(weightData);
      setStreak(streakData);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const submitWeight = async () => {
    const value = parseFloat(weightInput);
    if (isNaN(value) || value < 20 || value > 300) {
      Alert.alert('알림', '올바른 체중을 입력해주세요 (20~300kg)');
      return;
    }

    try {
      await api.post('/api/records/weights', {
        date: getToday(),
        weight: value,
      });
      setWeightInput('');
      fetchData();
    } catch {
      Alert.alert('오류', '오늘 체중이 이미 기록되어 있습니다');
    }
  };

  // 간단한 텍스트 기반 그래프
  const maxWeight = weights.length > 0 ? Math.max(...weights.map((w) => w.weight)) : 0;
  const minWeight = weights.length > 0 ? Math.min(...weights.map((w) => w.weight)) : 0;
  const range = maxWeight - minWeight || 1;

  return (
    <ScreenLayout title="기록">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* 스트릭 카드 */}
        <View style={styles.streakCard}>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>🔥 {streak.streak}</Text>
            <Text style={styles.streakLabel}>연속 일수</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>⭐ {streak.total_score}</Text>
            <Text style={styles.streakLabel}>총 점수</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>🏅 Lv{streak.level}</Text>
            <Text style={styles.streakLabel}>레벨</Text>
          </View>
        </View>

        {/* 체중 입력 */}
        <Text style={styles.sectionTitle}>체중 기록</Text>
        <View style={styles.weightInputCard}>
          <TextInput
            style={styles.weightInput}
            placeholder="오늘 체중 (kg)"
            placeholderTextColor={colors.textTertiary}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.weightButton} onPress={submitWeight}>
            <Text style={styles.weightButtonText}>기록</Text>
          </TouchableOpacity>
        </View>

        {/* 체중 그래프 (텍스트 바 차트) */}
        {weights.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>체중 변화</Text>
            {weights.slice(0, 14).reverse().map((w) => {
              const barWidth = range > 0 ? ((w.weight - minWeight) / range) * 100 : 50;
              return (
                <View key={w.id} style={styles.chartRow}>
                  <Text style={styles.chartDate}>{formatDate(w.date)}</Text>
                  <View style={styles.chartBarBg}>
                    <View style={[styles.chartBarFill, { width: `${Math.max(barWidth, 10)}%` }]} />
                  </View>
                  <Text style={styles.chartValue}>{w.weight}kg</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 최근 체중 기록 */}
        {weights.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.chartTitle}>최근 기록</Text>
            {weights.slice(0, 7).map((w) => (
              <View key={w.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{w.date}</Text>
                <Text style={styles.historyValue}>{w.weight} kg</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  streakCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  weightInputCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    flex: 1,
    ...typography.bodyMedium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  weightButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  weightButtonText: {
    ...typography.labelMedium,
    color: colors.textWhite,
  },
  chartCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  chartTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  chartDate: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 36,
  },
  chartBarBg: {
    flex: 1,
    height: 16,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  chartValue: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    width: 52,
    textAlign: 'right',
  },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  historyDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  historyValue: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
});
