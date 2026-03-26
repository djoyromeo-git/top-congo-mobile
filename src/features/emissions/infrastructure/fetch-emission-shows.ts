import { useQuery } from '@tanstack/react-query';

import { getTopCongoApiUrl } from '@/features/auth/config';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';

export type EmissionShowImageSource = string | number;

type ShowCategoryApiItem = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
};

type ShowHostUserApiItem = {
  id?: unknown;
  name?: unknown;
  avatar?: unknown;
  bio?: unknown;
};

type ShowHostApiItem = {
  user?: unknown;
  role?: unknown;
  is_primary?: unknown;
  sort_order?: unknown;
  pivot_bio?: unknown;
};

type ShowScheduleSlotApiItem = {
  id?: unknown;
  day_of_week?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  slot_type?: unknown;
  label?: unknown;
  is_active?: unknown;
  sort_order?: unknown;
  timezone?: unknown;
};

type ShowEpisodeAssetApiItem = {
  id?: unknown;
  type?: unknown;
  provider?: unknown;
  url?: unknown;
  is_downloadable?: unknown;
  language?: unknown;
  duration_seconds?: unknown;
  thumbnail?: unknown;
};

type ShowEpisodeApiItem = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  cover_image?: unknown;
  published_at?: unknown;
  is_premium?: unknown;
  status?: unknown;
  assets?: unknown;
  assets_count?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type ShowApiItem = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  cover_image?: unknown;
  status?: unknown;
  category?: unknown;
  hosts?: unknown;
  schedule_slots?: unknown;
  episodes?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type ShowsApiResponse = {
  data?: unknown;
};

export type EmissionShowCategory = {
  id: string;
  name: string;
  slug: string;
};

export type EmissionShowHost = {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  role: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type EmissionShowScheduleSlot = {
  id: string;
  dayOfWeek: string;
  startsAt: string;
  endsAt: string;
  slotType: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  timezone: string;
};

export type EmissionEpisodeAsset = {
  id: string;
  type: string;
  provider: string;
  url: string;
  isDownloadable: boolean;
  language: string;
  durationSeconds: number | null;
  thumbnail: string | null;
};

export type EmissionEpisode = {
  id: string;
  title: string;
  description: string;
  imageSource: EmissionShowImageSource;
  publishedAtIso: string | null;
  publishedAtLabel: string;
  isPremium: boolean;
  assets: EmissionEpisodeAsset[];
  audioAsset: EmissionEpisodeAsset | null;
  assetsCount: number;
};

export type EmissionShow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  host: string;
  hosts: EmissionShowHost[];
  category: EmissionShowCategory | null;
  imageSource: EmissionShowImageSource;
  scheduleSlots: EmissionShowScheduleSlot[];
  episodes: EmissionEpisode[];
  publishedAtIso: string | null;
  publishedAtLabel: string;
};

const fallbackEmissionImage = require('@/assets/images/home/emission.png');

const showsHttpClient = createHttpClient({
  baseUrl: getTopCongoApiUrl(),
});

function isShowApiItem(value: unknown): value is ShowApiItem {
  return typeof value === 'object' && value !== null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

function parseBooleanLike(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }

  return false;
}

function parseOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatDate(value: string | null) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

function parseTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatHostLabel(hosts: EmissionShowHost[]) {
  if (hosts.length === 0) {
    return 'Top Congo';
  }

  return hosts.map(item => item.name).join(', ');
}

function mapCategory(value: unknown): EmissionShowCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const name = normalizeText(value.name);
  const slug = normalizeText(value.slug);

  if ((typeof id !== 'string' && typeof id !== 'number') || !name || !slug) {
    return null;
  }

  return {
    id: String(id),
    name,
    slug,
  };
}

function mapHostUser(value: unknown): ShowHostUserApiItem | null {
  return isRecord(value) ? (value as ShowHostUserApiItem) : null;
}

function compareHosts(left: EmissionShowHost, right: EmissionShowHost) {
  if (left.isPrimary !== right.isPrimary) {
    return left.isPrimary ? -1 : 1;
  }

  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.name.localeCompare(right.name);
}

function mapHosts(value: unknown): EmissionShowHost[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => {
      const user = mapHostUser(item.user);
      const userId = user?.id;
      const userName = normalizeText(user?.name);

      if ((typeof userId !== 'string' && typeof userId !== 'number') || !userName) {
        return null;
      }

      const bio = normalizeOptionalText(item.pivot_bio) ?? normalizeOptionalText(user?.bio) ?? '';
      const sortOrder = parseOptionalNumber(item.sort_order) ?? 0;

      return {
        id: String(userId),
        name: userName,
        avatar: normalizeOptionalText(user?.avatar),
        bio,
        role: normalizeOptionalText(item.role) ?? 'host',
        isPrimary: parseBooleanLike(item.is_primary),
        sortOrder,
      } satisfies EmissionShowHost;
    })
    .filter((item): item is EmissionShowHost => item !== null)
    .sort(compareHosts);
}

function compareScheduleSlots(left: EmissionShowScheduleSlot, right: EmissionShowScheduleSlot) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  if (left.dayOfWeek !== right.dayOfWeek) {
    return left.dayOfWeek.localeCompare(right.dayOfWeek);
  }

  return left.startsAt.localeCompare(right.startsAt);
}

