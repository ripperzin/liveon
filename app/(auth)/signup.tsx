import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
        },
      },
    });

    setLoading(false);
    if (error) {
      // If error says user already exists, let's just try to log them in!
      if (error.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (!signInError) return; // Router will auto-redirect due to auth state change
      }
      Alert.alert(t('error'), error.message);
    } else {
      // Try to login immediately since our DB trigger auto-confirms emails for MVP
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (loginError) {
        Alert.alert(
          t('success'),
          'Account created! Please return to Login screen and log in.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
      // If login succeeds, the AuthGate in _layout.tsx will catch the session and redirect automatically.
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.surfaceDark }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ alignItems: 'center', marginBottom: 40 }}
        >
          <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 }}>
            {t('auth.signup')}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>
            {t('onboarding.welcome_subtitle')}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ gap: 16 }}>
          {/* Display Name */}
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
              Display Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.textPrimary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.surfaceLight,
              }}
            />
          </View>

          {/* Email */}
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
              {t('auth.email')}
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.textPrimary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.surfaceLight,
              }}
            />
          </View>

          {/* Password */}
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
              {t('auth.password')}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.textPrimary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.surfaceLight,
              }}
            />
          </View>

          {/* Confirm Password */}
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
              {t('auth.confirm_password')}
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: Colors.textPrimary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.surfaceLight,
              }}
            />
          </View>

          {/* Signup Button */}
          <Animated.View style={animatedButtonStyle}>
            <Pressable
              onPress={handleSignup}
              disabled={loading}
              onPressIn={() => { buttonScale.value = withSpring(0.96); }}
              onPressOut={() => { buttonScale.value = withSpring(1); }}
              style={{
                backgroundColor: loading ? Colors.primaryDark : Colors.primary,
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 8,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
                {loading ? t('loading') : t('auth.signup')}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Login Link */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}
        >
          <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>
            {t('auth.has_account')}{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: '700' }}>
                {t('auth.login')}
              </Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
