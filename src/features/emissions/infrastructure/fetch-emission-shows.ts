import { useQuery } from '@tanstack/react-query';

import { getTopCongoApiUrl } from '@/features/auth/config';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';

export type EmissionShowImageSource = string | number;

type ShowApiItem = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  cover_image?: unknown;
  host?: unknown;
  status?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type ShowsApiResponse = {
  data?: unknown;
};

export type EmissionShow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  host: string;
  imageSource: EmissionShowImageSource;
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

  return {
    id: String(item.id),
    slug: item.slug.trim(),
    title: item.title.trim(),
    description: typeof item.description === 'string' ? item.description.trim() : '',
    host: typeof item.host === 'string' && item.host.trim().length > 0 ? item.host.trim() : 'Top Congo',
    imageSource:
      typeof item.cover_image === 'string' && item.cover_image.trim().length > 0
        ? item.cover_image.trim()
        : fallbackEmissionImage,
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
