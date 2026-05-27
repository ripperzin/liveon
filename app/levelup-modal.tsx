import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

export default function LevelUpModal() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: string }>();

  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Haptic feedback sequence for dramatic effect
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 300);

    // Aura Animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedAuraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
      opacity: glowOpacity.value,
    };
  });

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={StyleSheet.absoluteFillObject}
    >
      {/* Dark Backdrop */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Glow / Aura */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: Colors.accentGold + '40',
              filter: [{ blur: 40 }] as any,
            },
            animatedAuraStyle
          ]}
        />
        
        {/* Star Burst Background */}
        <Animated.View style={animatedAuraStyle}>
           <Text style={{ fontSize: 160, opacity: 0.3, color: Colors.accentGold }}>✨</Text>
        </Animated.View>

        {/* Level Up Content */}
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(100).delay(200)}
          style={{ alignItems: 'center', position: 'absolute' }}
        >
          <Text
            style={{
              fontSize: 24,
              color: Colors.accentGold,
              fontWeight: '900',
              letterSpacing: 4,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            Level Up!
          </Text>

          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: Colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: Colors.accentGold,
              shadowColor: Colors.accentGold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 64, fontWeight: '900', color: Colors.textPrimary }}>
              {level || '?'}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 18,
              color: Colors.textSecondary,
              marginTop: 32,
              textAlign: 'center',
              fontWeight: '600',
              paddingHorizontal: 40,
            }}
          >
            Your real-life stats have grown. Keep pushing your limits!
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          entering={FadeIn.delay(1000).duration(800)}
          style={{ position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 32 }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.accentGold,
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: Colors.accentGold,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#000', fontSize: 18, fontWeight: '800' }}>
              Awesome!
            </Text>
          </Pressable>
        </Animated.View>

      </View>
    </Animated.View>
  );
}
