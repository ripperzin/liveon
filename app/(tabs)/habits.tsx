import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, getStreakColor, getStreakMultiplier } from '@/constants/Colors';
import { useAuthStore, useGameStore, type UserHabit, type HabitLog } from '@/lib/store';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';

interface HabitCardProps {
  userHabit: UserHabit;
  todayLog: HabitLog | undefined;
  streak: number;
  onCheckIn: () => void;
  index: number;
}

function HabitCard({ userHabit, todayLog, streak, onCheckIn, index }: HabitCardProps) {
  const { t } = useTranslation();
  const isCompleted = todayLog?.completed ?? false;
  const habit = userHabit.habit;
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handlePress = () => {
    if (isCompleted) return;
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );
    checkScale.value = withSpring(1);
    onCheckIn();
  };

  if (!habit) return null;

  const streakMult = getStreakMultiplier(streak);
  const estimatedXp = Math.floor(habit.base_xp * streakMult);

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(500)}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: isCompleted ? Colors.accentGreen + '15' : Colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isCompleted ? Colors.accentGreen + '40' : Colors.surfaceLight,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: isCompleted
              ? Colors.accentGreen + '20'
              : Colors.surfaceLight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 28 }}>{habit.icon}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: isCompleted ? Colors.accentGreen : Colors.textPrimary,
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            {streak > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: streak >= 7 ? 14 : 12 }}>
                  {streak >= 7 ? '⚡' : streak >= 3 ? '🚀' : '🔥'}
                </Text>
                <Text
                  style={{
                    color: getStreakColor(streak),
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {streak} {streak >= 7 ? 'MAX' : ''}
                </Text>
              </View>
            )}
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
              {habit.default_goal.target} {habit.default_goal.unit}
            </Text>
          </View>
        </View>

        {/* Right side */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {isCompleted ? (
            <Animated.View style={checkAnimatedStyle}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Colors.accentGreen,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>✓</Text>
              </View>
            </Animated.View>
          ) : (
            <>
              <Text style={{ color: Colors.secondary, fontSize: 13, fontWeight: '700' }}>
                +{estimatedXp} XP
              </Text>
              {streakMult > 1 && (
                <Text style={{ color: Colors.accentGold, fontSize: 11, fontWeight: '600' }}>
                  {streakMult.toFixed(2)}x bonus
                </Text>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, userHabits, todayLogs, streaks, completeHabit, fetchTodayLogs, loadAllData, addUserHabit } = useGameStore();
  const [xpFeedback, setXpFeedback] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false });

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const displayHabits: UserHabit[] = userHabits.length > 0
    ? userHabits
    : habits.map(h => ({
        id: h.id,
        user_id: 'temp',
        habit_id: h.id,
        is_active: true,
        created_at: '',
        updated_at: '',
        habit: h
      }));

  const availableHabits = habits.filter(h => !userHabits.find(uh => uh.habit_id === h.id));

  const handleCheckIn = async (habitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await completeHabit(habitId, { completed: true });
    if (result) {
      setXpFeedback({ xp: result.xpEarned, visible: true });
      setTimeout(() => setXpFeedback((prev) => ({ ...prev, visible: false })), 2000);

      if (result.leveledUp) {
        setTimeout(() => {
          router.push(`/levelup-modal?level=${result.newLevel}`);
        }, 500); // slight delay to let XP toast show
      }
    }
  };

  const completedCount = todayLogs.filter((l) => l.completed).length;
  const totalCount = displayHabits.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceDark }}>
      {/* XP Feedback Toast */}
      {xpFeedback.visible && (
        <Animated.View
          entering={FadeInDown.springify().damping(12).stiffness(100)}
          style={{
            position: 'absolute',
            top: 100,
            alignSelf: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
            zIndex: 100,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>
            +{xpFeedback.xp} XP ✨
          </Text>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <Text style={{ fontSize: 28, color: Colors.textPrimary, fontWeight: '800' }}>
            {t('habits.title')}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
            {completedCount}/{totalCount} {t('habits.completed').toLowerCase()}
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ marginBottom: 20 }}
        >
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
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                backgroundColor: completedCount >= totalCount ? Colors.accentGreen : Colors.primary,
                borderRadius: 3,
              }}
            />
          </View>
        </Animated.View>

        {/* Habit Cards */}
        {displayHabits.map((userHabit, index) => {
          const streak = streaks.find((s) => s.habit_id === userHabit.habit_id);
          const todayLog = todayLogs.find((l) => l.habit_id === userHabit.habit_id);

          return (
            <HabitCard
              key={userHabit.id}
              userHabit={userHabit}
              todayLog={todayLog}
              streak={streak?.current_streak || 0}
              onCheckIn={() => handleCheckIn(userHabit.habit_id)}
              index={index}
            />
          );
        })}

        {/* All done message */}
        {completedCount >= totalCount && totalCount > 0 && (
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            style={{
              backgroundColor: Colors.accentGreen + '15',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              marginTop: 8,
              borderWidth: 1,
              borderColor: Colors.accentGreen + '40',
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
            <Text style={{ color: Colors.accentGreen, fontSize: 18, fontWeight: '800' }}>
              {t('habits.completed')}
            </Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
              All habits completed for today. Come back tomorrow!
            </Text>
          </Animated.View>
        )}

        {/* Discover New Habits Section */}
        {availableHabits.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ paddingHorizontal: 24, marginTop: 40, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, color: Colors.textPrimary, fontWeight: '700', marginBottom: 16 }}>
              Descubra Novos Hábitos
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {availableHabits.map((habit, index) => (
                <Animated.View key={habit.id} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
                  <Pressable
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      await addUserHabit(habit.id);
                    }}
                    style={({ pressed }) => ({
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      padding: 16,
                      width: 140,
                      borderWidth: 1,
                      borderColor: pressed ? Colors.primary : Colors.surfaceLight,
                      opacity: pressed ? 0.8 : 1,
                      alignItems: 'center',
                    })}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceDark,
                      alignItems: 'center', justifyContent: 'center', marginBottom: 12
                    }}>
                      <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
                    </View>
                    <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>
                      {habit.name}
                    </Text>
                    <Text style={{ color: Colors.textMuted, fontSize: 12, textAlign: 'center' }} numberOfLines={2}>
                      {habit.description}
                    </Text>
                    <View style={{ marginTop: 12, backgroundColor: Colors.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '700' }}>Adicionar</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
