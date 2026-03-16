import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

interface Props {
  level: number;
  completedRatio: number; // 0 ~ 1
  streak: number;
}

function getCharacterState(completedRatio: number, streak: number) {
  if (completedRatio >= 1) {
    return { emoji: '🐰✨', mood: '완벽한 하루!', color: colors.success };
  }
  if (completedRatio >= 0.6) {
    return { emoji: '🐰😊', mood: '잘하고 있어!', color: colors.primary };
  }
  if (completedRatio >= 0.3) {
    return { emoji: '🐰🙂', mood: '조금만 더 힘내!', color: colors.warning };
  }
  if (streak > 0) {
    return { emoji: '🐰😴', mood: '루틴을 시작해볼까?', color: colors.textTertiary };
  }
  return { emoji: '🐰😢', mood: '도파빗이 기다리고 있어', color: colors.textTertiary };
}

function getCharacterName(level: number) {
  if (level >= 20) return '갓생 도파빗';
  if (level >= 10) return '루틴 마스터 도파빗';
  if (level >= 5) return '건강한 도파빗';
  if (level >= 3) return '성장중 도파빗';
  return '아기 도파빗';
}

export default function DopabitCharacter({ level, completedRatio, streak }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (completedRatio >= 0.6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [completedRatio, bounceAnim]);

  const state = getCharacterState(completedRatio, streak);
  const name = getCharacterName(level);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[styles.character, { transform: [{ translateY: bounceAnim }] }]}
      >
        {state.emoji}
      </Animated.Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={[styles.mood, { color: state.color }]}>{state.mood}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  character: {
    fontSize: 72,
  },
  name: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    marginTop: 8,
  },
  mood: {
    ...typography.bodySmall,
    marginTop: 4,
  },
});
