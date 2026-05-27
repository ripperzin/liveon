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

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert(t('error'), error.message);
    }
    // Navigation will happen automatically via auth state listener in _layout
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.surfaceDark }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Logo */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ alignItems: 'center', marginBottom: 48 }}
        >
          <Text
            style={{
              fontSize: 42,
              fontWeight: '800',
              color: Colors.textPrimary,
              letterSpacing: -1,
            }}
          >
            Live{' '}
            <Text style={{ color: Colors.primary }}>ON</Text>
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
            {t('onboarding.welcome_subtitle')}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ gap: 16 }}>
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

          {/* Forgot Password */}
          <Pressable style={{ alignSelf: 'flex-end' }}>
            <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '600' }}>
              {t('auth.forgot_password')}
            </Text>
          </Pressable>

          {/* Login Button */}
          <Animated.View style={animatedButtonStyle}>
            <Pressable
              onPress={handleLogin}
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
                {loading ? t('loading') : t('auth.login')}
              </Text>
            </Pressable>
          </Animated.View>

        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}
        >
          <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>
            {t('auth.no_account')}{' '}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: '700' }}>
                {t('auth.signup')}
              </Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
