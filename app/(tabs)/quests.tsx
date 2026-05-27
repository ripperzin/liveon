import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useGameStore, type UserHabit, type HabitLog } from '@/lib/store';
import { useFocusEffect } from 'expo-router';

export default function QuestsScreen() {
  const { t } = useTranslation();
  const { quests, loadAllData, userHabits, todayLogs, userAttributes } = useGameStore();
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

  // Fallback quest data for display (adapted to dynamic progress)
  const displayQuests = quests.length > 0
    ? quests.filter((q) => q.type === activeTab)
    : [
        {
          id: '1',
          title: activeTab === 'daily' ? 'Dia Completo' : activeTab === 'weekly' ? 'Semana Ativa' : 'Desafio Especial',
          description: activeTab === 'daily'
            ? `Complete todos os ${userHabits.length || 'seus'} hábitos de hoje`
            : activeTab === 'weekly'
            ? 'Complete 20 hábitos esta semana'
            : 'Mantenha um streak de 7 dias',
          type: activeTab,
          progress: activeTab === 'daily' ? dailyProgress : 0.3,
          requirements: {},
          rewards: { xp: activeTab === 'daily' ? 50 : activeTab === 'weekly' ? 200 : 500, coins: activeTab === 'daily' ? 20 : activeTab === 'weekly' ? 80 : 200 },
        },
        {
          id: '2',
          title: activeTab === 'daily' ? 'Apenas o Começo' : activeTab === 'weekly' ? 'Foco de Mestre' : 'Maratonista',
          description: activeTab === 'daily'
            ? 'Complete seu primeiro hábito do dia'
            : activeTab === 'weekly'
            ? 'Acumule 500 XP em uma semana'
            : 'Exercite-se por 30 dias',
          type: activeTab,
          progress: activeTab === 'daily' ? (completedHabits >= 1 ? 1 : 0) : 0.45,
          requirements: {},
          rewards: { xp: activeTab === 'daily' ? 25 : activeTab === 'weekly' ? 150 : 1000, coins: activeTab === 'daily' ? 10 : activeTab === 'weekly' ? 50 : 500 },
        },
        {
          id: '3',
          title: activeTab === 'daily' ? 'Atributo em Alta' : activeTab === 'weekly' ? 'Consistência Pura' : 'Lenda Viva',
          description: activeTab === 'daily'
            ? 'Ganhe XP em qualquer atributo hoje'
            : activeTab === 'weekly'
            ? 'Mantenha todos os hábitos por 5 dias na semana'
            : 'Alcance o nível 50',
          type: activeTab,
          progress: activeTab === 'daily' ? (completedHabits >= 1 ? 1 : 0) : 0.1,
          requirements: {},
          rewards: { xp: activeTab === 'daily' ? 30 : activeTab === 'weekly' ? 100 : 5000, coins: activeTab === 'daily' ? 15 : activeTab === 'weekly' ? 40 : 2000 },
        },
      ];

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

            return (
              <Animated.View
                key={quest.id}
                entering={FadeInRight.delay(200 + index * 100).duration(500)}
              >
                <Pressable
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: Colors.surfaceLight,
                    borderLeftWidth: 4,
                    borderLeftColor: color,
                  }}
                >
                  {/* Top Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: color + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
                        {quest.title}
                      </Text>
                      <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                        {quest.description}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={{ marginTop: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600' }}>
                        {t('quests.progress')}
                      </Text>
                      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>
                        {Math.round(progress * 100)}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: Colors.surfaceLight,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${progress * 100}%`,
                          backgroundColor: color,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>

                  {/* Rewards */}
                  <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>✨</Text>
                      <Text style={{ color: Colors.secondary, fontSize: 14, fontWeight: '700' }}>
                        +{quest.rewards.xp} XP
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>🪙</Text>
                      <Text style={{ color: Colors.accentGold, fontSize: 14, fontWeight: '700' }}>
                        +{quest.rewards.coins}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
