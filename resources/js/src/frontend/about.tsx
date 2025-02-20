import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, Award, BookOpen, Users, TrendingUp, Quote } from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';

const AboutPage = () => {
    // Références pour les animations basées sur le scroll
    const containerRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const journeyRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    // Détection de visibilité pour les animations
    const isStoryInView = useInView(storyRef, { once: false, amount: 0.3 });
    const isValuesInView = useInView(valuesRef, { once: false, amount: 0.3 });
    const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 });
    const isJourneyInView = useInView(journeyRef, { once: false, amount: 0.3 });
    const isTestimonialsInView = useInView(testimonialsRef, { once: false, amount: 0.3 });

    // Animation parallax pour certains éléments
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    // Valeurs de l'entreprise/coach
    const values = [
        {
            icon: <TrendingUp size={24} />,
            title: "Excellence",
            description: "Je m'engage à offrir un accompagnement de la plus haute qualité, en me tenant constamment informé des dernières avancées en matière de développement personnel."
        },
        {
            icon: <Users size={24} />,
            title: "Authenticité",
            description: "Chaque relation est basée sur l'honnêteté et la transparence. Je crois en l'importance de créer un espace où vous pouvez être entièrement vous-même."
        },
        {
            icon: <Award size={24} />,
            title: "Engagement",
            description: "Je suis pleinement investi dans votre réussite et votre croissance. Votre transformation est ma priorité absolue."
        }
    ];

    // Statistiques impressionnantes
    const stats = [
        { value: "150+", label: "Heures de coaching" },
        { value: "30+", label: "Clients accompagnés" },
        { value: "98%", label: "Taux de satisfaction" },
        { value: "25+", label: "Recommandations" }
    ];

    // Étapes clés du parcours professionnel
    const journeySteps = [
        {
            year: "2010",
            title: "Formation initiale",
            description: "Diplômé en psychologie positive et certifié en coaching professionnel par l'International Coaching Federation."
        },
        {
            year: "2012",
            title: "Premiers succès",
            description: "Développement d'une méthode unique combinant productivité et épanouissement personnel, avec mes premiers clients internationaux."
        },
        {
            year: "2015",
            title: "Expansion",
            description: "Publication de mon premier livre « Transformer sa vie en 3 étapes » et lancement de programmes de coaching en ligne."
        },
        {
            year: "2018",
            title: "Reconnaissance",
            description: "Intervenant régulier dans des conférences internationales et mentor pour d'autres coachs professionnels."
        },
        {
            year: "2022",
            title: "Nouvelle vision",
            description: "Création de Redeemer Holding et développement d'une approche holistique intégrant les dernières avancées en neurosciences."
        }
    ];

    // Témoignages clients
    const testimonials = [
        {
            content: "J'ai découvert non seulement comment être plus productif, mais aussi comment vivre une vie plus équilibrée et épanouissante. Cette approche a vraiment fait la différence.",
            author: "Marie Dupont",
            position: "Entrepreneure",
            image: "https://media.istockphoto.com/id/507457774/photo/beautiful-young-woman.jpg?s=170667a&w=0&k=20&c=wQlHiq9OTQ2fwko1T8xw7g99sByp1I3gwVTvlkOxypQ="
        },
        {
            content: "Les méthodes enseignées sont non seulement efficaces, mais adaptées à chaque personne. J'ai pu atteindre mes objectifs tout en restant fidèle à mes valeurs.",
            author: "Thomas Laurent",
            position: "Directeur Marketing",
            image: "https://img.freepik.com/free-photo/expressive-bearded-man-wearing-shirt_273609-5894.jpg"
        },
        {
            content: "Ce coaching a transformé ma façon d'aborder les défis. J'ai gagné en confiance et en clarté, ce qui a eu un impact positif sur tous les aspects de ma vie.",
            author: "Sofia Martinez",
            position: "Médecin",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsJTIwZGUlMjBmZW1tZXxlbnwwfHwwfHx8MA%3D%3D"
        }
    ];

    // Certifications et accréditations
    const certifications = [
        "International Coaching Federation (ICF)",
        "European Mentoring & Coaching Council (EMCC)",
        "Association for Coaching (AC)",
        "International Association of Coaching (IAC)"
    ];

    return (
        <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-32 pb-20 overflow-hidden">
                {/* Hero section */}
                <section className="relative">
                    {/* Background effect */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
                        style={{
                            backgroundImage: "url('/assets/images/pattern-bg.jpg')",
                            y: backgroundY
                        }}
                    />

                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                                    À propos
                                </span>
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Transformer des <span className="text-[#DA2E29]">vies</span>, une personne à la fois
                            </motion.h1>

                            <motion.p
                                className="text-lg md:text-xl text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Découvrez mon parcours, ma philosophie et les valeurs qui guident ma mission d'aider les autres à révéler leur plein potentiel.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Mon histoire */}
                <section ref={storyRef} className="py-16 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Image */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: -50 }}
                                animate={isStoryInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{ scale: imageScale }}
                            >
                                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="/assets/images/portrait.jpg"
                                        alt="Coach professionnel dans son bureau"
                                        className="w-full h-[700px] object-cover"
                                    />
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#DA2E29]/10 rounded-full blur-xl z-0"></div>
                                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-full blur-lg z-0"></div>

                                {/* Experience badge */}
                                <motion.div
                                    className="absolute -bottom-8 -right-4 bg-white dark:bg-gray-800 shadow-xl rounded-lg px-4 py-3 z-20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isStoryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DA2E29]/10 flex items-center justify-center text-[#DA2E29]">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-white">10+</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Années d'expertise</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={isStoryInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                    Mon histoire
                                </h2>

                                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                    <p>
                                        Je m’appelle Jean-Bernard Wansi. Je suis Ingénieur de formation, avec plusieurs années d’expériences dans le développement des logiciels. En cours de mon développement personnel, j’ai découvert ma nouvelle passion qui était d’accompagner les personnes à découvrir aussi leur passion et de les mettre en valeur.
                                    </p>
                                    <p>
                                        Raison pour laquelle je suis me formé comme coach, formateur et conférencier certifié à la John Maxwell Team Francais depuis 2020 en vu d’offrir du coaching, de la formation et du conseil à toutes ses personnes qui veulent voir leur vie progresser.
                                    </p>
                                    <p>
                                        Dans ce même cadre, j’aide des individus à développer la confiance en eux afin de passer à l’action.
                                    </p>
                                    <p>
                                        Aujourd'hui, ma mission est d'aider chaque personne à découvrir son potentiel inexploité et à créer une vie qui correspond véritablement à ses aspirations les plus profondes.
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center">
                                    <img
                                        src="/assets/images/signature.png"
                                        alt="Signature"
                                        className="h-16 mr-4"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Jean-Bernard Wansi</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Fondateur & Coach principal
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Mes valeurs */}
                <section ref={valuesRef} className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isValuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                                    Nos valeurs
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Les principes qui guident notre approche
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Ces valeurs fondamentales sont au cœur de chaque interaction et de chaque programme que nous proposons.
                                </p>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700/30"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isValuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-[#DA2E29]/10 flex items-center justify-center text-[#DA2E29] mb-6">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Statistiques impressionnantes */}
                <section ref={statsRef} className="py-16 md:py-24 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#DA2E29]/10 to-transparent"></div>
                        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Notre impact en chiffres
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Des résultats concrets qui témoignent de l'efficacité de notre approche
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={isStatsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#DA2E29] mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mon parcours */}
                <section ref={journeyRef} className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isJourneyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                                    Parcours
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Les étapes clés de mon évolution
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Un chemin d'apprentissage continu et de perfectionnement
                                </p>
                            </motion.div>
                        </div>

                        <div className="relative">
                            {/* Vertical line for timeline */}
                            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

                            <div className="space-y-12 relative">
                                {journeySteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        className={`flex flex-col md:flex-row items-center md:items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                            }`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isJourneyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                    >
                                        {/* Year bubble */}
                                        <div className="flex-none md:w-1/2 flex md:justify-end">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full bg-[#DA2E29] text-white flex items-center justify-center font-bold text-lg z-10">
                                                    {step.year}
                                                </div>
                                                <div className="absolute -inset-2 bg-[#DA2E29]/20 rounded-full blur-md z-0"></div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-none md:w-1/2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/30">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Témoignages */}
                <section ref={testimonialsRef} className="py-16 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                                    Témoignages
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Ce que disent mes clients
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Des histoires de transformation qui témoignent de l'efficacité de ma méthode
                                </p>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700/30 relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                >
                                    <div className="absolute -top-5 left-8 text-[#DA2E29]">
                                        <Quote size={40} />
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-gray-600 dark:text-gray-300 italic mb-6">
                                            "{testimonial.content}"
                                        </p>

                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 mr-4">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.author}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {testimonial.author}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {testimonial.position}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <motion.div
                            className="bg-gradient-to-r from-[#DA2E29] to-rose-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Prêt à transformer votre vie?
                                </h2>
                                <p className="text-white/90 text-lg mb-8 md:mb-10">
                                    Découvrez comment je peux vous aider à atteindre vos objectifs et à vivre la vie que vous méritez.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="/contact"
                                        className="px-8 py-3 bg-white text-[#DA2E29] rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center"
                                    >
                                        Prendre contact
                                    </a>
                                    <a
                                        href="/services"
                                        className="px-8 py-3 bg-transparent border-2 border-white/80 text-white rounded-lg font-medium text-lg hover:bg-white/10 transition-colors duration-300 inline-flex items-center justify-center"
                                    >
                                        Découvrir mes services
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
};

export default AboutPage;
