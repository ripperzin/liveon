import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/lib/store';
import { useAvatarState } from '@/lib/avatar';
import { AvatarRenderer } from './AvatarRenderer';

export function AvatarCompanion() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const avatarState = useAvatarState(profile?.id);

  if (!profile || !avatarState) {
    return null;
  }

  const navigateToAvatar = () => {
    router.push('/(tabs)/avatar');
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(800).springify()}
      exiting={FadeOutRight.duration(300)}
      style={[
        styles.container,
        {
          top: insets.top + 8, // Just below the status bar
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={navigateToAvatar}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <AvatarRenderer state={avatarState} size={80} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
    // Add subtle drop shadow to make it pop over content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
