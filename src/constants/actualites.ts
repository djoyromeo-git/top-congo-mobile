export type ActualiteCategoryKey = 'all' | 'politics' | 'economy' | 'security' | 'sport';

export type ActualiteKind = 'article' | 'media';

export type ActualiteItem = {
  slug: string;
  title: string;
  date: string;
  category: Exclude<ActualiteCategoryKey, 'all'>;
  imageSource: number;
  saved: boolean;
  kind: ActualiteKind;
  duration?: string;
  verified?: boolean;
  sectionLabel: string;
  authorName: string;
  authorRole: string;
  leadTitle: string;
  summary: string;
  paragraphs: string[];
  quote?: string;
  relatedSlugs: string[];
};

const concertImage = require('@/assets/images/home/concert.png');
const emissionImage = require('@/assets/images/home/emission.png');

export const ACTUALITES_CATEGORIES: { key: ActualiteCategoryKey; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'politics', label: 'Politique' },
  { key: 'economy', label: 'Economie' },
  { key: 'security', label: 'Securite' },
  { key: 'sport', label: 'Sport' },
];

export const ACTUALITES_ITEMS: ActualiteItem[] = [
  {
    slug: 'fally-ipupa-route-stade-france',
    title: "Dans l'intimite de Fally Ipupa - La route vers le Stade de France",
    date: '11 Mars 2026',
    category: 'politics',
    imageSource: concertImage,
    saved: true,
    kind: 'media',
    duration: '04:39:20',
    verified: true,
    sectionLabel: 'Magazine',
    authorName: 'Grace Bolenge',
    authorRole: 'Reporter',
    leadTitle: 'Une immersion dans les coulisses de la tournee',
    summary:
      "Le reportage revient sur les preparatifs, les choix artistiques et la pression autour de l'un des rendez-vous musicaux les plus attendus de l'annee.",
    paragraphs: [
      "Des repetitions a huis clos jusqu'aux decisions logistiques de derniere minute, l'equipe de Top Congo a suivi les derniers jours de preparation du spectacle.",
      "L'artiste et son entourage reviennent sur la scenographie, les enjeux de production et la maniere dont ce concert doit porter une image ambitieuse de la creation congolaise sur la scene internationale.",
    ],
    quote:
      'Chaque detail compte. Ce concert doit raconter une histoire qui depasse la performance scenique.',
    relatedSlugs: ['judith-suminwa-onu', 'debat-revision-constitutionnelle', 'film-qualification-leopards'],
  },
  {
    slug: 'judith-suminwa-onu',
    title: "Diplomatie : Judith Suminwa denonce les violences de l'Est a la tribune de l'ONU",
    date: '12 Janvier 2026',
    category: 'politics',
    imageSource: emissionImage,
    saved: false,
    kind: 'article',
    sectionLabel: 'Journal',
    authorName: 'Eric Ambango',
    authorRole: 'Reporteur',
    leadTitle: 'Un appel a la mobilisation internationale',
    summary:
      "Intervenant lors d'une session consacree aux crises securitaires dans le monde, Judith Suminwa a alerte sur la gravite de la situation dans les provinces du Nord-Kivu et de l'Ituri.",
    paragraphs: [
      "La cheffe du gouvernement congolais a evoque une crise humanitaire persistante, marquee par des attaques armees, des deplacements massifs de civils et une insecurite qui continue de fragiliser la stabilite de toute la region.",
      "Elle a demande un engagement plus ferme des partenaires internationaux, tout en rappelant que la RDC attend des actes concrets sur le plan diplomatique, securitaire et humanitaire.",
    ],
    quote:
      "Le peuple congolais ne peut continuer a vivre dans la peur permanente. La communaute internationale doit renforcer son engagement pour restaurer la paix durable dans l'Est de la RDC.",
    relatedSlugs: ['droits-femmes-beni', 'debat-revision-constitutionnelle', 'tracabilite-coltan'],
  },
  {
    slug: 'debat-revision-constitutionnelle',
    title: "Politique : Le debat sur la revision constitutionnelle s'intensifie",
    date: '11 Mars 2026',
    category: 'politics',
    imageSource: concertImage,
    saved: false,
    kind: 'media',
    duration: '04:39:20',
    sectionLabel: 'Journal',
    authorName: 'Thierry Kambundi',
    authorRole: 'Animateur',
    leadTitle: 'Un sujet devenu central dans le debat public',
    summary:
      "Majorite, opposition et societes civiles multiplient les prises de parole sur l'opportunite et les risques d'une telle reforme.",
    paragraphs: [
      "Le projet rebat les cartes du calendrier politique et reouvre des questions institutionnelles que plusieurs acteurs estimaient closes.",
      "Sur le terrain, les prises de position se radicalisent et nourrissent un climat de confrontation qui pourrait durablement structurer la sequence politique a venir.",
    ],
    relatedSlugs: ['judith-suminwa-onu', 'film-qualification-leopards', 'droits-femmes-beni'],
  },
  {
    slug: 'film-qualification-leopards',
    title: 'Sport : Le film de la qualification des leopards',
    date: '11 Mars 2026',
    category: 'sport',
    imageSource: emissionImage,
    saved: false,
    kind: 'media',
    duration: '04:39:20',
    verified: true,
    sectionLabel: 'Sport',
    authorName: 'Patrick Mavungu',
    authorRole: 'Chroniqueur',
    leadTitle: 'Retour sur une campagne qui a marque les supporters',
    summary:
      "Des matches decisifs aux scenes de liesse, l'equipe retrace les temps forts qui ont mene les Leopards vers la qualification.",
    paragraphs: [
      "Le collectif congolais a construit sa performance sur une discipline tactique retrouvee et une meilleure gestion des moments de pression.",
      "Autour de l'equipe nationale, les supporters ont transforme cette qualification en evenement populaire, symbole d'un regain de confiance.",
    ],
    relatedSlugs: ['debat-revision-constitutionnelle', 'droits-femmes-beni', 'tracabilite-coltan'],
  },
  {
    slug: 'droits-femmes-beni',
    title: 'Droits des femmes : Les policieres de Beni se mobilisent',
    date: '11 Mars 2026',
    category: 'security',
    imageSource: emissionImage,
    saved: false,
    kind: 'article',
    sectionLabel: 'Societe',
    authorName: 'Aline Matondo',
    authorRole: 'Reporter',
    leadTitle: 'Une presence accrue sur le terrain',
    summary:
      "A Beni, plusieurs unites feminines renforcent leurs actions de prevention, d'ecoute et de mediation aupres des populations vulnerables.",
    paragraphs: [
      "Les initiatives se concentrent sur la protection des femmes et des enfants, la collecte de temoignages et l'orientation des victimes vers les dispositifs d'accompagnement.",
      "Pour les responsables locales, cette mobilisation doit aussi encourager une plus grande representation des femmes dans les services de securite.",
    ],
    relatedSlugs: ['judith-suminwa-onu', 'film-qualification-leopards', 'tracabilite-coltan'],
  },
  {
    slug: 'tracabilite-coltan',
    title: 'Enquete exclusive : tracabilite du Coltan, ce que disent les multinationales',
    date: '11 Mars 2026',
    category: 'economy',
    imageSource: concertImage,
    saved: true,
    kind: 'article',
    verified: true,
    sectionLabel: 'Enquete',
    authorName: 'Nadine Mbayo',
    authorRole: 'Journaliste',
    leadTitle: 'La question de la chaine de valeur reste ouverte',
    summary:
      "Entre exigences de conformite, pression des marches et demandes de transparence, les groupes internationaux avancent des engagements encore contestes.",
    paragraphs: [
      "Les industriels assurent qu'ils multiplient les controles et les audits, mais plusieurs experts jugent les mecanismes actuels encore insuffisants pour garantir une tracabilite complete.",
      "Sur le terrain, les cooperatives minieres et les observateurs independants demandent des dispositifs plus contraignants et plus lisibles pour les producteurs locaux.",
    ],
    relatedSlugs: ['judith-suminwa-onu', 'droits-femmes-beni', 'debat-revision-constitutionnelle'],
  },
  {
    slug: 'journal-19h',
    title: 'Le journal de 19H',
    date: '12 Janvier 2026',
    category: 'politics',
    imageSource: emissionImage,
    saved: false,
    kind: 'media',
    duration: '4:39:20 / 11:12:45',
    sectionLabel: 'Journal',
    authorName: 'Thierry Kambundi',
    authorRole: 'Animateur',
    leadTitle: 'Une edition marquee par les dossiers diplomatiques et securitaires',
    summary:
      "Cette edition revient sur les sujets majeurs du jour, avec un accent particulier sur la situation dans l'Est, les discussions institutionnelles et l'actualite sportive.",
    paragraphs: [
      "Le conducteur de cette tranche donne une large place aux reportages de terrain, aux interventions d'experts et aux analyses en plateau.",
      "La formule alterne video et audio pour permettre une diffusion souple selon le contexte de consultation et les contraintes reseau.",
    ],
    relatedSlugs: ['judith-suminwa-onu', 'debat-revision-constitutionnelle', 'film-qualification-leopards'],
  },
];

export function findActualite(slug: string | undefined) {
  return ACTUALITES_ITEMS.find((item) => item.slug === slug);
}

export function getRelatedActualites(slugs: string[]) {
  const slugSet = new Set(slugs);
  return ACTUALITES_ITEMS.filter((item) => slugSet.has(item.slug));
}
