import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import AICoachScreen from '../screens/AICoachScreen';
import MyPageScreen from '../screens/MyPageScreen';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏡' },
  Record: { active: '📊', inactive: '📋' },
  AICoach: { active: '🐰', inactive: '🐇' },
  MyPage: { active: '👤', inactive: '👤' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: 22 }}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
        tabBarStyle: {
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{ tabBarLabel: '기록' }}
      />
      <Tab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{ tabBarLabel: 'AI코치' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이' }}
      />
    </Tab.Navigator>
  );
}
