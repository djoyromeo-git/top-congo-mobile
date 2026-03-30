import { useQuery } from '@tanstack/react-query';

import { getTopCongoApiUrl } from '@/features/auth/config';
import { ApiError } from '@/shared/api/api-error';
import { createHttpClient } from '@/shared/api/http-client';

type ScheduleSlotApiItem = {
  id?: unknown;
  day_of_week?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  slot_type?: unknown;
  label?: unknown;
  is_active?: unknown;
  sort_order?: unknown;
  timezone?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type ScheduleSlotsApiResponse = {
  data?: unknown;
};

export type ScheduleSlot = {
  id: string;
  dayOfWeek: string;
  startsAt: string;
  endsAt: string;
  slotType: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  timezone: string;
  createdAtIso: string | null;
  updatedAtIso: string | null;
};

const scheduleSlotsHttpClient = createHttpClient({
  baseUrl: getTopCongoApiUrl(),
});

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

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function isScheduleSlotApiItem(value: unknown): value is ScheduleSlotApiItem {
  return isRecord(value);
}

function parseTimeMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return hours * 60 + minutes;
}

function compareScheduleSlots(left: ScheduleSlot, right: ScheduleSlot) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  if (left.dayOfWeek !== right.dayOfWeek) {
    return left.dayOfWeek.localeCompare(right.dayOfWeek);
  }

  return parseTimeMinutes(left.startsAt) - parseTimeMinutes(right.startsAt);
}

function mapScheduleSlot(item: ScheduleSlotApiItem): ScheduleSlot | null {
  const id = item.id;
  const dayOfWeek = normalizeText(item.day_of_week).toLowerCase();
  const startsAt = normalizeText(item.starts_at);
  const endsAt = normalizeText(item.ends_at);
  const label = normalizeText(item.label);

  if ((typeof id !== 'string' && typeof id !== 'number') || !dayOfWeek || !startsAt || !endsAt || !label) {
    return null;
  }

  return {
    id: String(id),
    dayOfWeek,
    startsAt,
    endsAt,
    slotType: normalizeOptionalText(item.slot_type) ?? 'live',
    label,
    isActive: parseBooleanLike(item.is_active),
    sortOrder: parseNumber(item.sort_order),
    timezone: normalizeOptionalText(item.timezone) ?? 'Africa/Kinshasa',
    createdAtIso: normalizeOptionalText(item.created_at),
    updatedAtIso: normalizeOptionalText(item.updated_at),
  };
}

export async function fetchScheduleSlots() {
  const response = await scheduleSlotsHttpClient.get<ScheduleSlotsApiResponse>('/schedule-slots');
  const items = Array.isArray(response?.data) ? response.data : [];

  return items
    .filter(isScheduleSlotApiItem)
    .map(mapScheduleSlot)
    .filter((item): item is ScheduleSlot => item !== null)
    .sort(compareScheduleSlots);
}

export function findScheduleSlot(slots: ScheduleSlot[], slotId: string | undefined) {
  return slots.find((slot) => slot.id === slotId);
}

export function useScheduleSlots() {
  return useQuery({
    queryKey: ['schedule-slots'],
    queryFn: fetchScheduleSlots,
    staleTime: 1000 * 60 * 5,
    retry(failureCount, error) {
      if (error instanceof ApiError && error.code === 'configuration') {
        return false;
      }

      return failureCount < 2;
    },
  });
}
