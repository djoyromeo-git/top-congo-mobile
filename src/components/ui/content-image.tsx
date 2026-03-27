import { Image, type ImageContentFit } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ContentImageSource = string | number | null | undefined;

type ContentImageProps = {
  source: ContentImageSource;
  fallbackSource?: string | number;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  transition?: number;
};

const DEFAULT_FALLBACK_SOURCE = require('@/assets/images/home/emission.png');

export function ContentImage({
  source,
  fallbackSource = DEFAULT_FALLBACK_SOURCE,
  style,
  contentFit = 'cover',
  transition = 140,
}: ContentImageProps) {
  const theme = useTheme();
  const [resolvedSource, setResolvedSource] = React.useState<string | number>(source ?? fallbackSource);
  const [isLoading, setIsLoading] = React.useState(typeof (source ?? fallbackSource) === 'string');
  const [didFallback, setDidFallback] = React.useState(false);
  const [didRetryWithoutCache, setDidRetryWithoutCache] = React.useState(false);
  const [imageRequestKey, setImageRequestKey] = React.useState(0);

  React.useEffect(() => {
    const nextSource = source ?? fallbackSource;
    setResolvedSource(nextSource);
    setDidFallback(false);
    setDidRetryWithoutCache(false);
    setIsLoading(typeof nextSource === 'string');
    setImageRequestKey((current) => current + 1);
  }, [fallbackSource, source]);

  const handleLoadEnd = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = React.useCallback(() => {
    if (didFallback || resolvedSource === fallbackSource) {
      setIsLoading(false);
      return;
    }

    if (typeof resolvedSource === 'string' && resolvedSource === source && !didRetryWithoutCache) {
      setDidRetryWithoutCache(true);
      setIsLoading(true);
      setImageRequestKey((current) => current + 1);
      return;
    }

    setDidFallback(true);
    setResolvedSource(fallbackSource);
    setIsLoading(typeof fallbackSource === 'string');
    setImageRequestKey((current) => current + 1);
  }, [didFallback, didRetryWithoutCache, fallbackSource, resolvedSource, source]);

  const imageSource =
    typeof resolvedSource === 'string'
      ? {
          uri: resolvedSource,
        }
      : resolvedSource;

  return (
    <View style={[styles.container, { backgroundColor: theme.homeChipBorder }, style]}>
      {isLoading ? <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.homeChipBackground }]} /> : null}
      <Image
        key={imageRequestKey}
        source={imageSource}
        style={StyleSheet.absoluteFillObject}
        contentFit={contentFit}
        cachePolicy={didRetryWithoutCache ? 'none' : 'memory-disk'}
        transition={transition}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
