import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { FormInput } from '@/components/ui/form-input';
import { useCredentialsAuth } from '@/features/auth/presentation/use-auth-session';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const LOGO_SOURCE = require('@/assets/expo.icon/Assets/logo.png');
const WAVEFORM_SOURCE = require('@/assets/images/waveform-top-congo.png');

export default function UsernameSetupScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ registrationId?: string | string[] }>();
  const { clearError, completeRegistration, error, isSubmitting } = useCredentialsAuth();
  const [username, setUsername] = React.useState('');
  const registrationId = getSingleParamValue(params.registrationId);

  const isContinueEnabled = username.trim().length > 0;
  const handleContinue = React.useCallback(async () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return;
    }

    if (registrationId) {
      const isCompleted = await completeRegistration({
        registrationId,
        name: normalizedUsername,
      });

      if (!isCompleted) {
        return;
      }
    }

    router.push('/auth/topics');
  }, [completeRegistration, registrationId, router, username]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.background}
        translucent={false}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}>
        <Image
          source={LOGO_SOURCE}
          style={styles.logo}
          cachePolicy="memory-disk"
          contentFit="contain"
          transition={0}
        />

        <View style={styles.waveWrap}>
          <Image
            source={WAVEFORM_SOURCE}
            style={styles.waveImage}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
          />
        </View>

        <View style={styles.textBlock}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>{t('auth.usernameTitle')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('auth.usernameSubtitle')}</ThemedText>
        </View>

        {error?.provider === 'credentials' ? (
          <View style={styles.screenErrorWrap}>
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error.message}</ThemedText>
          </View>
        ) : null}

        <View style={styles.formBlock}>
          <FormInput
            value={username}
            onChangeText={(value) => {
              clearError();
              setUsername(value);
            }}
            placeholder={t('auth.usernamePlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppButton
            label={t('common.continue')}
            disabled={!isContinueEnabled || isSubmitting}
            onPress={() => {
              void handleContinue();
            }}
            rightAccessory={isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
            style={[
              styles.continueButton,
              isContinueEnabled ? styles.continueButtonEnabled : styles.continueButtonDisabled,
              isContinueEnabled
                ? { backgroundColor: theme.secondary, borderColor: theme.secondary }
                : { backgroundColor: theme.disabledBackground, borderColor: theme.disabledBackground },
            ]}
            labelStyle={
              !isContinueEnabled
                ? [styles.continueButtonLabelDisabled, { color: theme.disabledText }]
                : undefined
            }
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  logo: {
    width: 102,
    height: 50,
    alignSelf: 'center',
    marginTop: 52,
  },
  waveWrap: {
    marginTop: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveImage: {
    width: '150%',
    height: 200,
  },
  textBlock: {
    gap: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 27,
    fontWeight: 700,
    maxWidth: 218,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    maxWidth: 345,
  },
  formBlock: {
    marginTop: 52,
    gap: 8,
  },
  screenErrorWrap: {
    marginTop: 20,
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
  continueButton: {
    marginTop: 2,
  },
  continueButtonEnabled: {},
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonLabelDisabled: {},
});

function getSingleParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}
