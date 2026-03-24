import { useQuery } from '@tanstack/react-query';

import { type TopicKey, TOPIC_ITEMS } from '@/constants/topics';
import { getTopCongoApiUrl } from '@/features/auth/config';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';

type TopicApiItem = {
  id?: unknown;
  name?: unknown;
  parent_id?: unknown;
  has_children?: unknown;
};

type TopicsApiResponse = {
  data?: unknown;
};

export type TopicOption = {
  id: string;
  name: string;
  label: string;
  parentId: string | null;
  hasChildren: boolean;
  topicKey: TopicKey | null;
  emoji: string | null;
};

const topicsHttpClient = createHttpClient({
  baseUrl: getTopCongoApiUrl(),
});

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTopicLabel(name: string) {
  return name.replace(/^actualites?\s*/i, '').replace(/\s+/g, ' ').trim() || name.trim();
}

function isTopicApiItem(value: unknown): value is TopicApiItem {
  return typeof value === 'object' && value !== null;
}

function resolveTopicMeta(name: string) {
  const normalized = normalizeText(name);

  for (const topic of TOPIC_ITEMS) {
    const matches = topic.aliases.some((alias) => normalized.includes(normalizeText(alias)));
    if (matches) {
      return topic;
    }
  }

  return null;
}

function mapTopicOption(item: TopicApiItem): TopicOption | null {
  if (typeof item.id !== 'number' && typeof item.id !== 'string') {
    return null;
  }

  if (typeof item.name !== 'string' || item.name.trim().length === 0) {
    return null;
  }

  const topicMeta = resolveTopicMeta(item.name);

  return {
    id: String(item.id),
    name: item.name.trim(),
    label: formatTopicLabel(item.name),
    parentId:
      typeof item.parent_id === 'number' || typeof item.parent_id === 'string'
        ? String(item.parent_id)
        : null,
    hasChildren: item.has_children === true,
    topicKey: topicMeta?.key ?? null,
    emoji: topicMeta?.emoji ?? null,
  };
}

function dedupeTopicOptions(options: TopicOption[]) {
  const seen = new Set<string>();

  return options.filter((item) => {
    const fingerprint = `${normalizeText(item.label)}::${item.parentId ?? 'root'}`;
    if (seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);
    return true;
  });
}

export function selectTopicChipOptions(options: TopicOption[]) {
  const leafOptions = options.filter((item) => !item.hasChildren);
  const rootOptions = options.filter((item) => item.parentId === null);
  const preferredOptions = leafOptions.length > 0 ? leafOptions : rootOptions.length > 0 ? rootOptions : options;

  return dedupeTopicOptions(preferredOptions);
}

export async function fetchTopicsOptions() {
  const response = await topicsHttpClient.get<TopicsApiResponse>('/categories/options');
  const items = Array.isArray(response?.data) ? response.data : [];

  return items
    .filter(isTopicApiItem)
    .map(mapTopicOption)
    .filter((item): item is TopicOption => item !== null);
}

export function useTopicsOptions() {
  return useQuery({
    queryKey: ['topics', 'options'],
    queryFn: fetchTopicsOptions,
    staleTime: 1000 * 60 * 5,
    retry(failureCount, error) {
      if (error instanceof ApiError && error.code === 'configuration') {
        return false;
      }

      return failureCount < 2;
    },
  });
}
