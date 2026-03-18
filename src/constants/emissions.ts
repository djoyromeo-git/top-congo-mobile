import { Palette } from '@/constants/theme';

export type EmissionSlug = 'top-presse' | 'le-debat' | 'que-dit-la-loi';

export type EmissionEpisode = {
  id: string;
  title: string;
  date: string;
  duration: string;
  imageSource: number;
  host: string;
  description: string;
};

export type Emission = {
  slug: EmissionSlug;
  title: string;
  host: string;
  imageSource: number;
  summary: string;
  schedule: { day: string; label: string; time: string }[];
  episodes: EmissionEpisode[];
};

const sharedImage = require('@/assets/images/home/emission.png');
const altImage = require('@/assets/images/home/concert.png');

export const EMISSION_FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'top-presse', label: 'Top Presse' },
  { key: 'le-debat', label: 'Le Débat' },
  { key: 'que-dit-la-loi', label: 'Que dit la loi ?' },
] as const;

export const EMISSIONS: Emission[] = [
  {
    slug: 'top-presse',
    title: 'TOP PRESSE',
    host: 'Eric Ambago',
    imageSource: sharedImage,
    summary:
      "Une plongée quotidienne dans l'actualité politique et économique avec analyses et interviews exclusives.",
    schedule: [
      { day: 'LUNDIS', label: 'DIFFUSION', time: '19H00 - 20H30' },
      { day: 'VENDREDIS', label: 'REDIFFUSION', time: '19H00 - 20H30' },
    ],
    episodes: [
      {
        id: 'ep-top-1',
        title: 'Politique : Le débat sur la révision constitutionnelle s’intensifie',
        date: '11 Mars 2026',
        duration: '04:39:20 / 11:12:45',
        imageSource: sharedImage,
        host: 'Eric Ambago',
        description:
          "Analyse complète des enjeux de la révision constitutionnelle et ses impacts sur la scène politique congolaise.",
      },
      {
        id: 'ep-top-2',
        title: 'Diplomatie : Judith Suminwa dénonce les violences de l’Est',
        date: '11 Mars 2026',
        duration: '04:39:20',
        imageSource: altImage,
        host: 'Eric Ambago',
        description:
          'Focus diplomatique sur les tensions régionales et le rôle des partenaires internationaux.',
      },
      {
        id: 'ep-top-3',
        title: 'Sport : Le film de la qualification des léopards',
        date: '11 Mars 2026',
        duration: '04:39:20',
        imageSource: sharedImage,
        host: 'Eric Ambago',
        description:
          'Retour en images et en témoignages sur le parcours victorieux des léopards.',
      },
    ],
  },
  {
    slug: 'le-debat',
    title: 'LE DEBAT',
    host: 'Panel d’invités',
    imageSource: altImage,
    summary:
      'Un débat contradictoire avec des experts pour éclairer les grandes questions de société et de politique.',
    schedule: [
      { day: 'MARDIS', label: 'DIFFUSION', time: '20H00 - 21H00' },
      { day: 'DIMANCHES', label: 'REDIFFUSION', time: '14H00 - 15H00' },
    ],
    episodes: [
      {
        id: 'ep-debat-1',
        title: 'Sécurité : Comment renforcer la paix à l’Est ?',
        date: '11 Mars 2026',
        duration: '00:49:20',
        imageSource: altImage,
        host: 'Thierry Kambundi',
        description: 'Débat entre acteurs locaux et ONG sur les initiatives de pacification.',
      },
    ],
  },
  {
    slug: 'que-dit-la-loi',
    title: 'QUE DIT LA LOI ?',
    host: 'Cécile Ngomba | Eric Lukoki',
    imageSource: sharedImage,
    summary:
      'Décryptage juridique des faits d’actualité, expliqué par des praticiens du droit et des universitaires.',
    schedule: [{ day: 'MERCREDIS', label: 'DIFFUSION', time: '18H00 - 19H00' }],
    episodes: [
      {
        id: 'ep-loi-1',
        title: 'Droits des femmes : les avancées légales récentes',
        date: '11 Mars 2026',
        duration: '00:39:20',
        imageSource: sharedImage,
        host: 'Cécile Ngomba',
        description: 'Revue des dernières réformes et de leurs impacts pour les congolaises.',
      },
    ],
  },
] as const;

export function findEmission(slug: string | undefined): Emission | undefined {
  return EMISSIONS.find((item) => item.slug === slug);
}

export function findEpisode(slug: string | undefined, episodeId: string | undefined): EmissionEpisode | undefined {
  const emission = findEmission(slug);
  if (!emission) return undefined;
  return emission.episodes.find((ep) => ep.id === episodeId);
}
