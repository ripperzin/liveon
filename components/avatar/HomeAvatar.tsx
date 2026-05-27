/**
 * HomeAvatar
 *
 * Avatar persistente da home screen.
 * Conecta useAvatarState → AvatarRenderer e exibe
 * o label de estado visual de forma acolhedora.
 *
 * Uso:
 *   <HomeAvatar profileId={profile.id} />
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useAvatarState } from '../../lib/avatar';
import { AvatarRenderer } from './AvatarRenderer';

// ─── Label acolhedor por estado visual ──────────────────────────────────────
const STATE_LABEL: Record<string, string> = {
  energetic: '✨ No seu melhor momento',
  inspired:  '💡 Cheio de ideias',
  balanced:  '🌿 Em equilíbrio',
  focused:   '🎯 No fluxo',
  tired:     '🌙 Descansando um pouco',
};

const STATE_LABEL_COLOR: Record<string, string> = {
  energetic: '#D97706',
  inspired:  '#7C3AED',
  balanced:  '#059669',
  focused:   '#2563EB',
  tired:     '#64748B',
};

// ─── Props ───────────────────────────────────────────────────────────────────
type HomeAvatarProps = {
  profileId: string;
  size?: number;
  onPress?: () => void;
};

// ─── Componente ──────────────────────────────────────────────────────────────
export function HomeAvatar({ profileId, size = 160, onPress }: HomeAvatarProps) {
  const { avatarState } = useAvatarState(profileId);
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  function handlePressIn() {
    pressScale.value = withSpring(0.94, { damping: 15 });
  }

  function handlePressOut() {
    pressScale.value = withSpring(1.0, { damping: 12 });
  }

  if (avatarState.isLoading) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color="#94A3B8" />
      </View>
    );
  }

  const label = STATE_LABEL[avatarState.visualState] ?? '';
  const labelColor = STATE_LABEL_COLOR[avatarState.visualState] ?? '#64748B';

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[{ alignItems: 'center', gap: 8 }, animatedStyle]}>
        {/* Avatar */}
        <AvatarRenderer state={avatarState} size={size} />

        {/* Label de estado — discreto, nunca punitivo */}
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 13, color: labelColor, fontWeight: '500' }}>
            {label}
          </Text>

          {/* Barra de momentum — discreta, sem número explícito */}
          <MomentumBar
            value={avatarState.momentum}
            trend={avatarState.momentumTrend}
            color={labelColor}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Barra de momentum ───────────────────────────────────────────────────────
// Proposital: não mostra o número, só a sensação visual de energia.
type MomentumBarProps = {
  value: number;   // 0–100
  trend: 'rising' | 'stable' | 'falling';
  color: string;
};

function MomentumBar({ value, trend, color }: MomentumBarProps) {
  const fillWidth = `${value}%` as const;

  const trendIcon =
    trend === 'rising'  ? '↑' :
    trend === 'falling' ? '↓' :
    '';

  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      {/* Track */}
      <View
        style={{
          width: 80,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#E2E8F0',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <View
          style={{
            width: fillWidth,
            height: '100%',
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </View>

      {/* Tendência — só aparece se subindo ou descendo */}
      {trendIcon ? (
        <Text style={{ fontSize: 11, color, opacity: 0.7 }}>
          {trendIcon} momentum
        </Text>
      ) : null}
    </View>
  );
}
