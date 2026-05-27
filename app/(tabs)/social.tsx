import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useAuthStore, useSocialStore } from '@/lib/store';

export default function SocialScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { friends, leaderboard, fetchFriends, fetchLeaderboard, sendFriendRequest } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'ranking'>('friends');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchLeaderboard();
  }, []);

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    const success = await sendFriendRequest(friendUsername.trim());
    if (success) {
      Alert.alert(t('success'), 'Friend request sent!');
      setFriendUsername('');
      setShowAddFriend(false);
    } else {
      Alert.alert(t('error'), 'User not found or request already sent');
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
            {t('social.title')}
          </Text>
        </Animated.View>

        {/* Your Code */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{
            marginHorizontal: 24,
            marginTop: 16,
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.surfaceLight,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600' }}>
              {t('social.friend_code')}
            </Text>
            <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
              @{profile?.username || 'user'}
            </Text>
          </View>
          <Pressable
            style={{
              backgroundColor: Colors.primary + '20',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '700' }}>Copy</Text>
          </Pressable>
        </Animated.View>

        {/* Tabs */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            flexDirection: 'row',
            marginHorizontal: 24,
            marginTop: 20,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(['friends', 'ranking'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: activeTab === tab ? Colors.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? '#FFF' : Colors.textMuted,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                {t(`social.${tab}`)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Content */}
        {activeTab === 'friends' ? (
          <View style={{ marginTop: 16 }}>
            {/* Add Friend Button */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              style={{ marginHorizontal: 24, marginBottom: 16 }}
            >
              {!showAddFriend ? (
                <Pressable
                  onPress={() => setShowAddFriend(true)}
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                    + {t('social.add_friend')}
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: Colors.surfaceLight,
                  }}
                >
                  <TextInput
                    value={friendUsername}
                    onChangeText={setFriendUsername}
                    placeholder="@username"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    style={{
                      backgroundColor: Colors.surfaceLight,
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: Colors.textPrimary,
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => setShowAddFriend(false)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.surfaceLight }}
                    >
                      <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>{t('cancel')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddFriend}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.primary }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('social.add_friend')}</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Friend List */}
            {friends.length > 0 ? (
              friends.map((friendship, index) => (
                <Animated.View
                  key={friendship.id}
                  entering={FadeInRight.delay(400 + index * 80).duration(400)}
                  style={{
                    marginHorizontal: 24,
                    backgroundColor: Colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1,
                    borderColor: Colors.surfaceLight,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: Colors.primary + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.primary }}>
                      {(friendship.friend_profile?.display_name || 'F')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}>
                      {friendship.friend_profile?.display_name || 'Friend'}
                    </Text>
                    <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      Level {friendship.friend_profile?.level || 1}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: Colors.accentGreen,
                    }}
                  />
                </Animated.View>
              ))
            ) : (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                  No friends yet. Add someone to start competing!
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Ranking Tab
          <View style={{ marginTop: 16, paddingHorizontal: 24 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 16, fontWeight: '600' }}>
              {t('social.weekly_ranking')}
            </Text>

            {/* Mock Leaderboard */}
            {(leaderboard.length > 0 ? leaderboard : [
              { rank: 1, total_xp: 450, profile: { display_name: profile?.display_name || 'You', level: profile?.level || 1 } },
            ]).map((entry: any, index: number) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(300 + index * 80).duration(400)}
                style={{
                  backgroundColor: index === 0
                    ? Colors.accentGold + '10'
                    : Colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: index === 0
                    ? Colors.accentGold + '30'
                    : Colors.surfaceLight,
                }}
              >
                {/* Rank */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: index === 0
                      ? Colors.accentGold + '20'
                      : index === 1
                      ? Colors.textSecondary + '20'
                      : index === 2
                      ? Colors.accentCoral + '20'
                      : Colors.surfaceLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: index < 3 ? 18 : 14,
                      fontWeight: '800',
                      color: index === 0
                        ? Colors.accentGold
                        : index === 1
                        ? Colors.textSecondary
                        : index === 2
                        ? Colors.accentCoral
                        : Colors.textPrimary,
                    }}
                  >
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank || index + 1}
                  </Text>
                </View>

                {/* Profile */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: '700' }}>
                    {entry.profile?.display_name || 'Player'}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    Level {entry.profile?.level || 1}
                  </Text>
                </View>

                {/* XP */}
                <Text style={{ color: Colors.secondary, fontSize: 16, fontWeight: '800' }}>
                  {entry.total_xp} XP
                </Text>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
