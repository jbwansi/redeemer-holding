import React from 'react'
import {
    UserCog, // Développement personnel
    Users, // Coaching de groupe
    Brain, // Développement cognitif
    Target, // Objectifs
    Trophy, // Réussites
    Star, // Excellence
    Lightbulb, // Idées
    Heart, // Bien-être
    HandshakeIcon, // Partenariat
    GraduationCap, // Apprentissage
    LineChart, // Progression
    Compass, // Direction/guidance
    Rocket, // Croissance/lancement
    Award, // Récompenses/succès
    BarChart2, // Analyse de performance
    BookOpen, // Formation/apprentissage
    Calendar, // Planification
    CheckCircle2, // Accomplissement
    Clock, // Gestion du temps
    Cog, // Configuration/adaptation
    Crown, // Leadership
    Eye, // Vision/perspective
    FileSpreadsheet, // Rapports/évaluations
    FilterX, // Élimination des obstacles
    Flag, // Objectifs atteints
    FlaskConical, // Innovation/expérimentation
    Footprints, // Chemin personnel
    Gift, // Talents/potentiel
    Globe2, // Perspective globale
    HeartHandshake, // Empathie/connexion
    HelpCircle, // Support/aide
    Home, // Environnement de travail
    Infinity, // Potentiel illimité
    Laptop2, // Formation en ligne
    Layers, // Niveaux de développement
    LayoutDashboard, // Tableau de bord
    LifeBuoy, // Support/assistance
    Link, // Connexions/networking
    ListChecks, // Plans d'action
    MessageCircle, // Communication
    Milestone, // Étapes importantes
    Mountain, // Défis/sommets
    Network, // Réseautage
    Palette, // Créativité
    Pencil, // Prise de notes
    PieChart, // Analyse
    Puzzle, // Résolution de problèmes
    Scale, // Équilibre
    School2, // Formation
    Search, // Découverte
    Settings, // Personnalisation
    Shield, // Protection/sécurité
    Sparkles, // Innovation
    StickyNote, // Notes/feedback
    Timer, // Productivité
    Trash2, // Élimination des blocages
    TrendingUp, // Amélioration
    UserCheck, // Validation
    UserPlus, // Croissance personnelle
    Users2, // Communauté
    Workflow, // Process
    Zap, // Énergie/motivation
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ICONS = {
    UserCog,
    Users,
    Brain,
    Target,
    Trophy,
    Star,
    Lightbulb,
    Heart,
    Handshake: HandshakeIcon,
    Education: GraduationCap,
    Progress: LineChart,
    Guidance: Compass,
    Rocket,
    Award,
    Performance: BarChart2,
    Learning: BookOpen,
    Calendar,
    Success: CheckCircle2,
    Time: Clock,
    Settings: Cog,
    Leadership: Crown,
    Vision: Eye,
    Reports: FileSpreadsheet,
    Obstacles: FilterX,
    Goals: Flag,
    Innovation: FlaskConical,
    Journey: Footprints,
    Potential: Gift,
    Global: Globe2,
    Empathy: HeartHandshake,
    Support: HelpCircle,
    Workspace: Home,
    Unlimited: Infinity,
    Online: Laptop2,
    Levels: Layers,
    Dashboard: LayoutDashboard,
    Help: LifeBuoy,
    Network: Link,
    ActionPlan: ListChecks,
    Communication: MessageCircle,
    Milestone,
    Challenge: Mountain,
    Networking: Network,
    Creativity: Palette,
    Notes: Pencil,
    Analysis: PieChart,
    ProblemSolving: Puzzle,
    Balance: Scale,
    Training: School2,
    Discovery: Search,
    Customize: Settings,
    Security: Shield,
    Feedback: StickyNote,
    Productivity: Timer,
    Eliminate: Trash2,
    Growth: TrendingUp,
    Validation: UserCheck,
    PersonalGrowth: UserPlus,
    Community: Users2,
    Process: Workflow,
    Motivation: Zap
}

type IconType = keyof typeof ICONS

interface IconPickerProps {
    value: string
    onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const SelectedIcon = value ? ICONS[value as IconType] : null

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une icône">
                    <div className="flex items-center gap-2">
                        {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
                        <span>{value || "Choisir une icône"}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="h-72">
                {Object.entries(ICONS).map(([name, Icon]) => (
                    <SelectItem
                        key={name}
                        value={name}
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
