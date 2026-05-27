import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { AvatarCompanion } from '@/components/avatar';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 26 : 22, marginBottom: 2 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? Colors.primary : Colors.textMuted,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.surfaceLight,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" label={t('tabs.home')} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="✅" label={t('tabs.habits')} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="avatar"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🧑" label={t('tabs.avatar')} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👥" label={t('tabs.social')} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚔️" label={t('tabs.quests')} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <AvatarCompanion />
    </View>
  );
}
