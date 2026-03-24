export type TopicKey =
  | 'economy'
  | 'technology'
  | 'security'
  | 'politics'
  | 'society'
  | 'environment'
  | 'transport'
  | 'health'
  | 'industries'
  | 'culture'
  | 'media'
  | 'sport'
  | 'education'
  | 'business'
  | 'justice'
  | 'climate'
  | 'international'
  | 'science'
  | 'entertainment'
  | 'opinion';

export type TopicItem = {
  key: TopicKey;
  emoji: string;
  aliases: string[];
};

export const TOPIC_ITEMS: TopicItem[] = [
  { key: 'economy', emoji: '\u{1F30D}', aliases: ['economie', 'economique', 'economy'] },
  { key: 'technology', emoji: '\u{1F4BB}', aliases: ['technologie', 'technologies', 'technology'] },
  { key: 'security', emoji: '\u{1FA96}', aliases: ['securite', 'security'] },
  { key: 'politics', emoji: '\u{1F3A4}', aliases: ['politique', 'politiques', 'politics'] },
  { key: 'society', emoji: '\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}', aliases: ['societe', 'society'] },
  { key: 'environment', emoji: '\u{1F331}', aliases: ['environnement', 'environment'] },
  { key: 'transport', emoji: '\u{1F6EB}', aliases: ['transport', 'transports'] },
  { key: 'health', emoji: '\u{1FA7A}', aliases: ['sante', 'health'] },
  { key: 'industries', emoji: '\u{1F6E0}\uFE0F', aliases: ['industrie', 'industries'] },
  { key: 'culture', emoji: '\u{1F3AD}', aliases: ['culture', 'cultures'] },
  { key: 'media', emoji: '\u{1F3A5}', aliases: ['media', 'medias'] },
  { key: 'sport', emoji: '\u{26BD}', aliases: ['sport', 'sports'] },
  { key: 'education', emoji: '\u{1F4DA}', aliases: ['education'] },
  { key: 'business', emoji: '\u{1F4BC}', aliases: ['business', 'affaires'] },
  { key: 'justice', emoji: '\u{2696}\uFE0F', aliases: ['justice', 'juridique'] },
  { key: 'climate', emoji: '\u{1F327}\uFE0F', aliases: ['climat', 'climate'] },
  { key: 'international', emoji: '\u{1F310}', aliases: ['international', 'internationale'] },
  { key: 'science', emoji: '\u{1F52C}', aliases: ['science', 'sciences'] },
  { key: 'entertainment', emoji: '\u{1F3AC}', aliases: ['divertissement', 'entertainment'] },
  { key: 'opinion', emoji: '\u{1F4AC}', aliases: ['opinion', 'opinions'] },
];
