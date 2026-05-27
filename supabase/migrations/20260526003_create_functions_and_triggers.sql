-- Migration: create_functions_and_triggers
-- Description: Server-side functions and triggers for game mechanics

-- Function: Calculate XP for next level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(p_level INT)
RETURNS BIGINT AS $$
BEGIN
  RETURN floor(100 * power(1.15, p_level - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Handle new user (create profile after signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Adventurer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Process habit log (calculate XP, update streaks, check level up)
CREATE OR REPLACE FUNCTION public.process_habit_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_habit RECORD;
  v_profile RECORD;
  v_streak RECORD;
  v_base_xp INT;
  v_streak_mult NUMERIC;
  v_xp INT;
  v_coins INT;
  v_new_total_xp BIGINT;
  v_new_level INT;
  v_new_current_xp BIGINT;
  v_new_xp_to_next BIGINT;
BEGIN
  -- Only process completed habits
  IF NOT NEW.completed THEN
    RETURN NEW;
  END IF;

  -- Get habit info
  SELECT * INTO v_habit FROM public.habits WHERE id = NEW.habit_id;
  v_base_xp := v_habit.base_xp;

  -- Get current streak
  SELECT * INTO v_streak FROM public.user_streaks
  WHERE user_id = NEW.user_id AND habit_id = NEW.habit_id;

  -- Calculate streak multiplier
  IF v_streak IS NOT NULL THEN
    v_streak_mult := LEAST(2.0, 1.0 + (v_streak.current_streak * 0.05));
  ELSE
    v_streak_mult := 1.0;
  END IF;

  -- Calculate XP and coins
  v_xp := floor(v_base_xp * v_streak_mult);
  v_coins := ceil(v_xp * 0.3);

  -- Update the log with earned XP
  NEW.xp_earned := v_xp;
  NEW.coins_earned := v_coins;

  -- Update streak
  INSERT INTO public.user_streaks (user_id, habit_id, current_streak, longest_streak, last_completed_date)
  VALUES (NEW.user_id, NEW.habit_id, 1, 1, NEW.log_date)
  ON CONFLICT (user_id, habit_id) DO UPDATE SET
    current_streak = CASE
      WHEN user_streaks.last_completed_date = NEW.log_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_completed_date = NEW.log_date THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak,
      CASE
        WHEN user_streaks.last_completed_date = NEW.log_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_completed_date = NEW.log_date,
    updated_at = now();

  -- Update profile XP and potentially level
  SELECT * INTO v_profile FROM public.profiles WHERE id = NEW.user_id;
  v_new_total_xp := v_profile.total_xp + v_xp;
  v_new_current_xp := v_profile.current_level_xp + v_xp;
  v_new_level := v_profile.level;
  v_new_xp_to_next := v_profile.xp_to_next_level;

  -- Check for level up (could be multiple levels)
  WHILE v_new_current_xp >= v_new_xp_to_next LOOP
    v_new_current_xp := v_new_current_xp - v_new_xp_to_next;
    v_new_level := v_new_level + 1;
    v_new_xp_to_next := public.calculate_xp_for_level(v_new_level);
  END LOOP;

  UPDATE public.profiles SET
    total_xp = v_new_total_xp,
    current_level_xp = v_new_current_xp,
    xp_to_next_level = v_new_xp_to_next,
    level = v_new_level,
    coins = coins + v_coins,
    last_active_at = now(),
    updated_at = now()
  WHERE id = NEW.user_id;

  -- Update attribute XP
  INSERT INTO public.user_attributes (user_id, attribute_id, value)
  SELECT NEW.user_id, ham.attribute_id, v_xp * ham.xp_multiplier
  FROM public.habit_attribute_map ham
  WHERE ham.habit_id = NEW.habit_id
  ON CONFLICT (user_id, attribute_id) DO UPDATE SET
    value = user_attributes.value + EXCLUDED.value,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Process habit completion
CREATE OR REPLACE TRIGGER on_habit_log_insert
  BEFORE INSERT ON public.habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_habit_completion();

-- Function: update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
