import { useQuery } from '@tanstack/react-query';

import { type TopicKey, TOPIC_ITEMS } from '@/constants/topics';
import { getTopCongoApiUrl } from '@/features/auth/config';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';

export type PostKind = 'article' | 'media';
export type PostImageSource = string | number;

type PostApiItem = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  type?: unknown;
  content?: unknown;
  image?: unknown;
  status?: unknown;
  published_at?: unknown;
  reading_time?: unknown;
  source?: unknown;
  is_featured?: unknown;
  created_at?: unknown;
};

type PostsApiResponse = {
  data?: unknown;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  kind: PostKind;
  imageSource: PostImageSource;
  publishedAtLabel: string;
  publishedAtIso: string | null;
  readingTimeMinutes: number | null;
  readingTimeLabel: string | null;
  source: string;
  sectionLabel: string;
  summary: string;
  contentBlocks: string[];
  isFeatured: boolean;
  topicKey: TopicKey | null;
  searchText: string;
};

const fallbackPostImage = require('@/assets/images/home/emission.png');

const postsHttpClient = createHttpClient({
  baseUrl: getTopCongoApiUrl(),
});

const htmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&apos;': "'",
  '&#39;': "'",
  '&gt;': '>',
  '&laquo;': '<<',
  '&lt;': '<',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&raquo;': '>>',
};

function isPostApiItem(value: unknown): value is PostApiItem {
  return typeof value === 'object' && value !== null;
}

function decodeHtmlEntities(value: string) {
  const withNamedEntities = value.replace(
    /&(amp|apos|gt|laquo|lt|nbsp|quot|raquo|#39);/g,
    (entity) => htmlEntityMap[entity] ?? entity
  );

  return withNamedEntities
    .replace(/&#(\d+);/g, (_, codePoint: string) => String.fromCodePoint(Number(codePoint)))
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint: string) => String.fromCodePoint(parseInt(codePoint, 16)));
}

function stripHtmlToBlocks(html: string) {
  const normalized = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/(p|div|section|article|h[1-6]|ul|ol)\s*>/gi, '\n\n')
    .replace(/<\s*li\s*>/gi, '\n- ')
    .replace(/<\s*\/li\s*>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  return decodeHtmlEntities(normalized)
    .split(/\n+/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter((block) => block.length > 0);
}

function formatPublishedDate(value: string | null) {
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

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveTopicKey(value: string) {
  const normalized = normalizeSearchText(value);

  for (const topic of TOPIC_ITEMS) {
    const matches = topic.aliases.some((alias) => normalized.includes(normalizeSearchText(alias)));
    if (matches) {
      return topic.key;
    }
  }

  return null;
}

function parseTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mapPostItem(item: PostApiItem): Post | null {
  if ((typeof item.id !== 'number' && typeof item.id !== 'string') || typeof item.slug !== 'string') {
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

  const kind: PostKind =
    typeof item.type === 'string' && item.type.trim().toLowerCase() === 'media' ? 'media' : 'article';
  const contentHtml = typeof item.content === 'string' ? item.content : '';
  const contentBlocks = stripHtmlToBlocks(contentHtml);
  const publishedAtIso =
    typeof item.published_at === 'string'
      ? item.published_at
      : typeof item.created_at === 'string'
        ? item.created_at
        : null;
  const source = typeof item.source === 'string' && item.source.trim().length > 0 ? item.source.trim() : 'Top Congo';
  const readingTimeMinutes = typeof item.reading_time === 'number' ? item.reading_time : null;
  const searchFragments = [item.title, item.slug, source, ...contentBlocks].filter(
    (value): value is string => typeof value === 'string'
  );
  const combinedText = searchFragments.join(' ');

  return {
    id: String(item.id),
    slug: item.slug.trim(),
    title: item.title.trim(),
    kind,
    imageSource: typeof item.image === 'string' && item.image.trim().length > 0 ? item.image.trim() : fallbackPostImage,
    publishedAtLabel: formatPublishedDate(publishedAtIso),
    publishedAtIso,
    readingTimeMinutes,
    readingTimeLabel: readingTimeMinutes !== null ? `${readingTimeMinutes} min` : null,
    source,
    sectionLabel: kind === 'media' ? 'Media' : 'Article',
    summary: contentBlocks[0] ?? '',
    contentBlocks,
    isFeatured: item.is_featured === true || item.is_featured === 1,
    topicKey: resolveTopicKey(combinedText),
    searchText: normalizeSearchText(combinedText),
  };
}

function comparePostsByDate(left: Post, right: Post) {
  return parseTimestamp(right.publishedAtIso) - parseTimestamp(left.publishedAtIso);
}

export async function fetchPosts() {
  const response = await postsHttpClient.get<PostsApiResponse>('/posts');
  const items = Array.isArray(response?.data) ? response.data : [];

  return items
    .filter(isPostApiItem)
    .map(mapPostItem)
    .filter((item): item is Post => item !== null)
    .sort(comparePostsByDate);
}

export function findPost(posts: Post[], slug: string | undefined) {
  return posts.find((item) => item.slug === slug);
}

export function selectRelatedPosts(posts: Post[], slug: string, limit = 3) {
  return posts.filter((item) => item.slug !== slug).slice(0, limit);
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
    retry(failureCount, error) {
      if (error instanceof ApiError && error.code === 'configuration') {
        return false;
      }

      return failureCount < 2;
    },
  });
}
