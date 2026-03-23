import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MagnifyingGlass } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ActualiteListItem } from '@/components/ui/actualite-list-item';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { ACTUALITES_ITEMS, findActualite, getRelatedActualites } from '@/constants/actualites';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';

export default function ActualiteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering } = useLiveAudioStatus();
  const item = React.useMemo(() => findActualite(slug), [slug]);
  const relatedItems = React.useMemo(() => (item ? getRelatedActualites(item.relatedSlugs) : []), [item]);
  const [savedMap, setSavedMap] = React.useState<Record<string, boolean>>(() =>
    ACTUALITES_ITEMS.reduce<Record<string, boolean>>((acc, entry) => {
      acc[entry.slug] = entry.saved;
      return acc;
    }, {})
  );

  React.useEffect(() => {
    if (!item) {
      router.replace('/actualites' as never);
    }
  }, [item, router]);

  const toggleSaved = React.useCallback((entrySlug: string) => {
    setSavedMap((current) => ({ ...current, [entrySlug]: !current[entrySlug] }));
  }, []);

  const openItem = React.useCallback(
    (entrySlug: string) => {
      const entry = ACTUALITES_ITEMS.find((candidate) => candidate.slug === entrySlug);
      if (!entry) return;

      router.replace(
        (entry.kind === 'media' ? `/actualites/media/${entrySlug}` : `/actualites/${entrySlug}`) as never
      );
    },
    [router]
  );

  if (!item) {
    return null;
  }

  const liveCardBottom = insets.bottom + 10;

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.back(),
        }}
        rightAction={{
          icon: <MagnifyingGlass size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => router.push('/actualites' as never),
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Actualités</ThemedText>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={item.imageSource} style={styles.heroImage} contentFit="cover" transition={0} />

        <View style={styles.body}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={[styles.meta, { color: theme.homeSubtitle }]}>
            {`${item.sectionLabel.toUpperCase()} • ${item.date.toUpperCase()}`}
          </ThemedText>

          <View style={styles.authorCard}>
            <Image source={item.imageSource} style={styles.authorAvatar} contentFit="cover" transition={0} />
            <View style={styles.authorTextWrap}>
              <ThemedText style={styles.authorName}>{item.authorName.toUpperCase()}</ThemedText>
              <ThemedText style={styles.authorRole}>{item.authorRole}</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.leadTitle}>{item.leadTitle}</ThemedText>
          <ThemedText style={[styles.paragraph, { color: theme.homeSubtitle }]}>{item.summary}</ThemedText>

          {item.paragraphs.map((paragraph) => (
            <ThemedText key={paragraph} style={[styles.paragraph, { color: theme.homeSubtitle }]}>
              {paragraph}
            </ThemedText>
          ))}

          <PromoBanner />

          {item.quote ? <QuoteBlock quote={item.quote} /> : null}
        </View>

        <View style={styles.relatedSection}>
          <ThemedText style={styles.relatedTitle}>À découvrir aussi</ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.homeChipBorder }]} />

          {relatedItems.map((related, index) => (
            <ActualiteListItem
              key={related.slug}
              title={related.title}
              imageSource={related.imageSource}
              date={related.date}
              saved={savedMap[related.slug]}
              duration={related.duration}
              showPlayBadge={related.kind === 'media'}
              showVerifiedBadge={related.verified}
              showDivider={index < relatedItems.length - 1}
              onPress={() => openItem(related.slug)}
              onPressSave={() => toggleSaved(related.slug)}
            />
          ))}
        </View>

        <View style={{ height: liveCardBottom + 88 }} />
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={"Suivez l'info en direct\nsur Top Congo"}
          subtitle={program.schedule || undefined}
          onPressCard={() => router.push('/direct')}
          onPressPlay={() => router.push('/direct')}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          disabled={false}
        />
      </View>
    </View>
  );
}

function PromoBanner() {
  return (
    <View style={styles.promoBanner}>
      <View style={styles.promoContent}>
        <ThemedText style={styles.promoEyebrow}>Connexion premium</ThemedText>
        <ThemedText style={styles.promoTitle}>Profitez d&apos;un debit stable avec le kit Starlink.</ThemedText>
        <Pressable style={({ pressed }) => [styles.promoButton, pressed && styles.pressed]}>
          <ThemedText style={styles.promoButtonText}>Voir l&apos;offre</ThemedText>
        </Pressable>
      </View>
      <View style={styles.promoArt}>
        <View style={styles.promoDish} />
      </View>
    </View>
  );
}

function QuoteBlock({ quote }: { quote: string }) {
  return (
    <View style={styles.quoteBlock}>
      <ThemedText style={styles.quoteText}>{`«${quote}»`}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerTitle: {
    color: Palette.neutral['100'],
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  content: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 244,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: 18,
    gap: 16,
  },
  title: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 700,
    color: Palette.neutral['800'],
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: 500,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E7F0FF',
    borderRadius: 8,
    padding: 10,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  authorTextWrap: {
    flex: 1,
  },
  authorName: {
    color: Palette.blue['800'],
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
  },
  authorRole: {
    color: Palette.neutral['800'],
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  leadTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: 700,
    color: Palette.neutral['800'],
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
  },
  promoBanner: {
    minHeight: 94,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#121B24',
  },
  promoContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    gap: 8,
  },
  promoEyebrow: {
    color: '#94AFC4',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 500,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 700,
  },
  promoButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#39C56A',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  promoButtonText: {
    color: '#08130C',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 700,
  },
  promoArt: {
    width: 112,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B2630',
  },
  promoDish: {
    width: 82,
    height: 82,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#DCE7F0',
    transform: [{ rotate: '-18deg' }],
  },
  quoteBlock: {
    paddingTop: 4,
  },
  quoteText: {
    color: Palette.neutral['800'],
    fontSize: 15,
    lineHeight: 26,
    fontWeight: 700,
  },
  relatedSection: {
    paddingHorizontal: Spacing.three,
    paddingTop: 22,
  },
  relatedTitle: {
    color: Palette.neutral['800'],
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  divider: {
    height: 1,
    marginTop: 14,
    marginBottom: 2,
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.82,
  },
});
