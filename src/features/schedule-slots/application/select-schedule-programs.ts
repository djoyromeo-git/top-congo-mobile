import type { EmissionEpisode, EmissionShow } from '@/features/emissions/infrastructure/fetch-emission-shows';
import type { ScheduleSlot } from '@/features/schedule-slots/infrastructure/fetch-schedule-slots';

export type ScheduleProgram = {
  slot: ScheduleSlot;
  show: EmissionShow | null;
  title: string;
  description: string;
  host: string;
  imageSource: string | number;
  currentEpisode: EmissionEpisode | null;
  otherEpisodes: EmissionEpisode[];
  hasVideo: boolean;
};

export type ScheduleDayOption = {
  key: string;
  label: string;
  dayOfWeek: string;
};

const fallbackProgramImage = require('@/assets/images/home/emission.png');

function normalizeForMatch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getWeekdayIndex(dayOfWeek: string) {
  switch (dayOfWeek.toLowerCase()) {
    case 'sunday':
      return 0;
    case 'monday':
      return 1;
    case 'tuesday':
      return 2;
    case 'wednesday':
      return 3;
    case 'thursday':
      return 4;
    case 'friday':
      return 5;
    case 'saturday':
      return 6;
    default:
      return -1;
  }
}

function parseTimeMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function getTimeParts(now: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday')?.value.toLowerCase() ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  return {
    weekday,
    minutes: hour * 60 + minute,
  };
}

export function isScheduleSlotLive(slot: ScheduleSlot, now = new Date()) {
  const timeParts = getTimeParts(now, slot.timezone);
  if (timeParts.weekday !== slot.dayOfWeek.toLowerCase()) {
    return false;
  }

  const startMinutes = parseTimeMinutes(slot.startsAt);
  const endMinutes = parseTimeMinutes(slot.endsAt);

  return timeParts.minutes >= startMinutes && timeParts.minutes <= endMinutes;
}

function compareShowMatch(label: string, show: EmissionShow) {
  const normalizedLabel = normalizeForMatch(label);
  const titleScore =
    normalizeForMatch(show.title) === normalizedLabel
      ? 4
      : normalizeForMatch(show.title).includes(normalizedLabel) || normalizedLabel.includes(normalizeForMatch(show.title))
        ? 3
        : 0;
  const hostScore = normalizeForMatch(show.host).includes(normalizedLabel) ? 1 : 0;
  const descriptionScore = normalizeForMatch(show.description).includes(normalizedLabel) ? 1 : 0;

  return titleScore + hostScore + descriptionScore;
}

function matchShow(label: string, shows: EmissionShow[]) {
  let bestMatch: EmissionShow | null = null;
  let bestScore = 0;

  for (const show of shows) {
    const score = compareShowMatch(label, show);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = show;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

export function selectSchedulePrograms(slots: ScheduleSlot[], shows: EmissionShow[]) {
  return slots.map((slot) => {
    const show = matchShow(slot.label, shows);
    const currentEpisode = show?.episodes[0] ?? null;
    const hasVideo = currentEpisode?.assets.some((asset) => asset.type.toLowerCase() === 'video') ?? false;

    return {
      slot,
      show,
      title: currentEpisode?.title || slot.label,
      description: currentEpisode?.description || show?.description || '',
      host: show?.host || 'Top Congo',
      imageSource: currentEpisode?.imageSource || show?.imageSource || fallbackProgramImage,
      currentEpisode,
      otherEpisodes: show?.episodes.slice(1) ?? [],
      hasVideo,
    } satisfies ScheduleProgram;
  });
}

export function selectProgramsForDay(programs: ScheduleProgram[], dayOfWeek: string) {
  return programs.filter((program) => program.slot.dayOfWeek === dayOfWeek.toLowerCase());
}

export function chunkSchedulePrograms(programs: ScheduleProgram[], chunkSize = 4) {
  const result: ScheduleProgram[][] = [];

  for (let index = 0; index < programs.length; index += chunkSize) {
    result.push(programs.slice(index, index + chunkSize));
  }

  return result;
}

export function buildScheduleDayOptions(
  t: (key: string) => string,
  referenceDate = new Date()
): ScheduleDayOption[] {
  const options: ScheduleDayOption[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() + offset);
    const weekdayIndex = date.getDay();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekdayIndex] ?? 'monday';

    options.push({
      key: `${dayOfWeek}-${offset}`,
      label:
        offset === 0
          ? "Aujourd'hui"
          : offset === 1
            ? 'Demain'
            : getDayLabel(dayOfWeek, t),
      dayOfWeek,
    });
  }

  return options;
}

export function getDayLabel(dayOfWeek: string, t: (key: string) => string) {
  switch (dayOfWeek.toLowerCase()) {
    case 'monday':
      return t('emissions.days.monday');
    case 'tuesday':
      return t('emissions.days.tuesday');
    case 'wednesday':
      return t('emissions.days.wednesday');
    case 'thursday':
      return t('emissions.days.thursday');
    case 'friday':
      return t('emissions.days.friday');
    case 'saturday':
      return t('emissions.days.saturday');
    case 'sunday':
      return t('emissions.days.sunday');
    default:
      return dayOfWeek;
  }
}

export function selectInitialScheduleDay(referenceDate = new Date()) {
  const weekdayIndex = referenceDate.getDay();
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekdayIndex] ?? 'monday';
}

export function compareSchedulePrograms(left: ScheduleProgram, right: ScheduleProgram) {
  if (left.slot.sortOrder !== right.slot.sortOrder) {
    return left.slot.sortOrder - right.slot.sortOrder;
  }

  return parseTimeMinutes(left.slot.startsAt) - parseTimeMinutes(right.slot.startsAt);
}

export function selectProgramById(programs: ScheduleProgram[], slotId: string | undefined) {
  return programs.find((program) => program.slot.id === slotId);
}

export function getScheduleRoute(slotId: string) {
  return `/schedule-slots/${slotId}` as const;
}

export function getSlotTimeLabel(slot: ScheduleSlot) {
  return `${slot.startsAt} - ${slot.endsAt}`;
}

export function getSlotStartLabel(slot: ScheduleSlot) {
  return slot.startsAt;
}

export function isSameWeekday(option: ScheduleDayOption, slot: ScheduleSlot) {
  return getWeekdayIndex(option.dayOfWeek) === getWeekdayIndex(slot.dayOfWeek);
}
