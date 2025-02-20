import { BookType, CalendarDays, Frame, GalleryVerticalEnd, LayoutDashboard, LucideBookOpen, Mail, MonitorCog, Package, PieChart, Settings, Users } from "lucide-react";

// Types pour les mappings
type LabelMappingType = {
    [key: string]: string;
};

type RouteMappingType = {
    [key: string]: string;
};

// Mapping des labels en français
export const LABEL_MAPPING: LabelMappingType = {
    dashboard: "Tableau de bord",
    "profile.account": "Mon compte",
    "profile.security": "Sécurité",
    "profile.activities": "Activités",
    "profile.notifications": "Notifications",
    "profile.integrations": "Intégrations",
    settings: "Paramètres généraux",
};

// Mapping des routes nommées
export const ROUTE_MAPPING: RouteMappingType = {
    dashboard: "dashboard",
    "profile.account": "profile.account",
    "profile.security": "profile.security",
    "profile.activities": "profile.activities",
    "profile.notifications": "profile.notifications",
    "profile.integrations": "profile.integrations",
    settings: "settings",
};

export const dataRoutes = {
    user: {
        name: "Carlos Alognon",
        email: "m@example.com",
        avatar: "https://avatars.githubusercontent.com/u/911",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
    ],
    navMain: [
        {
            title: "Tableau de bord",
            url: route('dashboard'),
            icon: LayoutDashboard,
            isActive: true,
        },
        {
            title: "Evènements",
            url: "#",
            icon: CalendarDays,
            items: [
                {
                    title: "Liste des évènements",
                    url: route("events.index"),
                },
                {
                    title: "Ajouter un évènement",
                    url: route("events.create"),
                },
                {
                    title: "Categories",
                    url: route('event-categories.index'),
                },
            ],
        },
        {
            title: "Services",
            url: "#",
            icon: Package,
            items: [
                {
                    title: "Demande de service",
                    url: route('service-requests.index'),
                },
                {
                    title: "Liste des  services",
                    url: route('services.index'),
                },
            ],
        },
        {
            title: "Blogs",
            url: "#",
            icon: BookType,
            items: [
                {
                    title: "Liste des articles",
                    url: route("posts.index"),
                },
                {
                    title: "Ajouter un article",
                    url: route("posts.create"),
                },
                {
                    title: "Catégories",
                    url: route("categories.index"),
                },
            ],
        },
        {
            title: "Utilisateurs",
            url: "#",
            icon: Users,
            items: [
                {
                    title: "Liste des utilisateurs",
                    url: route('users.index'),
                },
                {
                    title: "Ajouter un utilisateur",
                    url: route('users.create'),
                },
                {
                    title: "Blocklist",
                    url: route('users.blocked'),
                },
            ],
        },
        {
            title: "Newsletters",
            url: "",
            icon: Mail,
        },
        {
            title: "Page statique",
            url: route("pages.index"),
            icon: LucideBookOpen,
        },
        {
            title: "Configuration",
            url: "#",
            icon: MonitorCog,
            items: [
                {
                    title: "Activation",
                    url: route("config.activation"),
                },
                {
                    title: "Base de données",
                    url: route("config.database_clean"),
                },
                {
                    title: "Système",
                    url: route("config.system"),
                },
            ],
        },
        {
            title: "Paramètres",
            url: route("settings"),
            icon: Settings,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
};
