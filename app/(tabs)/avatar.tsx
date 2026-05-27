import { View, Text, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, getAttributeColor, getRarityColor } from '@/constants/Colors';
import { useAuthStore, useGameStore } from '@/lib/store';

export default function AvatarScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { userAttributes, achievements, loadAllData } = useGameStore();

  useEffect(() => {
    loadAllData();
  }, []);

  const allAttributes = [
    { slug: 'vitality', icon: '💧', key: 'vitality' },
    { slug: 'strength', icon: '💪', key: 'strength' },
    { slug: 'intelligence', icon: '📚', key: 'intelligence' },
    { slug: 'focus', icon: '🎯', key: 'focus' },
    { slug: 'clarity', icon: '✍️', key: 'clarity' },
    { slug: 'charisma', icon: '🗣️', key: 'charisma' },
    { slug: 'mindfulness', icon: '🧘', key: 'mindfulness' },
    { slug: 'recovery', icon: '😴', key: 'recovery' },
  ];

  const xpPercent = profile
    ? (profile.current_level_xp / profile.xp_to_next_level) * 100
    : 0;

  // Determine title based on level
  const getTitle = (level: number) => {
    if (level >= 51) return '👑 Lenda';
    if (level >= 41) return '⭐ Mestre';
    if (level >= 31) return '⚔️ Guerreiro';
    if (level >= 21) return '🛡️ Praticante';
    if (level >= 11) return '📜 Aprendiz';
    return '🌱 Novato';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceDark }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={{ paddingHorizontal: 24, paddingTop: 16 }}
        >
          <Text style={{ fontSize: 28, color: Colors.textPrimary, fontWeight: '800' }}>
            {t('avatar.title')}
          </Text>
        </Animated.View>

        {/* Avatar Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            backgroundColor: Colors.surface,
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.surfaceLight,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: Colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
            }}
          >
            <Text style={{ fontSize: 64 }}>🧙</Text>
          </View>

          {/* Name & Title */}
          <Text style={{ fontSize: 24, color: Colors.textPrimary, fontWeight: '800', marginTop: 16 }}>
            {profile?.display_name || 'Adventurer'}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 4 }}>
            {getTitle(profile?.level || 1)}
          </Text>

          {/* Level & XP */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                {t('home.level')} {profile?.level || 1}
              </Text>
              <Text style={{ color: Colors.secondary, fontSize: 14, fontWeight: '600' }}>
                {profile?.current_level_xp || 0} / {profile?.xp_to_next_level || 100} XP
              </Text>
            </View>
            <View style={{ height: 10, backgroundColor: Colors.surfaceLight, borderRadius: 5, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(xpPercent, 100)}%`,
                  backgroundColor: Colors.secondary,
                  borderRadius: 5,
                }}
              />
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', marginTop: 20, gap: 24 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.accentGold, fontSize: 22, fontWeight: '800' }}>
                {profile?.coins || 0}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>🪙 Coins</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.surfaceLight }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.secondary, fontSize: 22, fontWeight: '800' }}>
                {profile?.total_xp || 0}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>✨ Total XP</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.surfaceLight }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.accentCoral, fontSize: 22, fontWeight: '800' }}>
                {profile?.longest_streak_days || 0}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>🔥 Best Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Attributes Grid */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 24 }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
            {t('avatar.attributes')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {allAttributes.map((attr) => {
              const userAttr = userAttributes.find(
                (ua) => ua.attribute?.slug === attr.slug
              );
              const value = userAttr?.value || 0;
              const color = getAttributeColor(attr.slug);

              return (
                <View
                  key={attr.slug}
                  style={{
                    width: '48%',
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.surfaceLight,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 18 }}>{attr.icon}</Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 13, fontWeight: '600', flex: 1 }}>
                      {t(`attributes.${attr.key}`)}
                    </Text>
                  </View>
                  <Text style={{ color, fontSize: 24, fontWeight: '800' }}>{value}</Text>
                  <View
                    style={{
                      height: 4,
                      backgroundColor: Colors.surfaceLight,
                      borderRadius: 2,
                      marginTop: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.min((value / 100) * 100, 100)}%`,
                        backgroundColor: color,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Achievements */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 24 }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
            {t('avatar.achievements')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {achievements.slice(0, 6).map((achievement) => (
              <View
                key={achievement.id}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  width: 140,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: getRarityColor(achievement.rarity) + '40',
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{achievement.icon}</Text>
                <Text
                  style={{
                    color: Colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {achievement.title}
                </Text>
                <View
                  style={{
                    backgroundColor: getRarityColor(achievement.rarity) + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginTop: 6,
                  }}
                >
                  <Text
                    style={{
                      color: getRarityColor(achievement.rarity),
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {achievement.rarity}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
