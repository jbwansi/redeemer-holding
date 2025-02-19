import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle,
    Calendar,
    MessageSquare,
    User
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';

const ContactPage = () => {
    // Refs pour les animations
    const formRef = useRef<HTMLFormElement|any>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const isFormInView = useInView(formRef, { once: false, amount: 0.3 });
    const isInfoInView = useInView(infoRef, { once: false, amount: 0.3 });

    // États pour la gestion du formulaire
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    // Informations de contact
    const contactInfo = [
        {
            icon: <Mail size={20} />,
            title: 'Email',
            value: 'contact@redeemer-holding.com',
            description: 'Réponse sous 24h ouvrées',
            href: 'mailto:contact@redeemer-holding.com'
        },
        {
            icon: <Phone size={20} />,
            title: 'Téléphone',
            value: '+33 1 23 45 67 89',
            description: 'Lun-Ven, 9h-18h',
            href: 'tel:+33123456789'
        },
        {
            icon: <MapPin size={20} />,
            title: 'Adresse',
            value: '75 Avenue des Champs-Élysées',
            description: '75008 Paris, France',
            href: 'https://maps.google.com/?q=75+Avenue+des+Champs-Élysées,+75008+Paris,+France'
        }
    ];

    // Options pour le sélecteur de sujet
    const subjectOptions = [
        { value: 'coaching', label: 'Coaching individuel' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'formation', label: 'Formation en groupe' },
        { value: 'partenariat', label: 'Partenariat' },
        { value: 'autre', label: 'Autre demande' }
    ];

    // Gérer les changements dans le formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Soumettre le formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        // Simuler un envoi d'API
        setTimeout(() => {
            // Simulation de succès (dans un cas réel, remplacer par un appel API)
            setFormStatus('success');

            // Réinitialiser le formulaire après 3 secondes
            setTimeout(() => {
                setFormStatus('idle');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            }, 3000);
        }, 1500);
    };

    return (
        <FrontLayout>
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-32 pb-20">
            {/* Éléments décoratifs */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
            <div className="absolute top-40 left-10 w-80 h-80 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                {/* En-tête de page */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                            Contact
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Discutons de votre <span className="text-[#DA2E29]">transformation</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Je suis là pour répondre à vos questions et vous accompagner dans votre parcours de développement personnel et professionnel.
                    </motion.p>
                </div>

                {/* Section principale */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
                    {/* Informations de contact et Calendly */}
                    <motion.div
                        ref={infoRef}
                        className="lg:col-span-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInfoInView ? "visible" : "hidden"}
                    >
                        <div className="bg-white dark:bg-gray-800/50 shadow-xl backdrop-blur-sm rounded-2xl p-8 border border-gray-100 dark:border-gray-700/30 mb-8">
                            {/* Titre de la section info */}
                            <motion.h2
                                variants={itemVariants}
                                className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                            >
                                Informations de contact
                            </motion.h2>

                            <div className="space-y-6">
                                {contactInfo.map((info, index) => (
                                    <motion.a
                                        key={index}
                                        href={info.href}
                                        target={info.title === 'Adresse' ? '_blank' : undefined}
                                        rel={info.title === 'Adresse' ? 'noopener noreferrer' : undefined}
                                        className="flex items-start p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-300"
                                        variants={itemVariants}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center text-[#DA2E29] mr-4">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {info.title}
                                            </h3>
                                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                                                {info.value}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {info.description}
                                            </p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Section Calendly */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800/50 shadow-xl backdrop-blur-sm rounded-2xl p-8 border border-gray-100 dark:border-gray-700/30"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center text-[#DA2E29] mr-4">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Prendre rendez-vous
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Consultation gratuite de 30 minutes
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Réservez directement un créneau dans mon agenda pour discuter de vos besoins et objectifs.
                            </p>

                            <a
                                href="https://calendly.com/votre-lien"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium text-center transition-colors duration-300 shadow-md shadow-[#DA2E29]/20"
                            >
                                Réserver un appel
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Formulaire de contact */}
                    <motion.div
                        ref={formRef}
                        className="lg:col-span-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isFormInView ? "visible" : "hidden"}
                    >
                        <div className="bg-white dark:bg-gray-800/50 shadow-xl backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700/30 relative overflow-hidden">
                            {/* Effet décoratif d'accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DA2E29] to-rose-600"></div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                            >
                                Envoyez-moi un message
                            </motion.h2>

                            <motion.p
                                variants={itemVariants}
                                className="text-gray-600 dark:text-gray-300 mb-8"
                            >
                                Complétez le formulaire ci-dessous et je vous répondrai dans les plus brefs délais.
                            </motion.p>

                            {formStatus === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Message envoyé avec succès!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Merci pour votre message. Je vous répondrai dans les plus brefs délais.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    variants={containerVariants}
                                >
                                    {/* Rangée Nom */}
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nom complet
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50 text-gray-800 dark:text-gray-200"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Rangée Email */}
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Adresse email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50 text-gray-800 dark:text-gray-200"
                                                placeholder="votre.email@exemple.com"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Sujet */}
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sujet
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                <MessageSquare size={18} />
                                            </div>
                                            <select
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50 text-gray-800 dark:text-gray-200 appearance-none"
                                            >
                                                <option value="" disabled>Sélectionnez un sujet</option>
                                                {subjectOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Message */}
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50 text-gray-800 dark:text-gray-200"
                                            placeholder="Détaillez votre demande ici..."
                                        />
                                    </motion.div>

                                    {/* Bouton d'envoi */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="pt-2"
                                    >
                                        <button
                                            type="submit"
                                            disabled={formStatus === 'submitting'}
                                            className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-medium text-lg transition-all duration-300 ${formStatus === 'submitting'
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-[#DA2E29] to-rose-600 hover:shadow-lg hover:shadow-[#DA2E29]/20'
                                                }`}
                                        >
                                            {formStatus === 'submitting' ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} className="mr-2" />
                                                    Envoyer le message
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                            En soumettant ce formulaire, vous acceptez notre <a href="/politique-confidentialite" className="underline hover:text-[#DA2E29]">politique de confidentialité</a>.
                                        </p>
                                    </motion.div>
                                </motion.form>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Carte Google Maps */}
                <motion.div
                    className="mt-16 rounded-2xl overflow-hidden shadow-xl h-[400px] border border-gray-200 dark:border-gray-700/30"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <iframe
                        title="Localisation du bureau"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.142047744348!2d2.3036619999999997!3d48.8697641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc49f715555%3A0x8e97cbcb15d8b7c!2sAv.%20des%20Champs-%C3%89lys%C3%A9es%2C%20Paris%2C%20France!5e0!3m2!1sfr!2sfr!4v1644932222221!5m2!1sfr!2sfr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                    />
                </motion.div>

                {/* FAQ courtes */}
                <motion.div
                    className="mt-20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Questions fréquentes
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                question: "Comment se déroule une séance de coaching?",
                                answer: "Les séances se déroulent en visioconférence ou en présentiel selon votre préférence. Nous commençons par définir vos objectifs, puis élaborons un plan d'action personnalisé."
                            },
                            {
                                question: "Combien de séances sont nécessaires?",
                                answer: "Le nombre de séances varie selon vos objectifs. Généralement, un programme complet comprend 8 à 12 séances, mais nous adaptons toujours à vos besoins spécifiques."
                            },
                            {
                                question: "Proposez-vous des tarifs dégressifs?",
                                answer: "Oui, des forfaits dégressifs sont disponibles pour les engagements sur plusieurs séances. N'hésitez pas à me contacter pour obtenir un devis personnalisé."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-gray-800/30 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700/30"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <a
                            href="/faq"
                            className="inline-flex items-center text-[#DA2E29] hover:text-rose-700 font-medium transition-colors duration-200"
                        >
                            Voir toutes les questions fréquentes
                            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </div>
        </main>
        </FrontLayout>
    );
};

export default ContactPage;
