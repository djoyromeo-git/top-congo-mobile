import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { Palette, Spacing } from '@/constants/theme';

type OnboardingScreenProps = {
  onPressCreateAccount?: () => void;
  onPressContinueWithoutAccount?: () => void;
  onPressTryPremium?: () => void;
};

export default function OnboardingScreen({
  onPressCreateAccount,
  onPressContinueWithoutAccount,
  onPressTryPremium,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [sliderWidth, setSliderWidth] = React.useState(() => {
    const deviceWidth = Dimensions.get('window')?.width || windowWidth || 0;
    return Math.max(1, Math.round(deviceWidth));
  });
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
  const currentIndexRef = React.useRef(0);

  const slides = React.useMemo(
    () => [
      {
        key: 'news',
        title: t('onboarding.firstTitle'),
        subtitle: t('onboarding.firstSubtitle'),
      },
      {
        key: 'live',
        title: t('onboarding.secondTitle'),
        subtitle: t('onboarding.secondSubtitle'),
      },
      {
        key: 'premium',
        title: t('onboarding.thirdTitle'),
        subtitle: t('onboarding.thirdSubtitle'),
      },
    ],
    [t]
  );

  const handleCreateAccount = onPressCreateAccount ?? (() => router.replace('/auth/register'));
  const handleContinueWithoutAccount =
    onPressContinueWithoutAccount ?? (() => router.replace('/(tabs)'));
  const handleTryPremium = onPressTryPremium ?? (() => router.replace('/premium'));

  const applyIndex = React.useCallback((index: number) => {
    setActiveIndex(index);
    currentIndexRef.current = index;
  }, []);

  const handleMomentumEnd = React.useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const pageWidth = layoutMeasurement?.width || sliderWidth;
      if (!pageWidth) {
        return;
      }
      const index = Math.round(contentOffset.x / pageWidth);
      applyIndex(index);
    },
    [applyIndex, sliderWidth]
  );

  const handleSliderLayout = React.useCallback(
    (event) => {
      const measuredWidth = Math.round(event.nativeEvent.layout.width);
      if (measuredWidth && measuredWidth !== sliderWidth) {
        setSliderWidth(measuredWidth);
      }
    },
    [sliderWidth]
  );

  React.useEffect(() => {
    const nextWidth = Math.round(windowWidth);
    if (nextWidth && nextWidth !== sliderWidth) {
      setSliderWidth(nextWidth);
    }
  }, [windowWidth, sliderWidth]);

  const renderSlide = React.useCallback(
    ({ item }: { item: (typeof slides)[number] }) => (
      <View style={[styles.slide, { width: sliderWidth }]}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
      </View>
    ),
    [sliderWidth, styles.subtitle, styles.title]
  );

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (!flatListRef.current || !sliderWidth) {
        return false;
      }
      try {
        flatListRef.current.scrollToIndex({ index, animated: true });
        applyIndex(index);
        return true;
      } catch {
        return false;
      }
    },
    [applyIndex, sliderWidth]
  );

  const getItemLayout = React.useCallback(
    (_: unknown, index: number) => ({
      length: sliderWidth,
      offset: sliderWidth * index,
      index,
    }),
    [sliderWidth]
  );

  React.useEffect(() => {
    if (!sliderWidth || slides.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % slides.length;
      const ok = scrollToIndex(nextIndex);
      if (!ok) {
        const offset = nextIndex * sliderWidth;
        flatListRef.current?.scrollToOffset({ offset, animated: true });
        applyIndex(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [applyIndex, scrollToIndex, sliderWidth, slides.length]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={Palette.blueShade['700']} />
      <View style={styles.topRing} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Image
              source={require('@/assets/expo.icon/Assets/logo-all-white.png')}
              style={styles.logo}
              contentFit="contain"
            />

            <View style={styles.pagination}>
              {slides.map((slide, index) => (
                <View
                  key={slide.key}
                  style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}
                />
              ))}
            </View>

            <View style={styles.sliderContainer}>
              <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                extraData={sliderWidth}
                onScrollToIndexFailed={({ index }) => {
                  const offset = index * sliderWidth;
                  flatListRef.current?.scrollToOffset({ offset, animated: true });
                }}
                keyExtractor={(item) => item.key}
                style={[styles.slider, { width: sliderWidth }]}
                onMomentumScrollEnd={handleMomentumEnd}
                onLayout={handleSliderLayout}
                getItemLayout={getItemLayout}
                snapToInterval={sliderWidth}
                renderItem={renderSlide}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <View pointerEvents="none" style={styles.buttonArcMask}>
              <View style={styles.buttonArc} />
            </View>

            <AppButton
              testID="onboarding-create-account"
              label={t('onboarding.createAccount')}
              onPress={handleCreateAccount}
            />
            <AppButton
              testID="onboarding-continue-without-account"
              label={t('onboarding.continueWithoutAccount')}
              variant="ghost"
              onPress={handleContinueWithoutAccount}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            />
            <Pressable
              testID="onboarding-try-premium"
              onPress={handleTryPremium}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText
                style={styles.secondaryAction}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                {t('onboarding.tryPremium')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.blueShade['700'],
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
  },
  heroSection: {
    marginTop: 96,
    alignItems: 'center',
    gap: Spacing.one,
  },
  logo: {
    width: 164,
    height: 80,
    marginBottom: Spacing.five,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  paginationDot: {
    width: 8,
    height: 8,
    marginBottom: Spacing.two,
    borderRadius: 5,
    backgroundColor: Palette.blue['400'],
    opacity: 0.65,
  },
  paginationDotActive: {
    width: 52,
    height: 8,
    borderRadius: 999,
    backgroundColor: Palette.neutral['100'],
    opacity: 1,
  },
  sliderContainer: {
    marginTop: Spacing.two,
    marginHorizontal: -20,
  },
  slider: {
    flexGrow: 0,
    width: '100%',
  },
  slide: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: Palette.neutral['100'],
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
    letterSpacing: -0.4,
    marginTop: Spacing.one,
    maxWidth: 342,
  },
  subtitle: {
    marginTop: Spacing.one,
    color: Palette.blue['200'],
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 500,
    maxWidth: 338,
  },
  actions: {
    position: 'relative',
    gap: 8,
    paddingBottom: Spacing.one,
  },
  buttonArcMask: {
    position: 'absolute',
    top: -200,
    left: -20,
    right: -20,
    height: 200,
    overflow: 'hidden',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    zIndex: -1,
  },
  buttonArc: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 50,
    borderColor: Palette.blueShade['300'],
    opacity: 0.38,
    bottom: -352,
    left: -280,
    zIndex: -1,
  },
  secondaryButton: {
    borderColor: Palette.neutral['100'],
    backgroundColor: 'transparent',
  },
  secondaryButtonLabel: {
    color: Palette.neutral['100'],
  },
  secondaryAction: {
    color: Palette.neutral['100'],
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 500,
  },
  topRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 32,
    borderColor: Palette.blueShade['300'],
    opacity: 0.42,
    top: -72,
    right: -72,
  },
  pressed: {
    opacity: 0.75,
  },
});
