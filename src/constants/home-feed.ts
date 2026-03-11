export const QUICK_TOPICS = [
  { key: 'economy', emoji: '\u{1F30D}' },
  { key: 'technology', emoji: '\u{1F4BB}' },
  { key: 'security', emoji: '\u{1FA96}' },
] as const;

export const FEATURED_NEWS = [
  {
    key: 'featuredOne',
    badgeKey: 'cardOneBadge',
    dateKey: 'cardOneDate',
    titleKey: 'cardOneTitle',
    imageSource: require('@/assets/images/home/concert.png'),
    fallbackVariant: 'dark' as const,
    saved: false,
    showBadgeDot: true,
  },
  {
    key: 'featuredTwo',
    badgeKey: 'cardTwoBadge',
    dateKey: 'cardTwoDate',
    titleKey: 'cardTwoTitle',
    imageSource: require('@/assets/images/home/emission.png'),
    fallbackVariant: 'blue' as const,
    saved: true,
    showBadgeDot: false,
  },
] as const;

export const NEWS_ITEMS = [
  { key: 'listOneTitle', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: true, topicKey: 'economy' },
  { key: 'listTwoTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true, topicKey: 'security' },
  { key: 'listThreeTitle', imageSource: require('@/assets/images/home/concert.png'), saved: false, hasBadge: false, topicKey: 'politics' },
  { key: 'listFourTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: false, topicKey: 'technology' },
  { key: 'listFiveTitle', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: false, topicKey: 'security' },
  { key: 'listSixTitle', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true, topicKey: 'economy' },
] as const;
