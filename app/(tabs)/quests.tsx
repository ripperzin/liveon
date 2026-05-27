import { View, Text, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useGameStore, type UserHabit, type HabitLog } from '@/lib/store';
import { useFocusEffect } from 'expo-router';

export default function QuestsScreen() {
  const { t } = useTranslation();
  const { quests, loadAllData, userHabits, todayLogs, userAttributes, streaks, claimedQuests, claimQuest } = useGameStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  // Dynamic progress calculations
  const totalHabits = userHabits.length > 0 ? userHabits.length : 1; // avoid division by zero
  const completedHabits = todayLogs.filter((l) => l.completed).length;
  const dailyProgress = Math.min(completedHabits / totalHabits, 1);
  const dailyXp = todayLogs.reduce((acc, log) => acc + (log.xp_earned || 0), 0);
  const highestStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.current_streak)) : 0;
  
  // Find if they protected their best streak
  const bestStreakHabitId = streaks.length > 0 
    ? streaks.reduce((prev, current) => (prev.current_streak > current.current_streak) ? prev : current).habit_id 
    : null;
  const protectedBestStreak = bestStreakHabitId 
    ? todayLogs.some(l => l.completed && l.habit_id === bestStreakHabitId)
    : false;

  // New Meta-Objective Quests
  const metaQuests = [
    {
      id: 'daily-1',
      title: 'Dia Perfeito',
      description: `Complete todos os ${userHabits.length || 'seus'} hábitos de hoje`,
      type: 'daily',
      progress: dailyProgress,
      rewards: { xp: 50, coins: 20 },
    },
    {
      id: 'daily-2',
      title: 'Primeiro Passo',
      description: 'Complete pelo menos 1 hábito do dia',
      type: 'daily',
      progress: completedHabits >= 1 ? 1 : 0,
      rewards: { xp: 15, coins: 5 },
    },
    {
      id: 'daily-3',
      title: 'Guardião da Chama',
      description: 'Complete o hábito com o seu maior Streak atual para não perdê-lo',
      type: 'daily',
      progress: protectedBestStreak ? 1 : 0,
      rewards: { xp: 30, coins: 15 },
    },
    {
      id: 'weekly-1',
      title: 'Semana Consistente',
      description: 'Alcance um streak de 5 dias em qualquer hábito',
      type: 'weekly',
      progress: Math.min(highestStreak / 5, 1),
      rewards: { xp: 100, coins: 50 },
    },
    {
      id: 'weekly-2',
      title: 'Caçador de Recompensas',
      description: 'Acumule 300 XP esta semana',
      type: 'weekly',
      progress: 0.3, // Simulated for MVP
      rewards: { xp: 150, coins: 70 },
    },
    {
      id: 'special-1',
      title: 'Lenda Viva',
      description: 'Alcance o nível 10',
      type: 'special',
      progress: 0.1, // Simulated
      rewards: { xp: 1000, coins: 500 },
    }
  ];

  const displayQuests = metaQuests.filter(q => q.type === activeTab);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return Colors.primary;
      case 'weekly': return Colors.secondary;
      case 'special': return Colors.accentGold;
      default: return Colors.primary;
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'daily': return '⚔️';
      case 'weekly': return '🏰';
      case 'special': return '👑';
      default: return '⚔️';
    }
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
            {t('quests.title')}
          </Text>
        </Animated.View>

        {/* Tabs */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{
            flexDirection: 'row',
            marginHorizontal: 24,
            marginTop: 20,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(['daily', 'weekly', 'special'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: activeTab === tab ? getTypeColor(tab) : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? '#FFF' : Colors.textMuted,
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                {t(`quests.${tab}`)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Quest Cards */}
        <View style={{ marginTop: 20, paddingHorizontal: 24 }}>
          {displayQuests.map((quest, index) => {
            const color = getTypeColor(quest.type);
            const emoji = getTypeEmoji(quest.type);
            const progress = quest.progress || 0;
            const isClaimed = claimedQuests?.includes(quest.id) || false;
            const canClaim = progress >= 1 && !isClaimed;

            return (
              <Animated.View
                key={quest.id}
                entering={FadeInRight.delay(200 + index * 100).duration(500)}
              >
                <View
                  style={{
                    backgroundColor: isClaimed ? Colors.surfaceDark : Colors.surface,
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: canClaim ? color : Colors.surfaceLight,
                    opacity: isClaimed ? 0.6 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isClaimed ? Colors.surfaceLight : color + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{isClaimed ? '✅' : emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                        {quest.title}
                      </Text>
                      <Text style={{ color: Colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                        {quest.description}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ color: Colors.secondary, fontSize: 14, fontWeight: '700' }}>+{quest.rewards.xp}</Text>
                        <Text style={{ fontSize: 12 }}>XP</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ color: Colors.accentGold, fontSize: 14, fontWeight: '700' }}>+{quest.rewards.coins}</Text>
                        <Text style={{ fontSize: 12 }}>🪙</Text>
                      </View>
                    </View>
                    
                    {!isClaimed && !canClaim && (
                      <Text style={{ color: color, fontSize: 13, fontWeight: '700' }}>
                        {Math.floor(progress * 100)}%
                      </Text>
                    )}
                  </View>

                  {/* Progress Bar or Claim Button */}
                  {isClaimed ? (
                    <View style={{ backgroundColor: Colors.surfaceLight, padding: 10, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: Colors.textMuted, fontSize: 13, fontWeight: '700' }}>Resgatado</Text>
                    </View>
                  ) : canClaim ? (
                    <Pressable
                      onPress={async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await claimQuest(quest.id, quest.rewards.xp, quest.rewards.coins);
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: color,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Resgatar Recompensa!</Text>
                    </Pressable>
                  ) : (
                    <View style={{ height: 6, backgroundColor: Colors.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
                      <Animated.View
                        style={{
                          height: '100%',
                          backgroundColor: color,
                          width: `${progress * 100}%`,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