function mapScheduleSlots(value: unknown): EmissionShowScheduleSlot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => {
      const id = item.id;
      const dayOfWeek = normalizeText(item.day_of_week);
      const startsAt = normalizeText(item.starts_at);
      const endsAt = normalizeText(item.ends_at);

      if ((typeof id !== 'string' && typeof id !== 'number') || !dayOfWeek || !startsAt || !endsAt) {
        return null;
      }

      return {
        id: String(id),
        dayOfWeek,
        startsAt,
        endsAt,
        slotType: normalizeOptionalText(item.slot_type) ?? 'live',
        label: normalizeOptionalText(item.label) ?? '',
        isActive: parseBooleanLike(item.is_active),
        sortOrder: parseOptionalNumber(item.sort_order) ?? 0,
        timezone: normalizeOptionalText(item.timezone) ?? '',
      } satisfies EmissionShowScheduleSlot;
    })
    .filter((item): item is EmissionShowScheduleSlot => item !== null)
    .sort(compareScheduleSlots);
}

function mapEpisodeAssets(value: unknown): EmissionEpisodeAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => {
      const id = item.id;
      const type = normalizeText(item.type);
      const url = normalizeText(item.url);

      if ((typeof id !== 'string' && typeof id !== 'number') || !type || !url) {
        return null;
      }

      return {
        id: String(id),
        type,
        provider: normalizeOptionalText(item.provider) ?? '',
        url,
        isDownloadable: parseBooleanLike(item.is_downloadable),
        language: normalizeOptionalText(item.language) ?? '',
        durationSeconds: parseOptionalNumber(item.duration_seconds),
        thumbnail: normalizeOptionalText(item.thumbnail),
      } satisfies EmissionEpisodeAsset;
    })
    .filter((item): item is EmissionEpisodeAsset => item !== null);
}

function compareEpisodesByDate(left: EmissionEpisode, right: EmissionEpisode) {
  return parseTimestamp(right.publishedAtIso) - parseTimestamp(left.publishedAtIso);
}

function mapEpisodes(value: unknown): EmissionEpisode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => {
      const id = item.id;
      const title = normalizeText(item.title);
      const status = normalizeOptionalText(item.status)?.toLowerCase() ?? '';

      if ((typeof id !== 'string' && typeof id !== 'number') || !title || status !== 'published') {
        return null;
      }

      const publishedAtIso =
        normalizeOptionalText(item.published_at) ??
        normalizeOptionalText(item.updated_at) ??
        normalizeOptionalText(item.created_at);
      const assets = mapEpisodeAssets(item.assets);
      const audioAsset = assets.find(asset => asset.type.toLowerCase() === 'audio') ?? null;
      const imageSource =
        normalizeOptionalText(item.cover_image) ??
        audioAsset?.thumbnail ??
        fallbackEmissionImage;

      return {
        id: String(id),
        title,
        description: normalizeOptionalText(item.description) ?? '',
        imageSource,
        publishedAtIso,
        publishedAtLabel: formatDate(publishedAtIso),
        isPremium: parseBooleanLike(item.is_premium),
        assets,
        audioAsset,
        assetsCount: parseOptionalNumber(item.assets_count) ?? assets.length,
      } satisfies EmissionEpisode;
    })
    .filter((item): item is EmissionEpisode => item !== null)
    .sort(compareEpisodesByDate);
}

function mapShowItem(item: ShowApiItem): EmissionShow | null {
  if ((typeof item.id !== 'string' && typeof item.id !== 'number') || typeof item.slug !== 'string') {
    return null;
  }

  if (item.slug.trim().length === 0) {
    return null;
  }

  if (typeof item.title !== 'string' || item.title.trim().length === 0) {
    return null;
  }

  const status = typeof item.status === 'string' ? item.status.trim().toLowerCase() : '';
  if (status !== 'published') {
    return null;
  }

  const publishedAtIso =
    typeof item.updated_at === 'string'
      ? item.updated_at
      : typeof item.created_at === 'string'
        ? item.created_at
        : null;
  const hosts = mapHosts(item.hosts);
  const scheduleSlots = mapScheduleSlots(item.schedule_slots).filter(slot => slot.isActive);
  const episodes = mapEpisodes(item.episodes);

  return {
    id: String(item.id),
    slug: item.slug.trim(),
    title: item.title.trim(),
    description: typeof item.description === 'string' ? item.description.trim() : '',
    host: formatHostLabel(hosts),
    hosts,
    category: mapCategory(item.category),
    imageSource:
      typeof item.cover_image === 'string' && item.cover_image.trim().length > 0
        ? item.cover_image.trim()
        : fallbackEmissionImage,
    scheduleSlots,
    episodes,
    publishedAtIso,
    publishedAtLabel: formatDate(publishedAtIso),
  };
}

function compareShowsByDate(left: EmissionShow, right: EmissionShow) {
  return parseTimestamp(right.publishedAtIso) - parseTimestamp(left.publishedAtIso);
}

export async function fetchEmissionShows() {
  const response = await showsHttpClient.get<ShowsApiResponse>('/shows');
  const items = Array.isArray(response?.data) ? response.data : [];

  return items
    .filter(isShowApiItem)
    .map(mapShowItem)
    .filter((item): item is EmissionShow => item !== null)
    .sort(compareShowsByDate);
}

export function findEmissionShow(shows: EmissionShow[], slug: string | undefined) {
  return shows.find((item) => item.slug === slug);
}

export function findEmissionEpisode(emission: EmissionShow | undefined, episodeId: string | undefined) {
  if (!emission || !episodeId) {
    return undefined;
  }

  return emission.episodes.find(item => item.id === episodeId);
}

export function useEmissionShows() {
  return useQuery({
    queryKey: ['emissions', 'shows'],
    queryFn: fetchEmissionShows,
    staleTime: 1000 * 60 * 5,
    retry(failureCount, error) {
      if (error instanceof ApiError && error.code === 'configuration') {
        return false;
      }

      return failureCount < 2;
    },
  });
}
