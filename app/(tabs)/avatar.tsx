import { View, Text, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, getAttributeColor, getRarityColor } from '@/constants/Colors';
import { useAuthStore, useGameStore } from '@/lib/store';
import { useAvatarState } from '@/lib/avatar';
import { AvatarRenderer } from '@/components/avatar';
import RadarChart from '@/components/RadarChart';
import { useFocusEffect } from 'expo-router';

export default function AvatarScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const avatarState = useAvatarState(profile?.id);
  const { userAttributes, achievements, loadAllData, shopItems, userInventory, buyItem, equipItem } = useGameStore();

  const equippedTitle = userInventory.find(i => i.is_equipped && i.item?.type === 'title')?.item;

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

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
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {profile && avatarState ? (
              <AvatarRenderer state={avatarState} size={140} />
            ) : (
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: Colors.surfaceLight,
                }}
              />
            )}
          </View>

          {/* Name & Title */}
          <Text style={{ fontSize: 24, color: Colors.textPrimary, fontWeight: '800', marginTop: 16 }}>
            {profile?.display_name || 'Adventurer'}
          </Text>
          {equippedTitle ? (
            <Text style={{ fontSize: 14, color: Colors.accentGold, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' }}>
              {equippedTitle.icon} {equippedTitle.name}
            </Text>
          ) : (
            <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 4 }}>
              {getTitle(profile?.level || 1)}
            </Text>
          )}

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

        {/* Attributes Radar Chart */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 24, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 12, alignSelf: 'flex-start' }}>
            {t('avatar.attributes')}
          </Text>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 24,
              padding: 16,
              width: '100%',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.surfaceLight,
            }}
          >
            <RadarChart
              data={allAttributes.map((attr) => {
                const userAttr = userAttributes.find((ua) => ua.attribute?.slug === attr.slug);
                return {
                  label: t(`attributes.${attr.key}`).substring(0, 3).toUpperCase(),
                  value: userAttr?.value || 0,
                  color: getAttributeColor(attr.slug),
                  max: 100, // assuming 100 is max for chart scale
                };
              })}
              size={280}
            />
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

        {/* Cosmetics Shop */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={{ marginHorizontal: 24, marginTop: 40, marginBottom: 40 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, color: Colors.textPrimary, fontWeight: '800' }}>
              Loja de Cosméticos
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: Colors.accentGold, fontSize: 16, fontWeight: '800', marginRight: 4 }}>
                {profile?.coins || 0}
              </Text>
              <Text style={{ fontSize: 16 }}>🪙</Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {shopItems.map((item, index) => {
              const inventoryRecord = userInventory.find(inv => inv.item_id === item.id);
              const isOwned = !!inventoryRecord;
              const isEquipped = inventoryRecord?.is_equipped;

              return (
                <Animated.View key={item.id} entering={FadeInRight.delay(200 + index * 100).duration(400)}>
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: Colors.surface,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: isEquipped ? 1 : 0,
                    borderColor: Colors.primary,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{ width: 40, height: 40, backgroundColor: Colors.surfaceDark, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}>
                          {item.name}
                        </Text>
                        <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2, marginRight: 8 }} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                    </View>

                    {isOwned ? (
                      item.type === 'title' || item.type === 'border' ? (
                        <Pressable
                          onPress={async () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            if (!isEquipped) await equipItem(item.id, item.type);
                          }}
                          style={{
                            backgroundColor: isEquipped ? Colors.primary + '20' : Colors.surfaceLight,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 12,
                          }}
                        >
                          <Text style={{ color: isEquipped ? Colors.primary : Colors.textMuted, fontSize: 13, fontWeight: '700' }}>
                            {isEquipped ? 'Equipado' : 'Equipar'}
                          </Text>
                        </Pressable>
                      ) : (
                        <View style={{ backgroundColor: Colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
                          <Text style={{ color: Colors.textMuted, fontSize: 13, fontWeight: '700' }}>Comprado</Text>
                        </View>
                      )
                    ) : (
                      <Pressable
                        onPress={async () => {
                          if ((profile?.coins || 0) >= item.price) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            await buyItem(item.id, item.price);
                          } else {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          }
                        }}
                        style={({ pressed }) => ({
                          backgroundColor: (profile?.coins || 0) >= item.price ? Colors.accentGold : Colors.surfaceLight,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 12,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <Text style={{ color: (profile?.coins || 0) >= item.price ? '#000' : Colors.textMuted, fontSize: 13, fontWeight: '800' }}>
                          {item.price} 🪙
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
