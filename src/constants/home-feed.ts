export const HOME_TOPICS = [
  { key: 'all' },
  { key: 'politics' },
  { key: 'economy' },
  { key: 'security' },
  { key: 'technology' },
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
  { key: 'listOneTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: true, topicKey: 'economy' },
  { key: 'listTwoTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true, topicKey: 'security' },
  { key: 'listThreeTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/concert.png'), saved: false, hasBadge: false, topicKey: 'politics' },
  { key: 'listFourTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: false, topicKey: 'technology' },
  { key: 'listFiveTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/concert.png'), saved: true, hasBadge: false, topicKey: 'security' },
  { key: 'listSixTitle', dateKey: 'listDate', imageSource: require('@/assets/images/home/emission.png'), saved: false, hasBadge: true, topicKey: 'economy' },
] as const;

export const SHOWS = [
  { key: 'showTopPresse', titleKey: 'showTopPresse', imageSource: require('@/assets/images/home/emission.png') },
  { key: 'showQueDitLaLoi', titleKey: 'showQueDitLaLoi', imageSource: require('@/assets/images/home/concert.png') },
  { key: 'showMagazine', titleKey: 'showMagazine', imageSource: require('@/assets/images/home/emission.png') },
] as const;

export const PODCASTS = [
  {
    key: 'podcastOne',
    badgeKey: 'podcastBadge',
    dateKey: 'podcastDate',
    titleKey: 'podcastTitle',
    imageSource: require('@/assets/images/home/emission.png'),
  },
  {
    key: 'podcastTwo',
    badgeKey: 'podcastBadge',
    dateKey: 'podcastDate',
    titleKey: 'podcastTitleTwo',
    imageSource: require('@/assets/images/home/concert.png'),
  },
  {
    key: 'podcastThree',
    badgeKey: 'podcastBadge',
    dateKey: 'podcastDate',
    titleKey: 'podcastTitleThree',
    imageSource: require('@/assets/images/home/emission.png'),
  },
] as const;
