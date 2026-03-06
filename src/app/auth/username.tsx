import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function UsernameSetupScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [username, setUsername] = React.useState('');

  const isContinueEnabled = username.trim().length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            placeholderTextColor="#CFCFCF"
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
            onPress={() => router.replace('/(tabs)/index')}
            style={[
              styles.continueButton,
              isContinueEnabled ? styles.continueButtonEnabled : styles.continueButtonDisabled,
            ]}
            labelStyle={!isContinueEnabled ? styles.continueButtonLabelDisabled : undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.neutral['100'],
  },
  content: {
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
    gap: 22,
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
  continueButtonEnabled: {
    backgroundColor: Palette.blue['800'],
    borderColor: Palette.blue['800'],
  },
  continueButtonDisabled: {
    backgroundColor: '#E6E6E6',
    borderColor: '#E6E6E6',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonLabelDisabled: {
    color: '#A2A2A2',
  },
});
