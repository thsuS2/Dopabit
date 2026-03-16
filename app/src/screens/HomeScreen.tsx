import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { api } from '../services/api';
import { authStore } from '../stores/authStore';
import { Routine, ROUTINE_CONFIGS, LEVEL_CONFIGS } from '../types';
import DopabitCharacter from '../components/DopabitCharacter';
import ScreenLayout from '../components/ScreenLayout';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLevelName(level: number): string {
  const found = [...LEVEL_CONFIGS].reverse().find((c) => level >= c.level);
  return found?.name || '시작';
}

function getRoutineLabel(type: string): { label: string; emoji: string } {
  const found = ROUTINE_CONFIGS.find((c) => c.type === type);
  return found ? { label: found.label, emoji: found.emoji } : { label: type, emoji: '📌' };
}

export default function HomeScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [profile, setProfile] = useState({ level: 1, streak: 0, total_score: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const today = getToday();

  const fetchData = useCallback(async () => {
    try {
      const [routineData, profileData] = await Promise.all([
        api.get<Routine[]>(`/api/routines/today/${today}`),
        api.get<{ level: number; streak: number; total_score: number }>('/api/records/streak'),
      ]);
      setRoutines(routineData);
      setProfile(profileData);
    } catch {}
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleRoutine = async (routine: Routine) => {
    const newCompleted = !routine.completed;
    setRoutines((prev) =>
      prev.map((r) => (r.id === routine.id ? { ...r, completed: newCompleted } : r))
    );

    try {
      await api.put('/api/routines/toggle', {
        routine_id: routine.id,
        completed: newCompleted,
      });
      const profileData = await api.get<{ level: number; streak: number; total_score: number }>('/api/records/streak');
      setProfile(profileData);
    } catch {
      setRoutines((prev) =>
        prev.map((r) => (r.id === routine.id ? { ...r, completed: !newCompleted } : r))
      );
    }
  };

  const completedScore = routines.filter((r) => r.completed).reduce((sum, r) => sum + r.score, 0);
  const totalScore = routines.reduce((sum, r) => sum + r.score, 0);

  const renderRoutine = ({ item }: { item: Routine }) => {
    const { label, emoji } = getRoutineLabel(item.type);
    return (
      <TouchableOpacity
        style={[styles.routineItem, item.completed && styles.routineCompleted]}
        onPress={() => toggleRoutine(item)}
        activeOpacity={0.7}
      >
        <View style={styles.routineLeft}>
          <Text style={styles.routineEmoji}>{emoji}</Text>
          <Text style={[styles.routineLabel, item.completed && styles.routineLabelDone]}>
            {label}
          </Text>
        </View>
        <View style={styles.routineRight}>
          <Text style={[styles.routineScore, item.completed && styles.routineScoreDone]}>
            +{item.score}
          </Text>
          <Text style={styles.checkBox}>{item.completed ? '✅' : '⬜'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout title="도파빗">
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            <View style={styles.profileCard}>
              <DopabitCharacter
                level={profile.level}
                completedRatio={totalScore > 0 ? completedScore / totalScore : 0}
                streak={profile.streak}
              />
              <View style={styles.profileTop}>
                <View>
                  <Text style={styles.levelText}>
                    Lv{profile.level} {getLevelName(profile.level)}
                  </Text>
                  <Text style={styles.nickname}>{authStore.getUser()?.nickname || '도파빗 유저'}</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {profile.streak}일 연속</Text>
                </View>
              </View>

              <View style={styles.scoreBar}>
                <View style={styles.scoreBarBg}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { width: totalScore > 0 ? `${(completedScore / totalScore) * 100}%` : '0%' },
                    ]}
                  />
                </View>
                <Text style={styles.scoreText}>
                  오늘 {completedScore} / {totalScore}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>오늘의 루틴</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
  },
  profileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  nickname: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 4,
  },
  streakBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  scoreBar: {
    marginTop: 16,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  scoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  routineItem: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineCompleted: {
    backgroundColor: colors.success + '10',
  },
  routineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routineEmoji: {
    fontSize: 24,
  },
  routineLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  routineLabelDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  routineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routineScore: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  routineScoreDone: {
    color: colors.textTertiary,
  },
  checkBox: {
    fontSize: 20,
  },
});
