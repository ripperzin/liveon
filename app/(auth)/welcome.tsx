import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '⚔️',
    titleKey: 'onboarding.slide1_title',
    descKey: 'onboarding.slide1_desc',
    gradient: [Colors.primary, Colors.primaryDark],
  },
  {
    emoji: '🧬',
    titleKey: 'onboarding.slide2_title',
    descKey: 'onboarding.slide2_desc',
    gradient: [Colors.secondary, Colors.secondaryDark],
  },
  {
    emoji: '👥',
    titleKey: 'onboarding.slide3_title',
    descKey: 'onboarding.slide3_desc',
    gradient: [Colors.accentGreen, '#009B77'],
  },
];

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slide);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceDark }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(800)}
        style={{
          paddingTop: 80,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontWeight: '800',
            color: Colors.textPrimary,
            letterSpacing: -1,
          }}
        >
          Live{' '}
          <Text style={{ color: Colors.primary }}>ON</Text>
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors.textSecondary,
            marginTop: 8,
          }}
        >
          {t('onboarding.welcome_subtitle')}
        </Text>
      </Animated.View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, marginTop: 40 }}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{
              width: SCREEN_WIDTH,
              paddingHorizontal: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Emoji Icon */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: slide.gradient[0] + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 32,
                borderWidth: 2,
                borderColor: slide.gradient[0] + '40',
              }}
            >
              <Text style={{ fontSize: 56 }}>{slide.emoji}</Text>
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: Colors.textPrimary,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              {t(slide.titleKey)}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              {t(slide.descKey)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 24,
          gap: 8,
        }}
      >
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={{
              width: currentSlide === index ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentSlide === index ? Colors.primary : Colors.surfaceLight,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </View>

      {/* Bottom Buttons */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={{ paddingHorizontal: 24, paddingBottom: 48, gap: 12 }}
      >
        <Animated.View style={animatedButtonStyle}>
          <Pressable
            onPress={handleNext}
            onPressIn={() => { buttonScale.value = withSpring(0.96); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: Colors.textPrimary,
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              {currentSlide === SLIDES.length - 1 ? t('onboarding.start_journey') : t('continue')}
            </Text>
          </Pressable>
        </Animated.View>

        {currentSlide === SLIDES.length - 1 && (
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={{
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.surfaceLight,
            }}
          >
            <Text
              style={{
                color: Colors.textSecondary,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {t('auth.has_account')} {t('auth.login')}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}
