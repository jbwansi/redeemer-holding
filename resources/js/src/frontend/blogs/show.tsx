import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    Calendar,
    User,
    Clock,
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Mail,
    Link as LinkIcon,
    MessageCircle,
    Heart,
    Bookmark,
    ArrowLeft,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { SinglePostResponse } from '@/types/post';

interface Props {
    post: SinglePostResponse;
    relatedPosts: any;
}
const BlogPostDetail = ({ post, relatedPosts }: Props) => {
    // États
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(42);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [activeHeading, setActiveHeading] = useState('');

    // Références pour animations et intersection observer
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const commentsRef = useRef(null);
    const relatedRef = useRef(null);
    const tocRef = useRef(null);
    const shareRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isContentInView = useInView(contentRef, { once: false, amount: 0.1 });
    const isCommentsInView = useInView(commentsRef, { once: false, amount: 0.3 });
    const isRelatedInView = useInView(relatedRef, { once: false, amount: 0.3 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const contentScrollProgress = useScroll({
        target: contentRef,
        offset: ["start start", "end end"]
    });

    // Données d'exemple pour l'article (à remplacer par les props)
    const postData = post?.data || {
        id: 1,
        title: "7 habitudes qui transformeront votre quotidien en 30 jours",
        excerpt: "Découvrez les techniques scientifiquement prouvées pour créer des habitudes durables et transformer votre vie progressivement et sans effort.",
        coverImage: "/assets/images/coaching-session.jpg",
        category: "Développement personnel",
        publishedAt: "2025-02-12T08:00:00.000Z",
        readingTime: "8 min de lecture",
        authorName: "Jean Bernard",
        authorAvatar: "/assets/images/avatar.jpg",
        authorBio: "Coach certifié en développement personnel avec plus de 15 ans d'expérience. Passionné par les neurosciences et la psychologie positive.",
        authorRole: "Coach & Fondateur",
        viewCount: 2547,
        commentCount: 18,
        shareCount: 94,
        tags: ["Habitudes", "Productivité", "Transformation", "Neurosciences", "Psychologie positive"],
        content: "iohoih",

    };

    // Données d'exemple pour les articles liés (à remplacer par les props)
    const relatedPostsData = relatedPosts || [
        {
            id: 8,
            title: "Comment établir une routine matinale qui transforme votre journée",
            excerpt: "Découvrez comment les premières heures de votre journée peuvent déterminer votre productivité et votre bien-être mental.",
            coverImage: "/assets/images/blog/related-1.jpg",
            category: "Productivité",
            author: {
                name: "Jean Bernard",
                avatar: "/assets/images/avatar.jpg"
            },
            publishedAt: "2025-01-28T10:00:00.000Z",
            readTime: "6 min de lecture"
        },
        {
            id: 9,
            title: "Les fondements scientifiques de la visualisation pour atteindre vos objectifs",
            excerpt: "Explorer les mécanismes neurobiologiques qui expliquent pourquoi la visualisation fonctionne réellement.",
            coverImage: "/assets/images/blog/related-2.jpg",
            category: "Neurosciences",
            author: {
                name: "Dr. Claire Martin",
                avatar: "/assets/images/authors/claire.jpg"
            },
            publishedAt: "2025-01-15T08:30:00.000Z",
            readTime: "9 min de lecture"
        },
        {
            id: 10,
            title: "Journal de gratitude : la méthode complète pour transformer votre perspective",
            excerpt: "Un guide étape par étape pour créer et maintenir un journal de gratitude efficace qui change votre perception du quotidien.",
            coverImage: "/assets/images/blog/related-3.jpg",
            category: "Développement personnel",
            author: {
                name: "Sophie Moreau",
                avatar: "/assets/images/authors/sophie.jpg"
            },
            publishedAt: "2025-02-05T09:15:00.000Z",
            readTime: "7 min de lecture"
        }
    ];

    // Format des dates
    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatRelativeDate = (dateString: any) => {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: fr
        });
    };

    // Gestion de l'observation des en-têtes pour la table des matières
    useEffect(() => {
        const headings = document.querySelectorAll('h2[id], h3[id]');

        const observerOptions = {
            rootMargin: '-100px 0px -80% 0px',
            threshold: 0
        };

        const headingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveHeading(entry.target.getAttribute('id') || '');
                }
            });
        }, observerOptions);

        headings.forEach(heading => {
            headingObserver.observe(heading);
        });

        return () => {
            headingObserver.disconnect();
        };
    }, []);

    // Gestion des interactions
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = () => {
        setShowShareOptions(!showShareOptions);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };


    return (
        <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-28 pb-20 overflow-hidden">
                {/* Hero Section */}
                <section ref={heroRef} className="relative pb-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Back link */}
                        <div className="mb-8">
                            <Link
                                href={route('blogs')}
                                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                            >
                                <ChevronLeft className="mr-1 w-5 h-5" />
                                <span>Retour au blog</span>
                            </Link>
                        </div>

                        {/* Article header */}
                        <motion.div
                            className="text-center mx-auto mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-block mb-4">
                                <Link
                                    href={`/blog/categorie/${postData.category.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors duration-200"
                                >
                                    {postData.category}
                                </Link>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                {postData.title}
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                                {postData.excerpt}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(postData.publishedAt)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{postData?.readTime}</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span>{postData.views} lectures</span>
                                </div>
                            </div>

                            {/* Author info */}
                            <div className="flex items-center justify-center">
                                <img
                                    src={postData?.author.avatar}
                                    alt={postData?.author.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-red-100 dark:border-red-900/30"
                                />
                                <div className="ml-4 text-left">
                                    <div className="text-gray-900 dark:text-white font-medium">
                                        {postData.author.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {postData.author?.name}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Featured image */}
                    <motion.div
                        className="relative w-full"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src={postData.coverImage.original}
                                    alt={postData.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Main Content Section */}
                <section className="py-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-10">

                            {/* Main content */}
                            <motion.div
                                ref={contentRef}
                                className="lg:flex-grow order-1 lg:order-2"
                                initial={{ opacity: 0 }}
                                animate={isContentInView ? { opacity: 1 } : { opacity: 0 }}
                                transition={{ duration: 0.7 }}
                            >
                                {/* Article actions - Desktop */}
                                <div className="hidden lg:flex justify-end mb-8">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center space-x-1 ${isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                                } hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200`}
                                        >
                                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} />
                                            <span>{likeCount}</span>
                                        </button>
                                        <button
                                            onClick={handleBookmark}
                                            className={`p-2 rounded-full ${isBookmarked
                                                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                                : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                                                } hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200`}
                                        >
                                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : 'fill-none'}`} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Article content */}
                                <article className="prose prose-lg dark:prose-invert prose-red max-w-none mb-10">
                                    <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                                </article>

                                {/* Tags */}
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {postData.tags.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Author box */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-10">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={postData?.author.avatar}
                                                alt={postData?.author.name}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                {postData?.author.name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                {postData.excerpt}
                                            </p>
                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/auteurs/${postData.author.name}`}
                                                    className="text-red-600 dark:text-red-400 font-medium hover:underline"
                                                >
                                                    Voir tous ses articles
                                                </Link>
                                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                                <Link
                                                    href="/contact"
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    Contacter
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Article actions - Mobile */}
                                <div className="flex lg:hidden justify-between items-center bg-white dark:bg-gray-800 sticky bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg z-10">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center ${isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : 'fill-none'}`} />
                                        <span className="ml-1">{likeCount}</span>
                                    </button>
                                    <button
                                        onClick={() => {

                                        }}
                                        className="flex items-center text-gray-500 dark:text-gray-400"
                                    >
                                        <MessageCircle className="w-6 h-6" />
                                        <span className="ml-1">{10}</span>
                                    </button>
                                    <button
                                        onClick={handleBookmark}
                                        className={`${isBookmarked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : 'fill-none'}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="text-gray-500 dark:text-gray-400"
                                    >
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>


                {/* Related Articles Section */}
                <section ref={relatedRef} className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Articles similaires
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Continuez votre lecture avec ces articles en relation
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPostsData.map((post: any, index: any) => (
                                <motion.article
                                    key={post.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 flex flex-col h-full group"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                                >
                                    {/* Image container with overlay */}
                                    <div className="relative overflow-hidden h-48">
                                        <img
                                            src={post.coverImage}
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            <Link href={`/blog/${post.id}`}>
                                                {post.title}
                                            </Link>
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-auto">
                                            <div className="flex items-center">
                                                <img
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    className="w-8 h-8 rounded-full object-cover mr-2"
                                                />
                                                <div className="text-sm">
                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                        {post.author.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/blog/${post.id}`}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

            </main>
        </FrontLayout>
    )
};


export default BlogPostDetail
