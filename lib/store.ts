import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  auth_user_id: string;
  username: string;
  display_name: string;
  avatar_config: Record<string, any>;
  level: number;
  total_xp: number;
  current_level_xp: number;
  xp_to_next_level: number;
  coins: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_at: string;
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: 'health' | 'mind' | 'social' | 'focus';
  frequency: 'daily' | 'weekly';
  default_goal: {
    type: string;
    target: number;
    unit: string;
  };
  base_xp: number;
}

export interface UserHabit {
  id: string;
  user_id: string;
  habit_id: string;
  custom_goal: Record<string, any> | null;
  is_active: boolean;
  habit?: Habit;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  value: Record<string, any>;
  completed: boolean;
  xp_earned: number;
  coins_earned: number;
}

export interface UserAttribute {
  id: string;
  user_id: string;
  attribute_id: string;
  value: number;
  level: number;
  attribute?: Attribute;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend_profile?: Profile;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'cooperative';
  requirements: Record<string, any>;
  rewards: Record<string, any>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  condition: Record<string, any>;
  unlocked_at?: string;
}

// ============================================
// AUTH STORE
// ============================================
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isOnboarded: false,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
  }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  setOnboarded: (isOnboarded) => set({ isOnboarded }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (data && !error) {
      set({ profile: data as Profile });
      
      // Check onboarding status
      const { count } = await supabase
        .from('user_habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.id);
        
      set({ isOnboarded: count ? count > 0 : false });
    }
  },
}));

// ============================================
// GAME STORE (XP, Level, Streaks)
// ============================================
interface GameState {
  habits: Habit[];
  userHabits: UserHabit[];
  todayLogs: HabitLog[];
  attributes: Attribute[];
  userAttributes: UserAttribute[];
  streaks: UserStreak[];
  quests: Quest[];
  achievements: Achievement[];

  // Actions
  fetchHabits: () => Promise<void>;
  fetchUserHabits: () => Promise<void>;
  fetchTodayLogs: () => Promise<void>;
  fetchAttributes: () => Promise<void>;
  fetchUserAttributes: () => Promise<void>;
  fetchStreaks: () => Promise<void>;
  fetchQuests: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  completeHabit: (habitId: string, value: Record<string, any>) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    newLevel?: number;
  } | null>;
  addUserHabit: (habitId: string) => Promise<void>;
  loadAllData: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  habits: [],
  userHabits: [],
  todayLogs: [],
  attributes: [],
  userAttributes: [],
  streaks: [],
  quests: [],
  achievements: [],

  fetchHabits: async () => {
    const { data } = await supabase.from('habits').select('*').eq('is_active', true);
    if (data) set({ habits: data as Habit[] });
  },

  fetchUserHabits: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    const { data } = await supabase
      .from('user_habits')
      .select('*, habit:habits(*)')
      .eq('user_id', profile.id)
      .eq('is_active', true);
    if (data) set({ userHabits: data as UserHabit[] });
  },

  fetchTodayLogs: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('log_date', today);
    if (data) set({ todayLogs: data as HabitLog[] });
  },

  fetchAttributes: async () => {
    const { data } = await supabase.from('attributes').select('*');
    if (data) set({ attributes: data as Attribute[] });
  },

  fetchUserAttributes: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    const { data } = await supabase
      .from('user_attributes')
      .select('*, attribute:attributes(*)')
      .eq('user_id', profile.id);
    if (data) set({ userAttributes: data as UserAttribute[] });
  },

  fetchStreaks: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;
    const { data } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', profile.id);
    if (data) set({ streaks: data as UserStreak[] });
  },

  fetchQuests: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .lte('available_date', today);
    if (data) set({ quests: data as Quest[] });
  },

  fetchAchievements: async () => {
    const { data } = await supabase.from('achievements').select('*');
    if (data) set({ achievements: data as Achievement[] });
  },

  completeHabit: async (habitId, value) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return null;

    const prevLevel = profile.level;
    const today = new Date().toISOString().split('T')[0];

    // Optimistic Update: Assume success immediately
    const optimisticLog: HabitLog = {
      id: 'temp-' + Date.now(),
      user_id: profile.id,
      habit_id: habitId,
      log_date: today,
      value,
      completed: true,
      xp_earned: 0,
      coins_earned: 0,
      created_at: new Date().toISOString(),
    };

    set((state) => {
      // Remove any existing log for today to prevent duplicates
      const filteredLogs = state.todayLogs.filter(l => l.habit_id !== habitId);
      return { todayLogs: [...filteredLogs, optimisticLog] };
    });

    // Database Upsert
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert({
        user_id: profile.id,
        habit_id: habitId,
        log_date: today,
        value,
        completed: true,
      }, {
        onConflict: 'user_id,habit_id,log_date',
      })
      .select()
      .single();

    if (error || !data) {
      // Rollback on failure
      set((state) => ({ todayLogs: state.todayLogs.filter(l => l.id !== optimisticLog.id) }));
      return null;
    }

    const log = data as HabitLog;

    // Refresh profile to get updated XP/level sequentially
    await useAuthStore.getState().fetchProfile();
    const newProfile = useAuthStore.getState().profile;

    // Refresh other states securely
    await get().fetchTodayLogs();
    await get().fetchStreaks();
    await get().fetchUserAttributes();

    return {
      xpEarned: log.xp_earned,
      coinsEarned: log.coins_earned,
      leveledUp: newProfile ? newProfile.level > prevLevel : false,
      newLevel: newProfile?.level,
    };
  },

  addUserHabit: async (habitId: string) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;

    const { error } = await supabase
      .from('user_habits')
      .insert({
        user_id: profile.id,
        habit_id: habitId,
        is_active: true,
      });

    if (!error) {
      await get().fetchUserHabits();
      await get().fetchQuests();
    }
  },

  loadAllData: async () => {
    await Promise.all([
      get().fetchHabits(),
      get().fetchUserHabits(),
      get().fetchTodayLogs(),
      get().fetchAttributes(),
      get().fetchUserAttributes(),
      get().fetchStreaks(),
      get().fetchQuests(),
      get().fetchAchievements(),
    ]);
  },
}));

// ============================================
// SOCIAL STORE
// ============================================
interface SocialState {
  friends: Friendship[];
  leaderboard: Array<{
    user_id: string;
    total_xp: number;
    habits_completed: number;
    rank: number;
    profile?: Profile;
  }>;
  fetchFriends: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  sendFriendRequest: (friendUsername: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
}

export const useSocialStore = create<SocialState>((set) => ({
  friends: [],
  leaderboard: [],

  fetchFriends: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;

    const { data } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friendships_friend_id_fkey(*)
      `)
      .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`)
      .eq('status', 'accepted');

    if (data) set({ friends: data as Friendship[] });
  },

  fetchLeaderboard: async () => {
    const weekStart = getWeekStart();
    const { data } = await supabase
      .from('leaderboard_weekly')
      .select('*, profile:profiles(*)')
      .eq('week_start', weekStart)
      .order('total_xp', { ascending: false })
      .limit(20);

    if (data) set({ leaderboard: data });
  },

  sendFriendRequest: async (friendUsername) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return false;

    // Find friend by username
    const { data: friendData } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', friendUsername)
      .single();

    if (!friendData) return false;

    const { error } = await supabase.from('friendships').insert({
      user_id: profile.id,
      friend_id: friendData.id,
      status: 'pending',
    });

    return !error;
  },

  acceptFriendRequest: async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    return !error;
  },
}));

// Helper
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
