import {
  BookType,
  CalendarDays,
  MessageSquare,
  MessageCircle,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LucideBookOpen,
  Mail,
  MonitorCog,
  Package,
  PieChart,
  School,
  Settings,
  Users,
  Star,
} from 'lucide-react';

// Types pour les mappings
type LabelMappingType = {
  [key: string]: string;
};

type RouteMappingType = {
  [key: string]: string;
};

// Mapping des labels en français
export const LABEL_MAPPING: LabelMappingType = {
  dashboard: 'Tableau de bord',
  accueil: 'Accueil',
  'contact-page': 'Contact',
  chatbot: 'Chatbot',
  'a-propos': 'A propos',
  'profile.account': 'Mon compte',
  'profile.security': 'Sécurité',
  'profile.activities': 'Activités',
  'profile.notifications': 'Notifications',
  'profile.integrations': 'Intégrations',
  settings: 'Paramètres généraux',
};

// Mapping des routes nommées
export const ROUTE_MAPPING: RouteMappingType = {
  dashboard: 'dashboard',
  'profile.account': 'profile.account',
  'profile.security': 'profile.security',
  'profile.activities': 'profile.activities',
  'profile.notifications': 'profile.notifications',
  'profile.integrations': 'profile.integrations',
  settings: 'settings',
};

export const dataRoutes = {
  user: {
    name: 'Redeemer Holding',
    email: 'jb.wansi@hotmail.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Tableau de bord',
      url: route('dashboard'),
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: 'Formations',
      url: '#',
      icon: GraduationCap,
      items: [
        {
          title: 'Liste des formations',
          url: route('trainings.index'),
        },
        {
          title: 'Ajouter une formation',
          url: route('trainings.create'),
        },
      ],
    },
    {
      title: 'Evènements',
      url: '#',
      icon: CalendarDays,
      items: [
        {
          title: 'Liste des évènements',
          url: route('events.index'),
        },
        {
          title: 'Ajouter un évènement',
          url: route('events.create'),
        },
      ],
    },
    {
      title: 'Catégories',
      url: route('categories.index'),
      icon: School,
    },
    {
      title: 'Services',
      url: '#',
      icon: Package,
      items: [
        {
          title: 'Demande de service',
          url: route('service-requests.index'),
        },
        {
          title: 'Liste des  services',
          url: route('services.index'),
        },
      ],
    },
    {
      title: 'Blogs',
      url: '#',
      icon: BookType,
      items: [
        {
          title: 'Liste des articles',
          url: route('posts.index'),
        },
        {
          title: 'Ajouter un article',
          url: route('posts.create'),
        },
      ],
    },
    {
      title: 'Utilisateurs',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Liste des utilisateurs',
          url: route('users.index'),
        },
        {
          title: 'Ajouter un utilisateur',
          url: route('users.create'),
        },
        {
          title: 'Blocklist',
          url: route('users.blocked'),
        },
      ],
    },
    {
      title: 'Newsletters',
      url: route('newsletters.index'),
      icon: Mail,
    },
    {
      title: 'Contenus de pages',
      url: route('page-contents.index'),
      icon: LucideBookOpen,
    },
    {
      title: 'A propos',
      url: route('about.edit'),
      icon: Info,
    },
    {
      title: 'Accueil',
      url: route('home.edit'),
      icon: Home,
    },
    {
      title: 'Contact',
      url: route('contact-page.edit'),
      icon: MessageSquare,
    },
    {
      title: 'Chatbot',
      url: route('chatbot.edit'),
      icon: MessageCircle,
    },
    {
      title: 'Leads chatbot',
      url: route('chatbot-leads.index'),
      icon: Mail,
    },
    {
      title: 'Témoignages',
      url: '#',
      icon: Star,
      items: [
        {
          title: 'Liste des témoignages',
          url: route('testimonials.index'),
        },
        {
          title: 'Ajouter un témoignage',
          url: route('testimonials.create'),
        },
      ],
    },
    {
      title: 'Page statique',
      url: route('pages.index'),
      icon: LucideBookOpen,
    },
    {
      title: 'Configuration',
      url: '#',
      icon: MonitorCog,
      items: [
        {
          title: 'Activation',
          url: route('config.activation'),
        },
        {
          title: 'Base de données',
          url: route('config.database.index'),
        },
        {
          title: 'Système',
          url: route('config.system'),
        },
      ],
    },
    {
      title: 'Paramètres',
      url: route('settings.index'),
      icon: Settings,
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};
