import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppTopBar } from '@/components/ui/app-top-bar';
import { ContentImage } from '@/components/ui/content-image';
import { LiveAudioCard } from '@/components/ui/live-audio-card';
import { TopicChip } from '@/components/ui/topic-chip';
import { Palette, Spacing } from '@/constants/theme';
import { useEmissionShows } from '@/features/emissions/infrastructure/fetch-emission-shows';
import {
  buildScheduleDayOptions,
  chunkSchedulePrograms,
  compareSchedulePrograms,
  getScheduleRoute,
  getSlotStartLabel,
  getSlotTimeLabel,
  isScheduleSlotLive,
  selectInitialScheduleDay,
  selectProgramsForDay,
  selectSchedulePrograms,
  type ScheduleProgram,
} from '@/features/schedule-slots/application/select-schedule-programs';
import { useScheduleSlots } from '@/features/schedule-slots/infrastructure/fetch-schedule-slots';
import { useTheme } from '@/hooks/use-theme';
import { useLiveAudioStatus, useLiveProgramInfo } from '@/services/live-audio';
import { useTranslation } from 'react-i18next';

export default function ScheduleSlotsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const program = useLiveProgramInfo();
  const { isPlaying, isBuffering, isStarting } = useLiveAudioStatus();
  const scheduleQuery = useScheduleSlots();
  const showsQuery = useEmissionShows();
  const dayOptions = React.useMemo(() => buildScheduleDayOptions(t), [t]);
  const [selectedDay, setSelectedDay] = React.useState<string>(() => selectInitialScheduleDay());

  const programs = React.useMemo(
    () => selectSchedulePrograms(scheduleQuery.data ?? [], showsQuery.data ?? []).sort(compareSchedulePrograms),
    [scheduleQuery.data, showsQuery.data]
  );
  const dayPrograms = React.useMemo(
    () => selectProgramsForDay(programs, selectedDay),
    [programs, selectedDay]
  );
  const sections = React.useMemo(() => chunkSchedulePrograms(dayPrograms, 4), [dayPrograms]);
  const liveCardBottom = insets.bottom + 10;

  const handleRefresh = React.useCallback(() => {
    void Promise.all([scheduleQuery.refetch(), showsQuery.refetch()]);
  }, [scheduleQuery, showsQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceMuted }]}>
      <AppTopBar
        leftAction={{
          icon: <ArrowLeft size={22} weight="bold" color={theme.onPrimary} />,
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/(tabs)' as never);
          },
        }}
        centerContent={<ThemedText style={styles.headerTitle}>Grille des programmes</ThemedText>}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: liveCardBottom + 92 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={scheduleQuery.isRefetching || showsQuery.isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }>
        <View>
          <ThemedText style={styles.pageTitle}>A l&apos;antenne</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: theme.homeSubtitle }]}>
            Suivez toute la journee de TopCongo
          </ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {dayOptions.map((option) => (
            <TopicChip
              key={option.key}
              label={option.label}
              selected={selectedDay === option.dayOfWeek}
              onPress={() => setSelectedDay(option.dayOfWeek)}
            />
          ))}
        </ScrollView>

        {scheduleQuery.isLoading ? <ScreenMessage message="Chargement de la grille..." /> : null}
        {scheduleQuery.isError ? <ScreenMessage message="Impossible de charger la grille des programmes." /> : null}
        {!scheduleQuery.isLoading && !scheduleQuery.isError && dayPrograms.length === 0 ? (
          <ScreenMessage message="Aucun programme publie pour ce jour." />
        ) : null}

        {!scheduleQuery.isLoading && !scheduleQuery.isError
          ? sections.map((section, index) => (
              <View key={`section-${section[0]?.slot.id ?? index}`} style={styles.sectionBlock}>
                {section[0] ? (
                  <ScheduleHeroCard
                    program={section[0]}
                    onPress={() => router.push(getScheduleRoute(section[0].slot.id) as never)}
                  />
                ) : null}

                {section.length > 1 ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <ThemedText style={styles.sectionTitle}>La suite du programme</ThemedText>
                      <View style={[styles.sectionDivider, { backgroundColor: theme.homeChipBorder }]} />
                    </View>

                    <View>
                      {section.slice(1).map((programItem, itemIndex) => (
                        <ScheduleListItem
                          key={programItem.slot.id}
                          program={programItem}
                          showDivider={itemIndex < section.slice(1).length - 1}
                          onPress={() => router.push(getScheduleRoute(programItem.slot.id) as never)}
                        />
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            ))
          : null}
      </ScrollView>

      <View style={[styles.liveCardFixed, { bottom: liveCardBottom }]}>
        <LiveAudioCard
          loading={false}
          title={"Suivez l'info en direct\nsur Top Congo"}
          subtitle={program.schedule || undefined}
          onPressCard={() => router.push('/direct' as never)}
          onPressPlay={() => router.push('/direct' as never)}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isStarting={isStarting}
          disabled={false}
        />
      </View>
    </View>
  );
}

function ScheduleHeroCard({ program, onPress }: { program: ScheduleProgram; onPress: () => void }) {
  const theme = useTheme();
  const isLive = isScheduleSlotLive(program.slot);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}>
      <ContentImage source={program.imageSource} style={styles.heroImage} />
      <View style={styles.heroOverlay} />

      <View style={styles.heroTopRow}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>Emission</ThemedText>
          </View>
          <ThemedText style={styles.heroTime}>{getSlotStartLabel(program.slot)}</ThemedText>
        </View>

        <View style={[styles.heroAction, { borderColor: theme.topBarActionBorder }]}>
          <ArrowRight size={22} weight="bold" color={Palette.neutral['100']} />
        </View>
      </View>

      <View style={styles.heroBottom}>
        <View style={styles.heroText}>
          <ThemedText style={styles.heroTitle}>{program.slot.label.toUpperCase()}</ThemedText>
          <ThemedText numberOfLines={1} style={styles.heroSubtitle}>
            {`Avec ${program.host}`}
          </ThemedText>
        </View>

        {isLive ? (
          <View style={styles.nowBadge}>
            <ThemedText style={styles.nowBadgeText}>Maintenant</ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function ScheduleListItem({
  program,
  showDivider,
  onPress,
}: {
  program: ScheduleProgram;
  showDivider: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.listItem,
        showDivider && { borderBottomWidth: 1, borderBottomColor: theme.homeChipBorder },
        pressed && styles.pressed,
      ]}>
      <ContentImage source={program.imageSource} style={styles.listImage} />
      <View style={styles.listText}>
        <ThemedText style={[styles.listTime, { color: theme.headlineDate }]}>{getSlotTimeLabel(program.slot)}</ThemedText>
        <ThemedText numberOfLines={1} style={styles.listTitle}>
          {program.slot.label}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.listSubtitle}>
          {`Avec ${program.host}`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function ScreenMessage({ message }: { message: string }) {
  return (
    <View style={styles.messageWrap}>
      <ThemedText style={styles.messageText}>{message}</ThemedText>
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
    lineHeight: 22,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 14,
  },
  pageTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  filters: {
    gap: 8,
    paddingVertical: 2,
  },
  sectionBlock: {
    gap: 12,
  },
  heroCard: {
    height: 198,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: Palette.blue['800'],
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,27,85,0.28)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: Palette.red['800'],
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: Palette.neutral['100'],
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  heroTime: {
    color: Palette.neutral['100'],
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  heroAction: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25,44,100,0.26)',
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: Palette.neutral['100'],
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  nowBadge: {
    borderRadius: 999,
    backgroundColor: Palette.red['800'],
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nowBadgeText: {
    color: Palette.neutral['100'],
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  sectionDivider: {
    height: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  listImage: {
    width: 124,
    height: 70,
    borderRadius: 6,
  },
  listText: {
    flex: 1,
  },
  listTime: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  listTitle: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: Palette.neutral['800'],
  },
  listSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Palette.neutral['700'],
  },
  messageWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  messageText: {
    color: Palette.neutral['500'],
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  liveCardFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pressed: {
    opacity: 0.84,
  },
});
