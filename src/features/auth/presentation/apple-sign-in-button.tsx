import * as AppleAuthentication from 'expo-apple-authentication';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type AppleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  buttonType?: AppleAuthentication.AppleAuthenticationButtonType;
};

export function AppleSignInButton({
  onPress,
  loading = false,
  buttonType = AppleAuthentication.AppleAuthenticationButtonType.CONTINUE,
}: AppleSignInButtonProps) {
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={buttonType}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={styles.button}
        onPress={onPress}
      />
      {loading ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 46,
    position: 'relative',
  },
  button: {
    width: '100%',
    height: 46,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
});
