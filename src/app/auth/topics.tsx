import { Check } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { selectTopicChipOptions, useTopicsOptions } from '@/features/topics/infrastructure/fetch-topics-options';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AuthScreenLayout } from './_layout';

export default function TopicsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { clearError, error, isSubmitting, updatePreferences } = useCredentialsAuth();
  const [selected, setSelected] = React.useState<string[]>([]);
  const topicsQuery = useTopicsOptions();

  const topics = React.useMemo(() => selectTopicChipOptions(topicsQuery.data ?? []), [topicsQuery.data]);
  const hasSelection = selected.length > 0;

  const toggleTopic = (id: string) => {
    clearError();
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleContinue = React.useCallback(async () => {
    if (!hasSelection) {
      return;
    }

    const isSaved = await updatePreferences(selected);
    if (!isSaved) {
      return;
    }

    router.replace('/(tabs)');
  }, [hasSelection, router, selected, updatePreferences]);

  return (
    <AuthScreenLayout
      title={t('auth.selectTopicsTitle')}
      subtitle={t('auth.selectTopicsSubtitle')}
      onPressBack={() => router.back()}
      headerAlign="center"
      bodyStyle={styles.body}
      contentContainerStyle={styles.content}>
      {error?.provider === 'credentials' ? (
        <View style={styles.screenErrorWrap}>
          <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error.message}</ThemedText>
        </View>
      ) : null}

      {topics.length > 0 ? (
        <View style={styles.chipsGrid}>
          {topics.map((topic) => {
            const isSelected = selected.includes(topic.id);
            return (
              <Pressable
                key={topic.id}
                onPress={() => toggleTopic(topic.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: isSelected ? theme.authTopicSelectedBorder : theme.authTopicBorder,
                    backgroundColor: isSelected ? theme.authTopicSelectedBackground : 'transparent',
                  },
                  pressed && styles.pressed,
                ]}>
                {topic.emoji ? <ThemedText style={styles.chipEmoji}>{topic.emoji}</ThemedText> : null}
                <ThemedText style={styles.chipLabel}>{topic.label}</ThemedText>
                {isSelected ? (
                  <View style={[styles.selectedDot, { backgroundColor: theme.secondary }]}>
                    <Check size={16} weight="bold" color={theme.onPrimary} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: theme.subtleText }]}>
            {topicsQuery.isLoading ? 'Chargement des topics...' : 'Aucun topic disponible.'}
          </ThemedText>
        </View>
      )}

      <View style={styles.bottomActions}>
        <AppButton
          label={t('common.continue')}
          disabled={!hasSelection || isSubmitting}
          onPress={() => {
            void handleContinue();
          }}
          style={[
            hasSelection ? styles.continueEnabled : styles.continueDisabled,
            styles.continueButton,
            { shadowColor: theme.shadow },
            hasSelection
              ? { backgroundColor: theme.secondary, borderColor: theme.secondary }
              : { backgroundColor: theme.disabledBackground, borderColor: theme.disabledBackground },
          ]}
          labelStyle={!hasSelection ? [styles.continueLabelDisabled, { color: theme.disabledText }] : undefined}
          rightAccessory={isSubmitting ? <ActivityIndicator size="small" color={theme.onPrimary} /> : undefined}
        />

        <Pressable onPress={() => router.replace('/(tabs)')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText style={[styles.skipText, { color: theme.subtleText }]}>{t('common.skipStep')}</ThemedText>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.three + 20,
  },
  body: {
    flex: 1,
    marginTop: 32,
  },
  screenErrorWrap: {
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    borderRadius: 38,
    borderWidth: 1.2,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  chipEmoji: {
    fontSize: 15,
    lineHeight: 24,
  },
  chipLabel: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: 500,
  },
  selectedDot: {
    width: 17,
    height: 17,
    borderRadius: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  emptyState: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    textAlign: 'center',
  },
  bottomActions: {
    marginTop: 'auto',
    gap: 22,
    paddingBottom: 20,
  },
  continueButton: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueEnabled: {},
  continueDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueLabelDisabled: {},
  skipText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  pressed: {
    opacity: 0.8,
  },
});
