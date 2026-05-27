import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useAuthStore, useGameStore, type Habit } from '@/lib/store';
import { supabase } from '@/lib/supabase';

const ESSENCES = [
  { id: 'disciplined', name: 'Disciplinado', icon: '🎯', color: '#3B82F6', visualState: 'focused' },
  { id: 'creative', name: 'Criativo', icon: '🎨', color: '#8B5CF6', visualState: 'inspired' },
  { id: 'balanced', name: 'Equilibrado', icon: '⚖️', color: '#10B981', visualState: 'balanced' },
  { id: 'energetic', name: 'Energético', icon: '⚡', color: '#F59E0B', visualState: 'energetic' },
  { id: 'wise', name: 'Sábio', icon: '🦉', color: '#F8FAFC', visualState: 'focused' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, fetchProfile } = useAuthStore();
  const { habits, fetchHabits } = useGameStore();

  const [step, setStep] = useState(1);
  const [selectedEssence, setSelectedEssence] = useState(ESSENCES[0]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleFinish = async () => {
    if (selectedHabits.length < 2) {
      Alert.alert(t('error'), t('onboarding.choose_habits_desc'));
      return;
    }
    
    if (!profile) return;
    setLoading(true);

    try {
      // 1. Update Profile Avatar Config
      await supabase
        .from('profiles')
        .update({ 
          avatar_config: { 
            essence: selectedEssence.id,
            color: selectedEssence.color,
            defaultVisualState: selectedEssence.visualState
          } 
        })
        .eq('id', profile.id);

      // 2. Insert User Habits
      const userHabitsToInsert = selectedHabits.map((habitId) => ({
        user_id: profile.id,
        habit_id: habitId,
        is_active: true,
      }));

      await supabase.from('user_habits').insert(userHabitsToInsert);

      // 3. Refresh Store and Redirect
      await fetchProfile();
      await useGameStore.getState().loadAllData();
      
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = (id: string) => {
    setSelectedHabits((prev) => 
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceDark }}>
      <View style={{ flex: 1, padding: 24 }}>
        
        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(500)} style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 }}>
              Sua Essência Inicial
            </Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 32 }}>
              Escolha a energia que guiará seu companheiro virtual no início da sua jornada.
            </Text>

            <View style={{ gap: 12 }}>
              {ESSENCES.map((essence) => (
                <Pressable
                  key={essence.id}
                  onPress={() => setSelectedEssence(essence)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: selectedEssence.id === essence.id ? essence.color + '20' : Colors.surface,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selectedEssence.id === essence.id ? essence.color : Colors.surfaceLight,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: essence.color + '30', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 24 }}>{essence.icon}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
                    {essence.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setStep(2)}
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 60,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{t('continue')}</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(500)} style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, marginTop: 24 }}>
              {t('onboarding.choose_habits')}
            </Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 32 }}>
              {t('onboarding.choose_habits_desc')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {habits.map((habit, index) => {
                const isSelected = selectedHabits.includes(habit.id);
                return (
                  <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100).duration(400)}>
                    <Pressable
                      onPress={() => toggleHabit(habit.id)}
                      style={{
                        backgroundColor: isSelected ? Colors.primary + '20' : Colors.surface,
                        borderRadius: 16,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: isSelected ? Colors.primary : Colors.surfaceLight,
                      }}
                    >
                      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: isSelected ? Colors.primary : Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{habit.name}</Text>
                        <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 4 }}>{habit.description}</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? Colors.primary : Colors.textMuted, backgroundColor: isSelected ? Colors.primary : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        {isSelected && <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>✓</Text>}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={handleFinish}
              disabled={loading}
              style={{
                backgroundColor: loading ? Colors.primaryDark : Colors.primary,
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 24,
                marginBottom: 24,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>
                  {t('onboarding.start_journey')}
                </Text>
              )}
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
