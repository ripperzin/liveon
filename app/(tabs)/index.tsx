import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, getGreeting, getStreakColor, getAttributeColor } from '@/constants/Colors';
import { HomeAvatar } from '@/components/avatar';

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

        {/* Live Avatar */}
        {profile?.id && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={{ marginHorizontal: 24, marginTop: 16, alignItems: 'center' }}
          >
            <HomeAvatar profileId={profile.id} size={220} />
          </Animated.View>
        )}

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
          {(quests.length > 0 ? quests.filter(q => q.type === 'daily').slice(0, 3) : []).map((quest, index) => {
            const progress = quest.progress || 0;
            const isClaimed = useGameStore.getState().claimedQuests?.includes(quest.id) || false;
            const canClaim = progress >= 1 && !isClaimed;

            return (
              <Animated.View
                key={quest.id}
                entering={FadeInRight.delay(600 + index * 100).duration(400)}
              >
                <View
                  style={{
                    backgroundColor: isClaimed ? Colors.surfaceDark : Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: canClaim ? Colors.primary : Colors.surfaceLight,
                    opacity: isClaimed ? 0.6 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isClaimed ? Colors.surfaceLight : Colors.primary + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{isClaimed ? '✅' : '⚔️'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}>
                        {quest.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text style={{ color: Colors.secondary, fontSize: 12, fontWeight: '700' }}>
                          +{quest.rewards.xp} XP
                        </Text>
                        <Text style={{ color: Colors.accentGold, fontSize: 11, fontWeight: '600' }}>
                          +{quest.rewards.coins} 🪙
                        </Text>
                      </View>
                    </View>
                    
                    {/* Status/Claim */}
                    <View style={{ alignItems: 'flex-end' }}>
                      {isClaimed ? (
                        <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '700' }}>Resgatado</Text>
                      ) : canClaim ? (
                        <Pressable
                          onPress={async () => {
                            const { claimQuest } = useGameStore.getState();
                            // Note: we can't easily import Haptics here since it's missing, but we can rely on standard click
                            await claimQuest(quest.id, quest.rewards.xp, quest.rewards.coins);
                          }}
                          style={{
                            backgroundColor: Colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Resgatar</Text>
                        </Pressable>
                      ) : (
                        <View style={{ width: 40, height: 6, backgroundColor: Colors.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: Colors.primary, borderRadius: 3 }} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
