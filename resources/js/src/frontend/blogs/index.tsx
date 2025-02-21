import React, { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    Search,
    Calendar,
    User,
    Tag,
    Clock,
    ArrowRight,
    BookOpen,
    TrendingUp,
    MessageCircle,
    Heart,
    Share2,
    Filter,
    X
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Category } from '@/types/category';
import { PostProps, PostResponse, SinglePostResponse } from '@/types/post';
import { formatDate } from '@/lib/utils';
interface Props {
    posts: PostResponse;
    categories: any;
    tags: any;
    featuredPost: SinglePostResponse;
}
const BlogPage = ({ posts, categories, tags, featuredPost }: Props) => {
    // États pour les filtres
    console.log(featuredPost);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuredRef = useRef(null);
    const postsGridRef = useRef(null);
    const categoriesRef = useRef(null);
    const newsletterRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isPostsGridInView = useInView(postsGridRef, { once: false, amount: 0.2 });
    const isCategoriesInView = useInView(categoriesRef, { once: false, amount: 0.5 });
    const isNewsletterInView = useInView(newsletterRef, { once: false, amount: 0.5 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Données d'exemple (à remplacer par les props)
    const allCategories = categories || [
        { id: 1, name: 'Développement personnel', posts_count: 12, icon: '🧠', color: 'from-red-500 to-orange-500' },
        { id: 2, name: 'Productivité', posts_count: 8, icon: '⏱️', color: 'from-purple-500 to-indigo-500' },
        { id: 3, name: 'Bien-être', posts_count: 10, icon: '🧘', color: 'from-emerald-500 to-teal-500' },
        { id: 4, name: 'Leadership', posts_count: 6, icon: '👑', color: 'from-amber-500 to-yellow-500' },
        { id: 5, name: 'Communication', posts_count: 9, icon: '💬', color: 'from-blue-500 to-cyan-500' }
    ];

    const allTags = tags || [
        'Motivation', 'Habitudes', 'Mindfulness', 'Gestion du temps', 'Objectifs',
        'Résilience', 'Psychologie positive', 'Confiance', 'Intelligence émotionnelle'
    ];

    const defaultFeaturedPost = {
        id: 1,
        title: "7 habitudes qui transformeront votre quotidien en 30 jours",
        excerpt: "Découvrez les techniques scientifiquement prouvées pour créer des habitudes durables et transformer votre vie progressivement et sans effort.",
        coverImage: {
            original: "/assets/images/coaching-session.jpg"
        },
        category: "Développement personnel",
        author: {
            name: "Jean Bernard",
            avatar: "/assets/images/avatar.jpg"
        },
        publishedAt: "12 février 2025",
        readTime: "8 min de lecture",
        tags: ["Habitudes", "Productivité", "Transformation"]
    };

    const featuredPostData = featuredPost?.data || defaultFeaturedPost;

    const allPosts = posts?.data || [
        {
            id: 2,
            title: "Comment maîtriser l'art de la visualisation pour atteindre vos objectifs",
            excerpt: "La visualisation est une technique puissante utilisée par les athlètes d'élite et les entrepreneurs à succès. Voici comment l'intégrer efficacement dans votre quotidien.",
            coverImage: { original: "/assets/images/coaching-session.jpg" },
            category: "Développement personnel",
            author: {
                name: "Jean Bernard",
                avatar: "/assets/images/avatar.jpg"
            },
            publishedAt: "5 février 2025",
            readTime: "6 min de lecture",
            tags: ["Visualisation", "Objectifs", "Psychologie positive"]
        },
        {
            id: 3,
            title: "5 techniques de respiration pour réduire le stress instantanément",
            excerpt: "Les exercices de respiration sont un moyen simple mais efficace de calmer votre système nerveux. Découvrez les techniques utilisées par les experts en méditation.",
            coverImage: { original: "/assets/images/coaching-session.jpg" },
            category: "Bien-être",
            author: {
                name: "Claire Martin",
                avatar: "/assets/images/authors/claire.jpg"
            },
            publishedAt: "28 janvier 2025",
            readTime: "5 min de lecture",
            tags: ["Respiration", "Anti-stress", "Mindfulness"]
        },
        {
            id: 4,
            title: "Le guide complet de la méthode Pomodoro pour optimiser votre concentration",
            excerpt: "La technique Pomodoro est une méthode de gestion du temps qui peut révolutionner votre productivité. Découvrez comment l'appliquer efficacement.",
            coverImage: { original: "/assets/images/services-bg.jpg" },
            category: "Productivité",
            author: {
                name: "Thomas Dubois",
                avatar: "/assets/images/authors/thomas.jpg"
            },
            publishedAt: "20 janvier 2025",
            readTime: "7 min de lecture",
            tags: ["Pomodoro", "Concentration", "Gestion du temps"]
        },
        {
            id: 5,
            title: "Développer son intelligence émotionnelle : le guide pratique",
            excerpt: "L'intelligence émotionnelle est désormais reconnue comme une compétence essentielle. Voici des exercices concrets pour la développer au quotidien.",
            coverImage: { original: "/assets/images/services-bg.jpg" },
            category: "Développement personnel",
            author: {
                name: "Sophie Moreau",
                avatar: "/assets/images/authors/sophie.jpg"
            },
            publishedAt: "12 janvier 2025",
            readTime: "9 min de lecture",
            tags: ["Intelligence émotionnelle", "Empathie", "Communication"]
        },
        {
            id: 6,
            title: "Comment construire une routine matinale qui booste votre journée",
            excerpt: "Les premières heures de la journée déterminent souvent son déroulement. Découvrez comment créer une routine matinale énergisante et productive.",
            coverImage: { original: "/assets/images/services-bg.jpg" },
            category: "Productivité",
            author: {
                name: "Jean Bernard",
                avatar: "/assets/images/avatar.jpg"
            },
            publishedAt: "5 janvier 2025",
            readTime: "7 min de lecture",
            tags: ["Routine matinale", "Habitudes", "Énergie"]
        },
        {
            id: 7,
            title: "Le pouvoir transformateur du journal personnel : guide de démarrage",
            excerpt: "Tenir un journal est une pratique ancestrale aux multiples bienfaits. Découvrez comment commencer efficacement et transformer cette habitude en outil puissant.",
            coverImage: { original: "/assets/images/services-bg.jpg" },
            category: "Développement personnel",
            author: {
                name: "Marie Laurent",
                avatar: "/assets/images/authors/marie.jpg"
            },
            publishedAt: "28 décembre 2024",
            readTime: "6 min de lecture",
            tags: ["Journal personnel", "Réflexion", "Clarté mentale"]
        }
    ];

    // Filtrage des articles
    const filteredPosts = allPosts.filter(post => {
        // Filtre par recherche
        const matchesSearch = searchTerm === '' ||
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtre par catégorie
        const matchesCategory = !selectedCategory || post.category === selectedCategory;

        // Filtre par tag
        const matchesTag = !selectedTag || post.tags.includes(selectedTag);

        return matchesSearch && matchesCategory && matchesTag;
    });


    // Gestion des filtres
    const handleCategorySelect = (categoryName: any) => {
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    };

    const handleTagSelect = (tagName: any) => {
        setSelectedTag(selectedTag === tagName ? null : tagName);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory(null);
        setSelectedTag(null);
    };

    return (
        <>
        <Head title='Blogs' />
            <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-32 pb-20 overflow-hidden">
                {/* Hero Section */}
                <section ref={heroRef} className="relative pb-16">
                    {/* Background with parallax */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10"
                        style={{
                            backgroundImage: "url('/assets/images/pattern-bg.jpg')",
                            y: backgroundY
                        }}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-4">
                                    Notre Blog
                                </span>
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Explorez nos <span className="text-red-600">idées</span> et <span className="text-red-600">inspirations</span>
                            </motion.h1>

                            <motion.p
                                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Des articles pour nourrir votre réflexion, stimuler votre croissance personnelle et vous inspirer au quotidien.
                            </motion.p>

                            {/* Search bar */}
                            <motion.div
                                className="max-w-xl mx-auto relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un article..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-5 py-3 pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="md:hidden mt-3">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Filters desktop */}
                        <motion.div
                            className="hidden md:block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {selectedCategory || selectedTag ? (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors duration-200"
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        Effacer les filtres
                                    </button>
                                ) : null}

                                {allCategories.slice(0, 5).map((category: any) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategorySelect(category.name)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedCategory === category.name
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {category.icon} {category.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {allTags.slice(0, 9).map((tag: any) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagSelect(tag)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedTag === tag
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                                            : 'bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400'
                                            }`}
                                    >
                                        # {tag}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Filters mobile */}
                        {showFilters && (
                            <motion.div
                                className="md:hidden mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Catégories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allCategories.map((category: any) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategorySelect(category.name)}
                                                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedCategory === category.name
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {category.icon} {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tags populaires</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map((tag: any) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagSelect(tag)}
                                                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedTag === tag
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                                                    : 'bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400'
                                                    }`}
                                            >
                                                # {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(selectedCategory || selectedTag) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors duration-200"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Effacer tous les filtres
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Featured Post Section */}
                <section ref={featuredRef} className="py-12 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="rounded-2xl overflow-hidden relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.7 }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/30 z-10"></div>

                            {/* Background image */}
                            <div className="absolute inset-0">
                                <img
                                    src={featuredPostData?.coverImage?.original ?? "/assets/images/coaching-session.jpg"}
                                    alt={featuredPostData.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-20 py-16 px-6 md:py-24 md:px-12 lg:px-20 xl:px-24 flex flex-col items-start">
                                <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full mb-6">
                                    Article à la une
                                </span>

                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-4xl leading-tight">
                                    {featuredPostData.title}
                                </h2>

                                <p className="text-lg text-white/90 mb-8 max-w-3xl">
                                    {featuredPostData.excerpt}
                                </p>

                                <div className="flex flex-wrap gap-6 items-center mb-8">
                                    <div className="flex items-center">
                                        <img
                                            src={featuredPostData?.author.avatar}
                                            alt={featuredPostData?.author?.name}
                                            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-white/50"
                                        />
                                        <span className="text-white">{featuredPostData?.author?.name}</span>
                                    </div>

                                    <div className="flex items-center text-white/80">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{formatDate(featuredPostData.publishedAt)}</span>
                                    </div>

                                    <div className="flex items-center text-white/80">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{featuredPostData.readTime}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap mb-8">
                                    {featuredPostData.tags.map((tag: any) => (
                                        <span key={tag} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    href={route('blogs.details', featuredPostData.slug)}
                                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
                                >
                                    <span>Lire l'article</span>
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Posts Grid Section */}
                <section ref={postsGridRef} className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 flex justify-between items-end">
                            <div>
                                <motion.h2
                                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isPostsGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    Articles récents
                                </motion.h2>

                                <motion.p
                                    className="text-gray-600 dark:text-gray-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isPostsGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    {filteredPosts.length === 0 ? (
                                        "Aucun article ne correspond à votre recherche"
                                    ) : (
                                        `${filteredPosts.length} article${filteredPosts.length > 1 ? 's' : ''} disponible${filteredPosts.length > 1 ? 's' : ''}`
                                    )}
                                </motion.p>
                            </div>

                            {/* Clear filters button (desktop) */}
                            {(selectedCategory || selectedTag) && (
                                <motion.button
                                    onClick={clearFilters}
                                    className="hidden md:inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isPostsGridInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Effacer les filtres
                                </motion.button>
                            )}
                        </div>

                        {filteredPosts.length === 0 ? (
                            <motion.div
                                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isPostsGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Aucun article ne correspond à vos critères de recherche.</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                                >
                                    <span>Réinitialiser la recherche</span>
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post, index) => (
                                    <motion.article
                                        key={post.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 flex flex-col h-full group"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isPostsGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.6, delay: 0.1 + (index * 0.05) }}
                                    >
                                        {/* Image container with overlay */}
                                        <div className="relative overflow-hidden h-52">
                                            <img
                                                src={post.coverImage.original ?? "/images/placeholder.jpg"}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                            {/* Category badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-red-600 text-sm font-medium rounded-full">
                                                    {post.category}
                                                </span>
                                            </div>

                                            {/* Read time */}
                                            <div className="absolute bottom-4 right-4">
                                                <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-md flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {post.readTime}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-grow flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                <Link href={`/blog/${post.id}`}>
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-3">
                                                {post.excerpt}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {post.tags.slice(0, 3).map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleTagSelect(tag)}
                                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                                                    >
                                                        #{tag}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-auto">
                                                <div className="flex items-center">
                                                    <img
                                                        src={post.author.avatar}
                                                        alt={post.author.name}
                                                        className="w-8 h-8 rounded-full object-cover mr-2"
                                                    />
                                                    <div className="text-sm">
                                                        <span className="text-gray-900 dark:text-white font-medium mr-3">
                                                            {post.author.name}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {formatDate(post.publishedAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/blogs/${post?.slug}`}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {/* {filteredPosts.length > 0 && (
                            <motion.div
                                className="mt-12 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isPostsGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Link
                                    href="/blog/archive"
                                    className="inline-flex items-center px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                                >
                                    <span>Voir plus d'articles</span>
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </Link>
                            </motion.div>
                        )} */}
                    </div>
                </section>

                {/* Categories Section */}
                <section ref={categoriesRef} className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center max-w-3xl mx-auto mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Explorez par thématique
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Découvrez nos articles organisés par domaines d'expertise et centres d'intérêt
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {allCategories.map((category: any, index: number) => (
                                <motion.div
                                    key={category.id}
                                    className="relative group"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl border border-gray-100 dark:border-gray-700/30">
                                        <Link href={`/blog/categorie/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                            <div className="h-full flex flex-col">
                                                {/* Top gradient */}
                                                <div className={`h-2 w-full bg-gradient-to-r ${category.color}`}></div>

                                                <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 bg-gray-100 dark:bg-gray-700">
                                                        {category.icon}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                        {category.name}
                                                    </h3>

                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                        {category.posts_count} article{category.posts_count > 1 ? 's' : ''}
                                                    </p>

                                                    <span className="mt-auto text-red-600 font-medium flex items-center group-hover:underline">
                                                        Découvrir
                                                        <ChevronRight className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section ref={newsletterRef} className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl overflow-hidden relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isNewsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.7 }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 py-12 px-6 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                        Restez inspiré et motivé
                                    </h2>

                                    <p className="text-lg text-white/90 mb-8">
                                        Abonnez-vous à notre newsletter pour recevoir des idées, des conseils et des stratégies exclusifs directement dans votre boîte mail. Pas de spam, juste du contenu de qualité.
                                    </p>

                                    <div className="flex items-start space-x-4 mb-8">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-1">Inspiration hebdomadaire</h3>
                                            <p className="text-white/80">Un conseil pratique chaque semaine pour stimuler votre développement</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 mb-8">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-1">Contenu exclusif</h3>
                                            <p className="text-white/80">Accédez en avant-première à nos ressources et ateliers</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-1">Communauté privilégiée</h3>
                                            <p className="text-white/80">Rejoignez une communauté de personnes partageant les mêmes valeurs</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Inscrivez-vous gratuitement
                                    </h3>

                                    <form className="space-y-4">

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Votre email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="jean@exemple.com"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="consent"
                                                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="consent" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                                                J'accepte de recevoir des emails et je confirme avoir lu la politique de confidentialité
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
                                        >
                                            <span>S'abonner à la newsletter</span>
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </button>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                                            Vous pouvez vous désabonner à tout moment. Nous respectons votre vie privée.
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

            </main>
        </FrontLayout>
        </>
    );
};

export default BlogPage;
