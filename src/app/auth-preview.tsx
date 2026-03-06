import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { AuthHeader } from '@/components/ui/auth-header';
import { AuthLegal } from '@/components/ui/auth-legal';
import { BackCircleButton } from '@/components/ui/back-circle-button';
import { FormInput } from '@/components/ui/form-input';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialAuthButton } from '@/components/ui/social-auth-button';
import { TopicChip } from '@/components/ui/topic-chip';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TOPIC_DATA = [
  { key: 'economy', emoji: '\uD83C\uDF0D' },
  { key: 'technology', emoji: '\uD83D\uDCBB' },
  { key: 'security', emoji: '\uD83E\uDE96' },
  { key: 'politics', emoji: '\uD83C\uDFA4' },
  { key: 'society', emoji: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1' },
  { key: 'environment', emoji: '\uD83C\uDF31' },
  { key: 'transport', emoji: '\uD83D\uDEEB' },
  { key: 'health', emoji: '\uD83E\uDE7A' },
  { key: 'sport', emoji: '\u26BD' },
] as const;

export default function AuthPreviewScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['economy']);

  const topics = useMemo(() => TOPIC_DATA, []);

  const toggleTopic = (value: string) => {
    setSelectedTopics((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + Spacing.six,
        },
      ]}>
      <View style={styles.safeArea}>
        <View style={styles.block}>
          <BackCircleButton onPress={() => {}} />
          <AuthHeader
            title={t('auth.createAccount')}
            subtitle={t('auth.alreadyHaveAccount')}
            actionLabel={t('auth.signIn')}
            onPressAction={() => {}}
          />

          <FormInput
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftAccessory={<Feather name="mail" size={27} color={theme.text} />}
          />

          <FormInput
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={27} color={theme.text} />}
          />

          <FormInput
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={27} color={theme.text} />}
          />

          <AppButton label={t('auth.createAccountCta')} onPress={() => {}} />
          <OrDivider />
          <SocialAuthButton provider="apple" />
          <SocialAuthButton provider="google" />
          <AuthLegal />
        </View>

        <View style={styles.block}>
          <AuthHeader title={t('auth.selectTopicsTitle')} subtitle={t('auth.selectTopicsSubtitle')} />
          <View style={styles.chipWrap}>
            {topics.map((topic) => (
              <TopicChip
                key={topic.key}
                label={t(`topics.${topic.key}`)}
                emoji={topic.emoji}
                selected={selectedTopics.includes(topic.key)}
                onPress={() => toggleTopic(topic.key)}
              />
            ))}
          </View>
          <AppButton label={t('common.continue')} onPress={() => {}} />
          <AppButton variant="ghost" label={t('common.skipStep')} onPress={() => {}} />
        </View>

        <View style={[styles.block, styles.homeBlock]}>
          <AppTopBar
            leftAction={{ icon: 'menu', onPress: () => {} }}
            rightAction={{ icon: 'bell', onPress: () => {} }}
            logo={<Image source={require('@/assets/expo.icon/Assets/logo-all-white.png')} style={styles.logoImage} contentFit="contain" />}
          />

          <View style={styles.homeContent}>
            <ThemedText style={styles.welcomeTitle}>{t('auth.welcomeBack', { name: 'Tyler' })}</ThemedText>
            <ThemedText style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
              {t('auth.discoverNews')}
            </ThemedText>

            <View style={styles.liveCardWrap}>
              <LiveAudioCard
                title={t('auth.liveHeadline')}
                subtitle={t('auth.liveSubtitle')}
                onPress={() => {}}
                onPressPlay={() => {}}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.six,
  },
  safeArea: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  block: {
    gap: Spacing.three,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  homeBlock: {
    paddingHorizontal: 0,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E8',
  },
  logoImage: {
    width: 122,
    height: 60,
  },
  homeContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.half,
    minHeight: 260,
  },
  welcomeTitle: {
    fontSize: 36 / 1.5,
    lineHeight: 42 / 1.5,
    fontWeight: 700,
  },
  welcomeSubtitle: {
    fontSize: 17 / 1.2,
    lineHeight: 25 / 1.2,
    fontWeight: 500,
  },
  liveCardWrap: {
    marginTop: 'auto',
    marginBottom: Spacing.three,
  },
});
