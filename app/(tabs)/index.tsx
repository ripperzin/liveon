import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, getGreeting, getStreakColor, getAttributeColor } from '@/constants/Colors';
import { useAuthStore, useGameStore } from '@/lib/store';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { userHabits, todayLogs, userAttributes, streaks, quests, loadAllData } = useGameStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  const greeting = t(`home.${getGreeting()}`);
  const completedToday = todayLogs.filter((l) => l.completed).length;
  const totalHabits = userHabits.length || 4; // Default to 4 for display
  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Find max streak
  const maxStreak = streaks.reduce((max, s) => Math.max(max, s.current_streak), 0);
  const globalStreak = profile?.current_streak_days || maxStreak || 0;

  const xpPercent = profile
    ? (profile.current_level_xp / profile.xp_to_next_level) * 100
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceDark }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <Text style={{ fontSize: 16, color: Colors.textSecondary, fontWeight: '500' }}>
            {greeting} 👋
          </Text>
          <Text style={{ fontSize: 28, color: Colors.textPrimary, fontWeight: '800', marginTop: 4 }}>
            {profile?.display_name || 'Adventurer'}
          </Text>
        </Animated.View>

        {/* Character Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            marginHorizontal: 24,
            marginTop: 16,
            backgroundColor: Colors.surface,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: Colors.surfaceLight,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Avatar Area */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.primary + '30',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: Colors.primary,
                }}
              >
                <Text style={{ fontSize: 40 }}>🧙</Text>
              </View>
              <View
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginTop: -10,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>
                  {t('home.level')} {profile?.level || 1}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flex: 1, marginLeft: 20 }}>
              {/* XP Bar */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '600' }}>XP</Text>
                  <Text style={{ color: Colors.secondary, fontSize: 12, fontWeight: '700' }}>
                    {profile?.current_level_xp || 0} / {profile?.xp_to_next_level || 100}
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: Colors.surfaceLight,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(xpPercent, 100)}%`,
                      backgroundColor: Colors.secondary,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              {/* Coins & Streak */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 16 }}>🪙</Text>
                  <Text style={{ color: Colors.accentGold, fontSize: 16, fontWeight: '700' }}>
                    {profile?.coins || 0}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                  <Text
                    style={{
                      color: getStreakColor(globalStreak),
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {globalStreak} {t('home.days')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Daily Progress */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
            {t('home.daily_progress')}
          </Text>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: Colors.surfaceLight,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
                {completedToday} / {totalHabits} {t('tabs.habits').toLowerCase()}
              </Text>
              <Text style={{ color: Colors.accentGreen, fontSize: 14, fontWeight: '700' }}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View
              style={{
                height: 12,
                backgroundColor: Colors.surfaceLight,
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(progressPercent, 100)}%`,
                  borderRadius: 6,
                  backgroundColor: progressPercent >= 100 ? Colors.accentGreen : Colors.primary,
                }}
              />
            </View>

            {/* Quick habit icons */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
              {['💧', '🏋️', '📖', '📵'].map((emoji, i) => {
                const isCompleted = i < completedToday;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      borderRadius: 12,
                      backgroundColor: isCompleted ? Colors.accentGreen + '20' : Colors.surfaceLight,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: isCompleted ? Colors.accentGreen + '40' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 24, opacity: isCompleted ? 1 : 0.5 }}>{emoji}</Text>
                    {isCompleted && (
                      <Text style={{ fontSize: 10, color: Colors.accentGreen, fontWeight: '700', marginTop: 2 }}>
                        ✓
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Attributes Preview */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
            {t('avatar.attributes')}
          </Text>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.surfaceLight,
            }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { slug: 'vitality', icon: '💧', label: t('attributes.vitality') },
                { slug: 'strength', icon: '💪', label: t('attributes.strength') },
                { slug: 'intelligence', icon: '📚', label: t('attributes.intelligence') },
                { slug: 'focus', icon: '🎯', label: t('attributes.focus') },
              ].map((attr) => {
                const userAttr = userAttributes.find(
                  (ua) => ua.attribute?.slug === attr.slug
                );
                const value = userAttr?.value || 0;
                return (
                  <View
                    key={attr.slug}
                    style={{
                      width: '48%',
                      backgroundColor: Colors.surfaceLight,
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{attr.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                        {attr.label}
                      </Text>
                      <Text
                        style={{
                          color: getAttributeColor(attr.slug),
                          fontSize: 18,
                          fontWeight: '800',
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Today's Quests */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12 }}>
            {t('home.today_quests')}
          </Text>
          {(quests.length > 0 ? quests.slice(0, 3) : [
            { id: '1', title: 'Dia Completo', description: 'Complete todos os hábitos', rewards: { xp: 50, coins: 20 }, type: 'daily' },
            { id: '2', title: 'Hidratação Total', description: 'Beba 8 copos de água', rewards: { xp: 25, coins: 10 }, type: 'daily' },
          ]).map((quest, index) => (
            <Animated.View
              key={quest.id}
              entering={FadeInRight.delay(600 + index * 100).duration(400)}
            >
              <Pressable
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: Colors.surfaceLight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: Colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>⚔️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}>
                    {quest.title}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {quest.description}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: Colors.secondary, fontSize: 13, fontWeight: '700' }}>
                    +{quest.rewards.xp} XP
                  </Text>
                  <Text style={{ color: Colors.accentGold, fontSize: 12, fontWeight: '600' }}>
                    +{quest.rewards.coins} 🪙
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
