import type { EmissionEpisode, EmissionEpisodeAsset, EmissionShow, EmissionShowHost } from '@/features/emissions/infrastructure/fetch-emission-shows';

export type PodcastTopicKey = 'all' | 'politique' | 'economie' | 'securite' | 'societe';

export type PodcastLibraryItem = {
  key: string;
  showSlug: string;
  episodeId: string;
  title: string;
  showTitle: string;
  showDescription: string;
  description: string;
  dateLabel: string;
  durationLabel: string;
  progressLabel: string;
  imageSource: string | number;
  hostName: string;
  hostAvatar: string | number | null;
  hostRole: string;
  topic: Exclude<PodcastTopicKey, 'all'>;
  hasVideo: boolean;
  audioUrl: string | null;
  videoUrl: string | null;
  publishedAtIso: string | null;
};

function normalizeForMatch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatDuration(totalSeconds: number | null) {
  if (!totalSeconds || totalSeconds <= 0) {
    return '04:39:20';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatProgressLabel(durationLabel: string) {
  if (durationLabel === '04:39:20') {
    return '39:20 / 1:12:45';
  }

  const parts = durationLabel.split(':');
  if (parts.length === 3) {
    return `${parts[1]}:${parts[2]} / ${durationLabel}`;
  }

  return `00:00 / ${durationLabel}`;
}

function getTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pickPrimaryHost(show: EmissionShow): EmissionShowHost | null {
  if (show.hosts.length > 0) {
    return show.hosts[0] ?? null;
  }

  return null;
}

function pickAsset(assets: EmissionEpisodeAsset[], type: 'audio' | 'video') {
  return assets.find((asset) => asset.type.toLowerCase() === type) ?? null;
}

function pickTopic(show: EmissionShow, episode: EmissionEpisode): Exclude<PodcastTopicKey, 'all'> {
  const haystack = normalizeForMatch(
    [show.title, show.description, show.category?.name, show.category?.slug, episode.title, episode.description]
      .filter(Boolean)
      .join(' ')
  );

  if (
    haystack.includes('economie') ||
    haystack.includes('business') ||
    haystack.includes('finance') ||
    haystack.includes('budget') ||
    haystack.includes('marche')
  ) {
    return 'economie';
  }

  if (
    haystack.includes('securite') ||
    haystack.includes('defense') ||
    haystack.includes('paix') ||
    haystack.includes('armee') ||
    haystack.includes('violence')
  ) {
    return 'securite';
  }

  if (
    haystack.includes('societe') ||
    haystack.includes('culture') ||
    haystack.includes('education') ||
    haystack.includes('sante') ||
    haystack.includes('sport')
  ) {
    return 'societe';
  }

  return 'politique';
}

function compareByDate(left: PodcastLibraryItem, right: PodcastLibraryItem) {
  return getTimestamp(right.publishedAtIso) - getTimestamp(left.publishedAtIso);
}

function compareBySpotlight(left: PodcastLibraryItem, right: PodcastLibraryItem) {
  if (left.hasVideo !== right.hasVideo) {
    return left.hasVideo ? -1 : 1;
  }

  if (left.durationLabel !== right.durationLabel) {
    return right.durationLabel.localeCompare(left.durationLabel);
  }

  return compareByDate(left, right);
}

export function selectPodcastLibrary(shows: EmissionShow[]) {
  const items = shows
    .flatMap((show) => {
      const primaryHost = pickPrimaryHost(show);

      return show.episodes.map((episode) => {
        const audioAsset = episode.audioAsset;
        const videoAsset = pickAsset(episode.assets, 'video');
        const durationLabel = formatDuration(videoAsset?.durationSeconds ?? audioAsset?.durationSeconds ?? null);

        return {
          key: `${show.slug}:${episode.id}`,
          showSlug: show.slug,
          episodeId: episode.id,
          title: episode.title,
          showTitle: show.title,
          showDescription: show.description,
          description: episode.description || show.description,
          dateLabel: episode.publishedAtLabel || show.publishedAtLabel,
          durationLabel,
          progressLabel: formatProgressLabel(durationLabel),
          imageSource: episode.imageSource ?? show.imageSource,
          hostName: primaryHost?.name ?? show.host,
          hostAvatar: primaryHost?.avatar ?? null,
          hostRole: 'Animateur',
          topic: pickTopic(show, episode),
          hasVideo: videoAsset !== null,
          audioUrl: audioAsset?.url ?? null,
          videoUrl: videoAsset?.url ?? null,
          publishedAtIso: episode.publishedAtIso ?? show.publishedAtIso,
        } satisfies PodcastLibraryItem;
      });
    })
    .sort(compareByDate);

  return items;
}

export function findPodcastItem(items: PodcastLibraryItem[], showSlug: string | undefined, episodeId: string | undefined) {
  return items.find((item) => item.showSlug === showSlug && item.episodeId === episodeId);
}

export function selectPodcastItemsByTopic(items: PodcastLibraryItem[], topic: PodcastTopicKey) {
  if (topic === 'all') {
    return items;
  }

  return items.filter((item) => item.topic === topic);
}

export function selectPodcastSpotlight(items: PodcastLibraryItem[]) {
  return [...items].sort(compareBySpotlight).slice(0, 6);
}

export function selectPodcastLatest(items: PodcastLibraryItem[]) {
  return items.slice(0, 6);
}

export function selectPodcastSpecialEdition(items: PodcastLibraryItem[]) {
  const selected = items.filter((item) => {
    const haystack = normalizeForMatch(`${item.showTitle} ${item.title}`);
    return haystack.includes('edition speciale') || haystack.includes('speciale');
  });

  return (selected.length > 0 ? selected : items).slice(0, 6);
}

export function selectPodcastDebateMagazine(items: PodcastLibraryItem[]) {
  const selected = items.filter((item) => {
    const haystack = normalizeForMatch(`${item.showTitle} ${item.title}`);
    return haystack.includes('debat') || haystack.includes('magazine');
  });

  return (selected.length > 0 ? selected : items).slice(0, 6);
}

export function selectRelatedPodcastItems(items: PodcastLibraryItem[], currentKey: string) {
  return items.filter((item) => item.key !== currentKey).slice(0, 3);
}
