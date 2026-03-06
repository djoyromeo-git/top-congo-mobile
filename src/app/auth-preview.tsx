import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from '@/components/themed-text';

const TOPIC_DATA = [
  { label: 'Economie', emoji: '🌍' },
  { label: 'Technologies', emoji: '💻' },
  { label: 'Securite', emoji: '🪖' },
  { label: 'Politique', emoji: '🎤' },
  { label: 'Societe', emoji: '🧑‍🤝‍🧑' },
  { label: 'Environnement', emoji: '🌱' },
  { label: 'Transport', emoji: '🛫' },
  { label: 'Sante', emoji: '🩺' },
  { label: 'Sport', emoji: '⚽' },
] as const;

export default function AuthPreviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Economie']);

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
            title="Creer un compte"
            subtitle="Vous avez deja un compte?"
            actionLabel="Connectez-vous"
            onPressAction={() => {}}
          />

          <FormInput
            label="Adresse email"
            placeholder="Votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftAccessory={<Feather name="mail" size={27} color={theme.text} />}
          />

          <FormInput
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={27} color={theme.text} />}
          />

          <FormInput
            label="Confirmer le mot de passe"
            placeholder="Repetez votre mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
            leftAccessory={<Feather name="lock" size={27} color={theme.text} />}
          />

          <AppButton label="Creer mon compte" onPress={() => {}} />
          <OrDivider />
          <SocialAuthButton provider="apple" />
          <SocialAuthButton provider="google" />
          <AuthLegal />
        </View>

        <View style={styles.block}>
          <AuthHeader
            title="Selectionnez les sujets qui vous interessent"
            subtitle="Selectionnez un ou plusieurs sujets pour personnaliser votre fil."
          />
          <View style={styles.chipWrap}>
            {topics.map((topic) => (
              <TopicChip
                key={topic.label}
                label={topic.label}
                emoji={topic.emoji}
                selected={selectedTopics.includes(topic.label)}
                onPress={() => toggleTopic(topic.label)}
              />
            ))}
          </View>
          <AppButton label="Continuer" onPress={() => {}} />
          <AppButton variant="ghost" label="Ignorer cette etape" onPress={() => {}} />
        </View>

        <View style={[styles.block, styles.homeBlock]}>
          <AppTopBar
            leftAction={{ icon: 'menu', onPress: () => {} }}
            rightAction={{ icon: 'bell', onPress: () => {} }}
            logo={
              <ThemedText style={[styles.logoText, { color: Palette.neutral['100'] }]}>
                Top Congo FM
              </ThemedText>
            }
          />

          <View style={styles.homeContent}>
            <ThemedText style={styles.welcomeTitle}>Welcome back, Tyler!</ThemedText>
            <ThemedText style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
              Discover a world of news that matters to you
            </ThemedText>

            <View style={styles.liveCardWrap}>
              <LiveAudioCard
                title="Suivez l'actualite en continue"
                subtitle="avec Top Congo"
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
  logoText: {
    fontSize: 18 / 1.3,
    lineHeight: 20 / 1.3,
    fontWeight: 700,
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
