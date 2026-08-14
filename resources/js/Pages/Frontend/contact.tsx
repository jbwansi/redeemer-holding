import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Calendar,
  MessageSquare,
  User,
  ArrowRight,
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { fetchSettings } from '@/api/settings';
import { Head, Link, router } from '@inertiajs/react';
import FaqAccordion from '@/components/frontend/faq/faq-accordion';

const defaultContactMeta = {
  badge: 'Contact',
  hero_title: 'Discutons de votre transformation',
  hero_highlight: 'transformation',
  hero_subtitle:
    'Je suis là pour répondre à vos questions et vous accompagner dans votre parcours de développement personnel et professionnel.',
  form_title: 'Envoyez-moi un message',
  form_subtitle:
    'Complétez le formulaire ci-dessous et je vous répondrai dans les plus brefs délais.',
  form_sla_title: 'Réponse garantie',
  form_sla_text: 'Je réponds à chaque demande qualifiée sous 24h ouvrées.',
  honeypot_enabled: true,
  privacy_text: 'En soumettant ce formulaire, vous acceptez notre politique de confidentialité.',
  privacy_url: '/politique-de-confidentialite',
  calendly_title: 'Prendre rendez-vous',
  calendly_subtitle: 'Consultation gratuite de 30 minutes',
  calendly_description:
    'Réservez directement un créneau dans mon agenda pour discuter de vos besoins et objectifs.',
  calendly_button: 'Réserver un appel',
  calendly_social_proof: 'Plus de 300 accompagnements réalisés.',
  email_description: 'Réponse sous 24h ouvrées',
  phone_description: 'Lun-Ven, 9h-18h',
  address_description: 'Suisse',
  map_embed_url:
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d43692.81579896015!2d7.175105!3d46.808226!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478e691661b56407%3A0xb72fd47cc9f3dc72!2sAv.%20Jean-Marie-Musy%205%2C%201700%20Fribourg%2C%20Suisse!5e0!3m2!1sfr!2sus!4v1740007896823!5m2!1sfr!2sus',
  subjects: [
    { value: 'coaching', label: 'Coaching individuel' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'formation', label: 'Formation en groupe' },
    { value: 'partenariat', label: 'Partenariat' },
    { value: 'autre', label: 'Autre demande' },
  ],
  faqs: [
    {
      question: 'Comment se déroule une séance de coaching ?',
      answer:
        "Les séances se déroulent en visioconférence ou en présentiel selon votre préférence. Nous commençons par définir vos objectifs, puis élaborons un plan d'action personnalisé.",
    },
    {
      question: 'Combien de séances sont nécessaires ?',
      answer:
        'Le nombre de séances varie selon vos objectifs. Généralement, un programme complet comprend 8 à 12 séances, mais nous adaptons toujours à vos besoins spécifiques.',
    },
    {
      question: 'Proposez-vous des tarifs dégressifs ?',
      answer:
        "Oui, des forfaits dégressifs sont disponibles pour les engagements sur plusieurs séances. N'hésitez pas à me contacter pour obtenir un devis personnalisé.",
    },
  ],
  faq_title: 'Questions fréquentes',
  faq_link_label: 'Voir toutes les questions fréquentes',
  faq_link_url: '/faq',
};

