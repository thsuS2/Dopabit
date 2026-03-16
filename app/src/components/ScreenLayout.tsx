import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

interface Props {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  backgroundColor?: string;
  hideHeader?: boolean;
  avoidKeyboard?: boolean;
}

export default function ScreenLayout({
  title,
  children,
  headerRight,
  backgroundColor = colors.backgroundGray,
  hideHeader = false,
  avoidKeyboard = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );

  if (avoidKeyboard) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
});
