import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Music2,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Twitter,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const Footer = () => {
  const { settings } = useSettings();
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
  });

  const isEnabled = (value: unknown) => {
    return value === true || value === 1 || value === '1' || value === 'true';
  };

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    post(route('newsletter.subscribe'), {
      preserveScroll: true,
      onSuccess: () => reset('email'),
    });
  };
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Footer sections data
  const footerLinks = [
    {
      title: 'Services',
      links: [
        { name: 'Coaching individuel', href: route('services', { focus: 'coaching' }) },
        { name: 'Consultation', href: route('services', { focus: 'consultation' }) },
        { name: 'Training en groupe', href: route('services', { focus: 'formation' }) },
        { name: 'Webinaires', href: route('services', { focus: 'webinaire' }) },
        { name: 'Ressources gratuites', href: route('services', { focus: 'ressources' }) },
      ],
    },
    {
      title: 'À propos',
      links: [
        { name: 'Mon parcours', href: route('about') },
        { name: 'Services', href: route('services') },
        { name: 'Blog', href: route('blogs') },
        { name: 'Formations', href: route('formations') },
        { name: 'Politique des cookies', href: route('cookies.show') },
      ],
    },
  ];

  // Social media links are controlled from dashboard settings.
  const canShowSocialLinks =
    settings?.show_social_links === undefined ? true : isEnabled(settings?.show_social_links);

  const socialLinks = [
    {
      icon: <Facebook size={18} />,
      href: settings?.facebook_url,
      label: 'Facebook',
      enabled: settings?.facebook_enabled,
    },
    {
      icon: <Instagram size={18} />,
      href: settings?.instagram_url,
      label: 'Instagram',
      enabled: settings?.instagram_enabled,
    },
    {
      icon: <Linkedin size={18} />,
      href: settings?.linkedin_url,
      label: 'LinkedIn',
      enabled: settings?.linkedin_enabled,
    },
    {
      icon: <Twitter size={18} />,
      href: settings?.twitter_url,
      label: 'Twitter',
      enabled: settings?.twitter_enabled,
    },
    {
      icon: <Youtube size={18} />,
      href: settings?.youtube_url,
      label: 'YouTube',
      enabled: settings?.youtube_enabled,
    },
    {
      icon: <Music2 size={18} />,
      href: settings?.tiktok_url,
      label: 'TikTok',
      enabled: settings?.tiktok_enabled,
    },
  ].filter((social) => canShowSocialLinks && isEnabled(social.enabled) && !!social.href);

  // Contact information
  const contactInfo = [
    {
      icon: <Mail size={16} />,
      content: settings?.contact_email || 'jb.wansi@redeemerholding.com',
    },
    { icon: <Phone size={16} />, content: settings?.company_phone || '+41 76 582 11 09' },
    {
      icon: <MapPin size={16} />,
      content: settings?.company_address || 'Avenue Jean-Marie-Musy 5 1700 Fribourg',
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-20 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 pb-12 border-b border-gray-200 dark:border-gray-800"
        >
          {/* Brand & Newsletter */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center">
                <div className="relative overflow-hidden group h-12 w-12 rounded-xl mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#DA2E29] via-rose-500 to-orange-500 rounded-xl opacity-80 group-hover:opacity-100 blur p-[1px] transition-opacity duration-300"></div>
                  <div className="relative rounded-xl bg-white dark:bg-gray-900 h-full w-full flex items-center justify-center border border-gray-200 dark:border-gray-800">
                    <span className="text-[#DA2E29] font-bold text-xl">R</span>
                  </div>
                </div>
                <div>
                  <span className="block font-bold tracking-tight text-gray-900 dark:text-white text-lg">
                    {settings?.app_name || 'Redeemer Holding'}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Training & Coaching
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
              Je vous accompagne dans votre développement personnel et professionnel pour vous aider
              à atteindre vos objectifs et à vivre la vie que vous méritez.
            </p>

            <div className="mb-8">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Restez informé
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-l-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50"
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-3 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-r-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline mr-2">
                    {processing ? 'En cours...' : "S'abonner"}
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              </form>
              {errors.email && <p className="text-xs text-red-500 mt-2">{errors.email}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Je respecte votre vie privée. Désabonnez-vous à tout moment.
              </p>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#DA2E29]/10 hover:text-[#DA2E29] dark:hover:bg-[#DA2E29]/20 dark:hover:text-[#DA2E29] transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={`section-${sectionIndex}`}
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={`link-${sectionIndex}-${linkIndex}`}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-[#DA2E29] dark:hover:text-[#DA2E29] transition-colors duration-200 group"
                    >
                      <ChevronRight
                        size={16}
                        className="mr-1 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                      />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Contact</h3>
            <ul className="space-y-5">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center text-[#DA2E29] mr-3">
                    {item.icon}
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{item.content}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center text-[#DA2E29] font-medium hover:underline"
              >
                <span>Prendre rendez-vous</span>
                <ChevronRight
                  size={16}
                  className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>© {currentYear} Redeemer Holding. Tous droits réservés.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href={route('policy.show')}
              className="hover:text-[#DA2E29] transition-colors duration-200"
            >
              Politique de confidentialité
            </Link>
            <Link
              href={route('terms.show')}
              className="hover:text-[#DA2E29] transition-colors duration-200"
            >
              Conditions d'utilisation
            </Link>
            <Link
              href={route('cookies.show')}
              className="hover:text-[#DA2E29] transition-colors duration-200"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
