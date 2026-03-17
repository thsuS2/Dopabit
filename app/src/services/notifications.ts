import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'dopabit_notification_settings';

interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

// 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

  if (settings.enabled) {
    await scheduleDailyReminder(settings.hour, settings.minute);
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  // 기존 알림 모두 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // 매일 반복 알림 스케줄링
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '도파빗 루틴 알림 🐰',
      body: '오늘의 루틴을 확인해보세요! 도파빗이 기다리고 있어요.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '도파빗 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const settings = await getNotificationSettings();
  if (settings.enabled) {
    await scheduleDailyReminder(settings.hour, settings.minute);
  }
}
