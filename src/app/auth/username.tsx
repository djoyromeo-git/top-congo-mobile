import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function UsernameSetupScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [username, setUsername] = React.useState('');

  const isContinueEnabled = username.trim().length > 0;

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
          source={require('@/assets/expo.icon/Assets/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <View style={styles.waveWrap}>
          <Image
            source={require('@/assets/images/waveform-top-congo.png')}
            style={styles.waveImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.textBlock}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>{t('auth.usernameTitle')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('auth.usernameSubtitle')}</ThemedText>
        </View>

        <View style={styles.formBlock}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder={t('auth.usernamePlaceholder')}
            placeholderTextColor={theme.inputPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              {
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
          />

          <AppButton
            label={t('common.continue')}
            disabled={!isContinueEnabled}
            onPress={() => router.push('/auth/topics')}
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
  input: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 400,
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
