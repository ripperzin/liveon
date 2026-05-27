-- Migration: enable_rls_policies
-- Description: Enable RLS on all tables and create access policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_attribute_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements_unlocked ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view any profile" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING ((select auth.uid()) = auth_user_id)
  WITH CHECK ((select auth.uid()) = auth_user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = auth_user_id);

-- HABITS (read-only for all authenticated)
CREATE POLICY "Anyone can view habits" ON public.habits
  FOR SELECT TO authenticated USING (true);

-- USER_HABITS
CREATE POLICY "Users can view own habits" ON public.user_habits
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can manage own habits" ON public.user_habits
  FOR ALL TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())))
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

-- HABIT_LOGS
CREATE POLICY "Users can view own logs" ON public.habit_logs
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can insert own logs" ON public.habit_logs
  FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can update own logs" ON public.habit_logs
  FOR UPDATE TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())))
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

-- ATTRIBUTES (read-only for all authenticated)
CREATE POLICY "Anyone can view attributes" ON public.attributes
  FOR SELECT TO authenticated USING (true);

-- USER_ATTRIBUTES
CREATE POLICY "Users can view own attributes" ON public.user_attributes
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can view friend attributes" ON public.user_attributes
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT friend_id FROM public.friendships WHERE user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())) AND status = 'accepted'
      UNION
      SELECT user_id FROM public.friendships WHERE friend_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())) AND status = 'accepted'
    )
  );

-- HABIT_ATTRIBUTE_MAP (read-only)
CREATE POLICY "Anyone can view habit attribute map" ON public.habit_attribute_map
  FOR SELECT TO authenticated USING (true);

-- USER_STREAKS
CREATE POLICY "Users can view own streaks" ON public.user_streaks
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

-- FRIENDSHIPS
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))
    OR friend_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))
  );
CREATE POLICY "Users can send friend requests" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can update own friendships" ON public.friendships
  FOR UPDATE TO authenticated USING (
    friend_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))
  );

-- QUESTS (read-only for all authenticated)
CREATE POLICY "Anyone can view quests" ON public.quests
  FOR SELECT TO authenticated USING (true);

-- USER_QUESTS
CREATE POLICY "Users can view own quests" ON public.user_quests
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can manage own quests" ON public.user_quests
  FOR ALL TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())))
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

-- ACHIEVEMENTS (read-only for all authenticated)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT TO authenticated USING (true);

-- ACHIEVEMENTS_UNLOCKED
CREATE POLICY "Users can view own achievements" ON public.achievements_unlocked
  FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

-- LEADERBOARD (viewable by all authenticated)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_weekly
  FOR SELECT TO authenticated USING (true);
