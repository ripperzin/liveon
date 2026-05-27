-- Migration: create_core_schema
-- Description: Creates all core tables for the Live ON gamified wellness app

-- PROFILES (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_config JSONB DEFAULT '{}',
    level INT DEFAULT 1 CHECK (level >= 1),
    total_xp BIGINT DEFAULT 0 CHECK (total_xp >= 0),
    current_level_xp BIGINT DEFAULT 0 CHECK (current_level_xp >= 0),
    xp_to_next_level BIGINT DEFAULT 100 CHECK (xp_to_next_level > 0),
    coins INT DEFAULT 0 CHECK (coins >= 0),
    current_streak_days INT DEFAULT 0 CHECK (current_streak_days >= 0),
    longest_streak_days INT DEFAULT 0 CHECK (longest_streak_days >= 0),
    last_active_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- HABITS (global catalog)
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('health', 'mind', 'social', 'focus')),
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    default_goal JSONB NOT NULL,
    base_xp INT NOT NULL DEFAULT 10 CHECK (base_xp > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER_HABITS
CREATE TABLE public.user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES public.habits(id) NOT NULL,
    custom_goal JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, habit_id)
);

CREATE INDEX idx_user_habits_user ON public.user_habits(user_id);

-- HABIT_LOGS
CREATE TABLE public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES public.habits(id) NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    value JSONB NOT NULL,
    completed BOOLEAN DEFAULT false,
    xp_earned INT DEFAULT 0,
    coins_earned INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, habit_id, log_date)
);

CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, log_date);

-- ATTRIBUTES
CREATE TABLE public.attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT
);

-- USER_ATTRIBUTES
CREATE TABLE public.user_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attribute_id UUID REFERENCES public.attributes(id) NOT NULL,
    value INT DEFAULT 0,
    level INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, attribute_id)
);

CREATE INDEX idx_user_attributes_user ON public.user_attributes(user_id);

-- HABIT_ATTRIBUTE_MAP
CREATE TABLE public.habit_attribute_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES public.habits(id) NOT NULL,
    attribute_id UUID REFERENCES public.attributes(id) NOT NULL,
    xp_multiplier INT DEFAULT 1,
    UNIQUE(habit_id, attribute_id)
);

-- USER_STREAKS
CREATE TABLE public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES public.habits(id),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_completed_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, habit_id)
);

CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);

-- FRIENDSHIPS
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, friend_id),
    CHECK(user_id != friend_id)
);

CREATE INDEX idx_friendships_user ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id);

-- QUESTS
CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'cooperative')),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    available_date DATE,
    expires_at DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER_QUESTS
CREATE TABLE public.user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) NOT NULL,
    progress JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'expired')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, quest_id)
);

CREATE INDEX idx_user_quests_user ON public.user_quests(user_id);

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    condition JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ACHIEVEMENTS_UNLOCKED
CREATE TABLE public.achievements_unlocked (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- LEADERBOARD_WEEKLY
CREATE TABLE public.leaderboard_weekly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    total_xp BIGINT DEFAULT 0,
    habits_completed INT DEFAULT 0,
    rank INT,
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_leaderboard_week ON public.leaderboard_weekly(week_start, total_xp DESC);
