import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { api } from '../services/api';
import { authStore } from '../stores/authStore';
import { LEVEL_CONFIGS } from '../types';
import ScreenLayout from '../components/ScreenLayout';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
} from '../services/notifications';

interface Profile {
  id: string;
  email: string;
  nickname: string;
  level: number;
  streak: number;
  total_score: number;
}

const HOUR_OPTIONS = [6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 21];

function getLevelName(level: number): string {
  const found = [...LEVEL_CONFIGS].reverse().find((c) => level >= c.level);
  return found?.name || '시작';
}

function getNextLevel(totalScore: number) {
  const next = LEVEL_CONFIGS.find((c) => c.minScore > totalScore);
  return next || null;
}

export default function MyPageScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(9);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get<Profile>('/api/users/me');
      setProfile(data);
      setNicknameInput(data.nickname);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProfile();
    loadNotificationSettings();
  }, [fetchProfile]);

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotifEnabled(settings.enabled);
    setNotifHour(settings.hour);
  };

  const toggleNotification = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한', '설정에서 알림 권한을 허용해주세요.');
        return;
      }
    }
    setNotifEnabled(value);
    await saveNotificationSettings({ enabled: value, hour: notifHour, minute: 0 });
  };

  const changeNotifHour = async (hour: number) => {
    setNotifHour(hour);
    if (notifEnabled) {
      await saveNotificationSettings({ enabled: true, hour, minute: 0 });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const saveNickname = async () => {
    if (!nicknameInput.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요');
      return;
    }
    try {
      await api.put('/api/users/me', { nickname: nicknameInput.trim() });
      setEditing(false);
      fetchProfile();
    } catch {
      Alert.alert('오류', '닉네임 변경에 실패했습니다');
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => authStore.signOut() },
    ]);
  };

  const nextLevel = profile ? getNextLevel(profile.total_score) : null;
  const currentLevelConfig = profile
    ? [...LEVEL_CONFIGS].reverse().find((c) => profile.total_score >= c.minScore)
    : null;
  const progressToNext =
    nextLevel && currentLevelConfig
      ? ((profile!.total_score - currentLevelConfig.minScore) /
          (nextLevel.minScore - currentLevelConfig.minScore)) *
        100
      : 100;

  return (
    <ScreenLayout title="마이페이지">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {profile && (
          <>
            {/* 프로필 카드 */}
            <View style={styles.profileCard}>
              <Text style={styles.avatar}>🐰</Text>

              {editing ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.editInput}
                    value={nicknameInput}
                    onChangeText={setNicknameInput}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.editSaveBtn} onPress={saveNickname}>
                    <Text style={styles.editSaveText}>저장</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditing(false)}>
                    <Text style={styles.editCancelText}>취소</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Text style={styles.nickname}>{profile.nickname} ✏️</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.email}>{profile.email}</Text>
            </View>

            {/* 레벨 카드 */}
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>
                  Lv{profile.level} {getLevelName(profile.level)}
                </Text>
                {nextLevel && (
                  <Text style={styles.nextLevel}>
                    다음: Lv{nextLevel.level} {nextLevel.name}
                  </Text>
                )}
              </View>

              <View style={styles.levelBarBg}>
                <View style={[styles.levelBarFill, { width: `${Math.min(progressToNext, 100)}%` }]} />
              </View>

              {nextLevel && (
                <Text style={styles.levelProgress}>
                  {profile.total_score} / {nextLevel.minScore} 점
                </Text>
              )}
            </View>

            {/* 통계 카드 */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.total_score}</Text>
                <Text style={styles.statLabel}>총 점수</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.streak}</Text>
                <Text style={styles.statLabel}>연속 일수</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>레벨</Text>
              </View>
            </View>

            {/* 알림 설정 */}
            <View style={styles.notifCard}>
              <Text style={styles.sectionTitle}>알림 설정</Text>

              <View style={styles.notifRow}>
                <View>
                  <Text style={styles.notifLabel}>루틴 리마인더</Text>
                  <Text style={styles.notifDesc}>매일 정해진 시간에 알림</Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={toggleNotification}
                  trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                  thumbColor={notifEnabled ? colors.primary : colors.textTertiary}
                />
              </View>

              {notifEnabled && (
                <View style={styles.timeSelector}>
                  <Text style={styles.timeSelectorLabel}>알림 시간</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                    {HOUR_OPTIONS.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[styles.timeChip, notifHour === hour && styles.timeChipActive]}
                        onPress={() => changeNotifHour(hour)}
                      >
                        <Text style={[styles.timeChipText, notifHour === hour && styles.timeChipTextActive]}>
                          {hour < 12 ? `오전 ${hour}시` : hour === 12 ? '낮 12시' : `오후 ${hour - 12}시`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 레벨 목록 */}
            <View style={styles.levelListCard}>
              <Text style={styles.sectionTitle}>레벨 시스템</Text>
              {LEVEL_CONFIGS.map((config) => (
                <View
                  key={config.level}
                  style={[
                    styles.levelRow,
                    profile.level >= config.level && styles.levelRowActive,
                  ]}
                >
                  <Text style={styles.levelRowLevel}>Lv{config.level}</Text>
                  <Text style={styles.levelRowName}>{config.name}</Text>
                  <Text style={styles.levelRowScore}>{config.minScore}점~</Text>
                  {profile.level >= config.level && <Text style={styles.levelRowCheck}>✅</Text>}
                </View>
              ))}
            </View>

            {/* 로그아웃 */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </>
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
  profileCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  nickname: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  editSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editSaveText: {
    ...typography.labelSmall,
    color: colors.textWhite,
  },
  editCancelText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  levelCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  nextLevel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  levelBarBg: {
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  levelProgress: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  statsCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  notifCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  notifDesc: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  timeSelector: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
  },
  timeSelectorLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  timeScroll: {
    flexDirection: 'row',
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
  },
  timeChipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  timeChipTextActive: {
    color: colors.textWhite,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  levelListCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  levelRowActive: {
    backgroundColor: colors.primary + '08',
  },
  levelRowLevel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    width: 40,
  },
  levelRowName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  levelRowScore: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  levelRowCheck: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.labelMedium,
    color: colors.error,
  },
});