const ContactPage = ({ page }: any) => {
  const [settings, setSettings] = useState<any>();
  const meta = { ...defaultContactMeta, ...(page?.meta ?? {}) };

  const formRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const isFormInView = useInView(formRef, { once: false, amount: 0.3 });
  const isInfoInView = useInView(infoRef, { once: false, amount: 0.3 });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  });

  useEffect(() => {
    fetchSettings().then((res) => setSettings(res));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const contactInfo = [
    {
      icon: <Mail size={20} />,
      title: 'Email',
      value: settings?.contact_email || 'Non renseigne',
      description: meta.email_description,
      href: settings?.contact_email ? `mailto:${settings.contact_email}` : undefined,
    },
    {
      icon: <Phone size={20} />,
      title: 'Telephone',
      value: settings?.company_phone || 'Non renseigne',
      description: meta.phone_description,
      href: settings?.company_phone ? `tel:${settings.company_phone}` : undefined,
    },
    {
      icon: <MapPin size={20} />,
      title: 'Adresse',
      value: settings?.company_address || 'Non renseignee',
      description: meta.address_description,
      href: settings?.company_address
        ? `https://maps.google.com/?q=${encodeURIComponent(settings.company_address)}`
        : undefined,
    },
  ];

  const subjectOptions = Array.isArray(meta.subjects) ? meta.subjects : defaultContactMeta.subjects;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const message = validateField(name, value);
    setFormErrors((prev) => {
      if (!message) {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [name]: message };
    });
  };

  const validateField = (field: string, value: string): string => {
    const trimmed = value.trim();

    if (['name', 'email', 'subject', 'message'].includes(field) && !trimmed) {
      return 'Ce champ est obligatoire.';
    }

    if (field === 'email' && trimmed && !/\S+@\S+\.\S+/.test(trimmed)) {
      return 'Veuillez saisir une adresse email valide.';
    }

    if (field === 'message' && trimmed && trimmed.length < 20) {
      return 'Ajoutez au moins 20 caractères pour préciser votre besoin.';
    }

    return '';
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    (['name', 'email', 'subject', 'message'] as const).forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });
    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setFormStatus('submitting');

    router.post('/contact', formData, {
      onSuccess: () => {
        setFormStatus('success');
        setTimeout(() => {
          setFormStatus('idle');
          setFormErrors({});
          setFormData({ name: '', email: '', subject: '', message: '', website: '' });
        }, 3000);
      },
      onError: () => setFormStatus('error'),
    });
  };

  const renderHeroTitle = () => {
    if (!meta.hero_highlight || !meta.hero_title.includes(meta.hero_highlight)) {
      return meta.hero_title;
    }
    return meta.hero_title
      .split(meta.hero_highlight)
      .map((part: string, idx: number, arr: string[]) => (
        <React.Fragment key={idx}>
          {part}
          {idx < arr.length - 1 && <span className="text-[#DA2E29]">{meta.hero_highlight}</span>}
        </React.Fragment>
      ));
  };

  const faqs = Array.isArray(meta.faqs) ? meta.faqs : [];

  return (
    <FrontLayout>
      <Head title="Contact" />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-32 pb-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
        <div className="absolute top-40 left-10 w-80 h-80 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            id="contact-hero"
            data-progress-label="Intro"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                {meta.badge}
              </span>
            </motion.div>

            <motion.h1
              className="ux-page-title mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {renderHeroTitle()}
            </motion.h1>

            <motion.p
              className="ux-page-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {meta.hero_subtitle}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16" id="contact-form" data-progress-label="Formulaire">
            <motion.div
              ref={infoRef}
              className="lg:col-span-2"
              variants={containerVariants}
              initial="hidden"
              animate={isInfoInView ? 'visible' : 'hidden'}
            >
              <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#0c1b36] via-[#101f3f] to-[#0b1730] p-5 shadow-2xl shadow-slate-950/35 sm:p-8">
                <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#DA2E29]/20 blur-3xl"></div>
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-slate-50 mb-8"
                >
                  Informations de contact
                </motion.h2>

                <div className="space-y-8">
                  {contactInfo.map((info, index) => (
                    <motion.div key={index} className="group" variants={itemVariants}>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.title === 'Adresse' ? '_blank' : undefined}
                          rel={info.title === 'Adresse' ? 'noopener noreferrer' : undefined}
                          className="flex items-start rounded-2xl p-3 transition-colors duration-300 hover:bg-white/5"
                        >
                          <div className="flex-shrink-0 mt-1 mr-4 h-11 w-11 rounded-full bg-gradient-to-br from-[#DA2E29]/45 to-[#7f1013]/70 text-[#ff5a54] flex items-center justify-center ring-1 ring-[#DA2E29]/35">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="text-[1.55rem] leading-tight font-semibold text-slate-50">
                              {info.title}
                            </h3>
                            <p className="text-2xl font-semibold text-slate-100 mt-1 break-words">
                              {info.value}
                            </p>
                            <p className="text-base text-slate-300/85 mt-1">{info.description}</p>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-start rounded-2xl p-3">
                          <div className="flex-shrink-0 mt-1 mr-4 h-11 w-11 rounded-full bg-gradient-to-br from-[#DA2E29]/45 to-[#7f1013]/70 text-[#ff5a54] flex items-center justify-center ring-1 ring-[#DA2E29]/35">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="text-[1.55rem] leading-tight font-semibold text-slate-50">
                              {info.title}
                            </h3>
                            <p className="text-2xl font-semibold text-slate-100 mt-1 break-words">
                              {info.value}
                            </p>
                            <p className="text-base text-slate-300/85 mt-1">{info.description}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl backdrop-blur-sm sm:p-8 dark:border-gray-700/30 dark:bg-gray-800/50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center text-[#DA2E29] mr-4">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {meta.calendly_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">{meta.calendly_subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">{meta.calendly_description}</p>

                {meta.calendly_social_proof && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {meta.calendly_social_proof}
                  </p>
                )}

                <a
                  href={settings?.calendly_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ux-btn-primary w-full"
                >
                  {meta.calendly_button}
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              ref={formRef}
              className="lg:col-span-3"
              variants={containerVariants}
              initial="hidden"
              animate={isFormInView ? 'visible' : 'hidden'}
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xl backdrop-blur-sm sm:p-8 md:p-10 dark:border-gray-700/30 dark:bg-gray-800/50">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DA2E29] to-rose-600"></div>

                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {meta.form_title}
                </motion.h2>

                <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-8">
                  {meta.form_subtitle}
                </motion.p>

                {meta.form_sla_title && meta.form_sla_text && (
                  <motion.div
                    variants={itemVariants}
                    className="mb-6 rounded-xl border border-[#DA2E29]/20 bg-[#DA2E29]/5 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#B92522] dark:text-[#F06A66]">
                      {meta.form_sla_title}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{meta.form_sla_text}</p>
                  </motion.div>
                )}

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
                      Message envoye avec succes!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Merci pour votre message. Je vous repondrai dans les plus brefs delais.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    variants={containerVariants}
                  >
                    {/* ← ICI le bloc error, en premier dans le formulaire */}
                    {formStatus === 'error' && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400">
                        Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
                      </div>
                    )}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
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
                          onBlur={(e) => {
                            const message = validateField('name', e.target.value);
                            setFormErrors((prev) => ({ ...prev, name: message }));
                          }}
                          required
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-200 ${formErrors.name ? 'border-red-300 focus:ring-red-500/40' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29]/50'}`}
                          placeholder="Votre nom"
                        />
                        {formErrors.name ? (
                          <p className="ux-field-error">{formErrors.name}</p>
                        ) : (
                          <p className="ux-field-help">Nom et prénom pour personnaliser la réponse.</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
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
                          onBlur={(e) => {
                            const message = validateField('email', e.target.value);
                            setFormErrors((prev) => ({ ...prev, email: message }));
                          }}
                          required
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-200 ${formErrors.email ? 'border-red-300 focus:ring-red-500/40' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29]/50'}`}
                          placeholder="votre.email@exemple.com"
                        />
                        {formErrors.email ? (
                          <p className="ux-field-error">{formErrors.email}</p>
                        ) : (
                          <p className="ux-field-help">Utilisé uniquement pour vous répondre.</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
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
                          onBlur={(e) => {
                            const message = validateField('subject', e.target.value);
                            setFormErrors((prev) => ({ ...prev, subject: message }));
                          }}
                          required
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-200 appearance-none ${formErrors.subject ? 'border-red-300 focus:ring-red-500/40' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29]/50'}`}
                        >
                          <option value="" disabled>
                            Selectionnez un sujet
                          </option>
                          {subjectOptions.map((option: any) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.subject && <p className="ux-field-error">{formErrors.subject}</p>}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={(e) => {
                          const message = validateField('message', e.target.value);
                          setFormErrors((prev) => ({ ...prev, message: message }));
                        }}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-200 ${formErrors.message ? 'border-red-300 focus:ring-red-500/40' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29]/50'}`}
                        placeholder="Détaillez votre demande ici…"
                      />
                      {formErrors.message ? (
                        <p className="ux-field-error">{formErrors.message}</p>
                      ) : (
                        <p className="ux-field-help">Minimum conseillé: 20 caractères.</p>
                      )}
                    </motion.div>

                    {Boolean(meta.honeypot_enabled) && (
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        aria-hidden="true"
                      />
                    )}

                    <motion.div variants={itemVariants} className="pt-2">
                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className={`ux-btn-primary w-full !text-base ${formStatus === 'submitting' ? '!bg-gray-400 !cursor-not-allowed hover:!translate-y-0' : ''}`}
                      >
                        {formStatus === 'submitting' ? (
                          'Envoi en cours...'
                        ) : (
                          <>
                            <Send size={20} className="mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </button>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                        {meta.privacy_text}{' '}
                        <a href={meta.privacy_url} className="underline hover:text-[#DA2E29]">
                          En savoir plus
                        </a>
                        .
                      </p>
                    </motion.div>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 rounded-2xl overflow-hidden shadow-xl h-[400px] border border-gray-200 dark:border-gray-700/30"
            id="contact-map"
            data-progress-label="Localisation"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <iframe
              title="Localisation du bureau"
              src={meta.map_embed_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </motion.div>

          <motion.div
            id="faq"
            data-progress-label="FAQ"
            className="mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="ux-section-title text-center mb-12">
              {meta.faq_title}
            </h2>

            <FaqAccordion faqs={faqs} defaultOpenIndex={-1} />

            <div className="text-center mt-10">
              <Link
                href={meta.faq_link_url || '/faq'}
                className="group inline-flex items-center gap-2 text-[#DA2E29] hover:text-rose-700 font-medium transition-colors duration-200"
              >
                {meta.faq_link_label}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </FrontLayout>
  );
};

export default ContactPage;
