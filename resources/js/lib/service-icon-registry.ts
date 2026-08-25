import {
  AudioLines,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Clock,
  Code2,
  Compass,
  Database,
  Flag,
  Globe,
  GraduationCap,
  Handshake,
  Headphones,
  Heart,
  HeartHandshake,
  Laptop,
  Leaf,
  Lightbulb,
  LineChart,
  Map,
  Medal,
  MessageCircle,
  MessagesSquare,
  Mic,
  Mic2,
  MonitorPlay,
  Music2,
  Palette,
  PenTool,
  Podcast,
  Presentation,
  Puzzle,
  Radio,
  Rocket,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  Video,
  Volume2,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_ICON_CATEGORIES = [
  'Coaching et accompagnement',
  'Équipes et organisations',
  'Formation et apprentissage',
  'Stratégie et performance',
  'Communication et créativité',
  'Carrière et orientation',
  'Numérique et technologie',
  'Valeurs et bien-être',
] as const;

export type ServiceIconCategory = (typeof SERVICE_ICON_CATEGORIES)[number];

export type ServiceIconDefinition = {
  name: string;
  label: string;
  category: ServiceIconCategory;
  keywords: string[];
  component: LucideIcon;
};

const icon = (
  name: string,
  label: string,
  category: ServiceIconCategory,
  component: LucideIcon,
  keywords: string[]
): ServiceIconDefinition => ({ name, label, category, component, keywords });

export const SERVICE_ICON_REGISTRY: ServiceIconDefinition[] = [
  icon('userRound', 'Profil individuel', 'Coaching et accompagnement', UserRound, [
    'personne',
    'coach',
    'individuel',
  ]),
  icon('userCheck', 'Personne accompagnée', 'Coaching et accompagnement', UserCheck, [
    'validation',
    'suivi',
    'client',
  ]),
  icon('compass', 'Boussole', 'Coaching et accompagnement', Compass, [
    'orientation',
    'direction',
    'repères',
  ]),
  icon('target', 'Objectif', 'Coaching et accompagnement', Target, ['but', 'coaching', 'résultat']),
  icon('route', 'Parcours', 'Coaching et accompagnement', Route, [
    'orientation',
    'chemin',
    'étapes',
  ]),
  icon('sparkles', 'Transformation', 'Coaching et accompagnement', Sparkles, [
    'évolution',
    'innovation',
    'potentiel',
  ]),
  icon('users', 'Équipe', 'Équipes et organisations', Users, ['équipe', 'groupe', 'collectif']),
  icon('handshake', 'Partenariat', 'Équipes et organisations', Handshake, [
    'équipe',
    'accord',
    'collaboration',
  ]),
  icon('heartHandshake', 'Coopération', 'Équipes et organisations', HeartHandshake, [
    'équipe',
    'entraide',
    'confiance',
  ]),
  icon('building2', 'Organisation', 'Équipes et organisations', Building2, [
    'entreprise',
    'équipe',
    'structure',
  ]),
  icon('workflow', 'Processus', 'Équipes et organisations', Workflow, [
    'organisation',
    'flux',
    'méthode',
  ]),
  icon('briefcase', 'Entreprise', 'Équipes et organisations', Briefcase, [
    'business',
    'travail',
    'professionnel',
  ]),
  icon('graduationCap', 'Formation', 'Formation et apprentissage', GraduationCap, [
    'formation',
    'diplôme',
    'apprentissage',
  ]),
  icon('bookOpen', 'Livre ouvert', 'Formation et apprentissage', BookOpen, [
    'formation',
    'lecture',
    'apprentissage',
  ]),
  icon('presentation', 'Présentation', 'Formation et apprentissage', Presentation, [
    'formation',
    'atelier',
    'enseignement',
  ]),
  icon('brain', 'Connaissances', 'Formation et apprentissage', Brain, [
    'formation',
    'intelligence',
    'réflexion',
  ]),
  icon('puzzle', 'Résolution de problème', 'Formation et apprentissage', Puzzle, [
    'apprentissage',
    'solution',
    'jeu',
  ]),
  icon('award', 'Réussite', 'Formation et apprentissage', Award, [
    'prix',
    'certification',
    'excellence',
  ]),
  icon('flag', 'Jalon', 'Stratégie et performance', Flag, ['objectif', 'étape', 'priorité']),
  icon('rocket', 'Croissance', 'Stratégie et performance', Rocket, [
    'lancement',
    'accélération',
    'performance',
  ]),
  icon('trendingUp', 'Progression', 'Stratégie et performance', TrendingUp, [
    'croissance',
    'performance',
    'résultat',
  ]),
  icon('lineChart', 'Courbe de progression', 'Stratégie et performance', LineChart, [
    'mesure',
    'performance',
    'analyse',
  ]),
  icon('trophy', 'Performance', 'Stratégie et performance', Trophy, [
    'succès',
    'victoire',
    'objectif',
  ]),
  icon('medal', 'Excellence', 'Stratégie et performance', Medal, [
    'récompense',
    'performance',
    'qualité',
  ]),
  icon('star', 'Étoile', 'Stratégie et performance', Star, ['excellence', 'qualité', 'favori']),
  icon('zap', 'Énergie', 'Stratégie et performance', Zap, ['action', 'rapidité', 'motivation']),
  icon('messageCircle', 'Conversation', 'Communication et créativité', MessageCircle, [
    'communication',
    'message',
    'échange',
  ]),
  icon('messagesSquare', 'Échanges', 'Communication et créativité', MessagesSquare, [
    'communication',
    'dialogue',
    'équipe',
  ]),
  icon('mic', 'Prise de parole', 'Communication et créativité', Mic, [
    'communication',
    'micro',
    'conférence',
  ]),
  icon('mic2', 'Microphone', 'Communication et créativité', Mic2, ['média', 'audio', 'parole']),
  icon('palette', 'Créativité', 'Communication et créativité', Palette, [
    'couleur',
    'création',
    'design',
  ]),
  icon('penTool', 'Conception', 'Communication et créativité', PenTool, [
    'créativité',
    'dessin',
    'design',
  ]),
  icon('lightbulb', 'Idée', 'Communication et créativité', Lightbulb, [
    'créativité',
    'innovation',
    'inspiration',
  ]),
  icon('podcast', 'Podcast', 'Communication et créativité', Podcast, [
    'média',
    'audio',
    'émission',
  ]),
  icon('video', 'Vidéo', 'Communication et créativité', Video, ['média', 'image', 'diffusion']),
  icon('headphones', 'Audio', 'Communication et créativité', Headphones, [
    'média',
    'écoute',
    'son',
  ]),
  icon('radio', 'Radio', 'Communication et créativité', Radio, ['média', 'diffusion', 'audio']),
  icon('monitorPlay', 'Diffusion', 'Communication et créativité', MonitorPlay, [
    'média',
    'vidéo',
    'écran',
  ]),
  icon('audioLines', 'Onde audio', 'Communication et créativité', AudioLines, [
    'média',
    'son',
    'voix',
  ]),
  icon('volume2', 'Son', 'Communication et créativité', Volume2, ['média', 'audio', 'volume']),
  icon('music2', 'Musique', 'Communication et créativité', Music2, [
    'média',
    'audio',
    'créativité',
  ]),
  icon('camera', 'Photographie', 'Communication et créativité', Camera, [
    'média',
    'photo',
    'image',
  ]),
  icon('map', 'Carte', 'Carrière et orientation', Map, ['orientation', 'parcours', 'itinéraire']),
  icon('calendar', 'Planification', 'Carrière et orientation', Calendar, [
    'agenda',
    'étapes',
    'temps',
  ]),
  icon('clock', 'Temps', 'Carrière et orientation', Clock, ['durée', 'organisation', 'planning']),
  icon('laptop', 'Ordinateur', 'Numérique et technologie', Laptop, [
    'numérique',
    'technologie',
    'digital',
  ]),
  icon('code2', 'Code', 'Numérique et technologie', Code2, [
    'numérique',
    'développement',
    'technologie',
  ]),
  icon('database', 'Données', 'Numérique et technologie', Database, [
    'numérique',
    'base',
    'information',
  ]),
  icon('globe', 'Monde numérique', 'Numérique et technologie', Globe, [
    'internet',
    'international',
    'web',
  ]),
  icon('shieldCheck', 'Sécurité validée', 'Numérique et technologie', ShieldCheck, [
    'sécurité',
    'protection',
    'confiance',
  ]),
  icon('shield', 'Protection', 'Valeurs et bien-être', Shield, [
    'sécurité',
    'confiance',
    'valeurs',
  ]),
  icon('heart', 'Bien-être', 'Valeurs et bien-être', Heart, ['santé', 'valeurs', 'émotion']),
  icon('leaf', 'Équilibre', 'Valeurs et bien-être', Leaf, ['nature', 'bien-être', 'durable']),
  icon('sprout', 'Développement', 'Valeurs et bien-être', Sprout, [
    'croissance',
    'bien-être',
    'potentiel',
  ]),
];

export function normalizeIconSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterServiceIcons(
  query: string,
  category: ServiceIconCategory | 'all' = 'all'
): ServiceIconDefinition[] {
  const normalizedQuery = normalizeIconSearch(query);

  return SERVICE_ICON_REGISTRY.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (!normalizedQuery) return true;

    return normalizeIconSearch(
      [entry.name, entry.label, entry.category, ...entry.keywords].join(' ')
    ).includes(normalizedQuery);
  });
}

export function findServiceIcon(name?: string | null): ServiceIconDefinition | undefined {
  if (!name) return undefined;
  return SERVICE_ICON_REGISTRY.find((entry) => entry.name === name);
}
