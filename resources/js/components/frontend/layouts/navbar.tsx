import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { Search, Sun, Moon, ChevronRight, LogIn, LogOut, Calendar1, User } from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { useTheme } from '@/components/theme-provider';
import { useSettings } from '@/hooks/use-settings';
import { route } from 'ziggy-js';

type NavItem = {
  name: string;
  href: string;
  delay: number;
  matchers: string[];
};

const normalizePath = (value: string): string => {
  if (!value) return '/';

  try {
    const parsedUrl = value.startsWith('http')
      ? new URL(value)
      : new URL(value, window.location.origin);
    const path = parsedUrl.pathname || '/';
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
  } catch {
    const noQuery = value.split('?')[0].split('#')[0] || '/';
    return noQuery.length > 1 ? noQuery.replace(/\/+$/, '') : noQuery;
  }
};

const isNavItemActive = (currentPath: string, item: NavItem): boolean => {
  return item.matchers.some((matcher) => {
    const normalizedMatcher = normalizePath(matcher);

    if (normalizedMatcher === '/') {
      return currentPath === '/';
    }

    return currentPath === normalizedMatcher || currentPath.startsWith(`${normalizedMatcher}/`);
  });
};

const Navbar = () => {
  const [searchActive, setSearchActive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const { settings, isLoading, isError, error } = useSettings();
  const [hasRendered, setHasRendered] = useState(false);

  const page = usePage() as any;
  const { auth } = page.props;
  const currentPath = normalizePath(page.url || window.location.pathname);
  const canAdminister = auth?.can?.administer === true;
  const accountRoute = canAdminister ? route('dashboard') : route('dashboard.client.profile');

  // Smoother animations with spring physics
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothHeight = useSpring(useTransform(scrollY, [0, 100], [96, 72]), springConfig);
  const smoothBackground = useTransform(
    scrollY,
    [0, 50, 100],
    [
      'rgba(255,255,255,0)',
      theme === 'dark' ? 'rgba(10,10,18,0.6)' : 'rgba(255,255,255,0.6)',
      theme === 'dark' ? 'rgba(10,10,18,0.9)' : 'rgba(255,255,255,0.95)',
    ]
  );

  // Ajouter avec les autres useTransform
  const smoothBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255,255,255,0)', theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)']
  );

  const smoothLogoScale = useSpring(useTransform(scrollY, [0, 100], [1, 0.9]), springConfig);

  // Nav items
  const navItems: NavItem[] = [
    { name: 'Accueil', href: route('home'), delay: 0, matchers: [route('home')] },
    { name: 'Services', href: route('services'), delay: 0.1, matchers: [route('services')] },
    { name: 'Formations', href: route('formations'), delay: 0.1, matchers: [route('formations')] },
    { name: 'Événements', href: route('evenements'), delay: 0.2, matchers: [route('evenements')] },
    { name: 'Blog', href: route('blogs'), delay: 0.3, matchers: [route('blogs')] },
    { name: 'À propos', href: route('about'), delay: 0.4, matchers: [route('about')] },
    { name: 'Contact', href: route('contact'), delay: 0.5, matchers: [route('contact')] },
  ];

  // Toggle search input
  const toggleSearch = () => {
    setSearchActive(!searchActive);
  };

  useEffect(() => {
    setHasRendered(true);
  }, []);

  // Navbar appearance animations - Only animate on first render
  const navVariants = {
    initial: (custom) => ({
      opacity: custom ? 1 : 0,
      y: custom ? 0 : -20,
    }),
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: 'easeOut',
        staggerChildren: 0.08,
      },
    },
  };

  // Child item animations - Only animate on first render
  const itemVariants = {
    initial: (custom) => ({
      y: custom ? 0 : -20,
      opacity: custom ? 1 : 0,
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Search animation variants
  const searchVariants = {
    closed: {
      width: '0px',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      width: '240px',
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Active navigation indicator with refined animation
  const NavIndicator = ({ pathname }: { pathname: string }) => (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DA2E29] to-rose-600 rounded-t-md"
      layoutId="navIndicator"
      transition={{
        type: 'spring',
        bounce: 0.15,
        duration: 0.7,
        stiffness: 180,
        damping: 20,
      }}
    />
  );

  // Custom nav link component with indicator
  const NavLink = ({ item, children }: { item: NavItem; children: React.ReactNode }) => {
    const isActive = isNavItemActive(currentPath, item);

    return (
      <motion.div
        className="relative h-full flex items-center"
        variants={itemVariants}
        custom={hasRendered}
      >
        <Link
          href={item.href}
          className={`relative h-full flex items-center px-4 rounded-xl text-base font-medium transition-all duration-300
                        ${
                          isActive
                            ? 'text-[#DA2E29] dark:text-[#DA2E29] bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20'
                            : 'text-gray-700 dark:text-gray-200 hover:text-[#DA2E29] dark:hover:text-[#DA2E29]'
                        }`}
        >
          {children}
          {isActive && <NavIndicator pathname={item.href} />}
        </Link>
      </motion.div>
    );
  };

  // Mobile menu animation variants
  const mobileMenuVariants = {
    closed: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  // Mobile menu item animation
  const mobileItemVariants = {
    closed: { x: 50, opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Button hover effect
  const buttonHoverEffect = {
    rest: { scale: 1 },
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.header
      initial="initial"
      animate="animate"
      variants={navVariants}
      custom={hasRendered}
      style={{
        height: smoothHeight,
        backgroundColor: smoothBackground,
        backdropFilter: 'blur(12px)',
        borderBottomColor: smoothBorder, // ← ajouter
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent dark:border-gray-800/20 shadow-sm dark:shadow-gray-950/10"
    >
      <div className="h-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo Area with enhanced animations */}
        <motion.div
          style={{ scale: smoothLogoScale }}
          className="flex items-center"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="flex items-center">
            <motion.div className="relative overflow-hidden group">
              {/* Premium effect for logo on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#DA2E29]/30 to-rose-600/30 rounded-xl blur-md opacity-0 transition-all duration-500 "
                initial={false}
              />
              <img
                src={`${theme === 'dark' ? '/assets/images/logo-dark.png' : '/assets/images/logo.png'}`}
                className="w-32 md:w-32 relative z-10 transition-all duration-300 group-hover:brightness-105"
                alt="Redeemer Holding Logo"
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Desktop Navigation with refined spacing */}
        <div className="hidden h-full lg:flex items-center">
          <nav className="h-full flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item}>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Action Buttons with enhanced visual effects */}
        <div className="flex items-center space-x-1 md:space-x-3">
          {/* Search */}
          <div className="relative hidden items-center sm:flex">
            <motion.button
              variants={buttonHoverEffect}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={toggleSearch}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/90 transition-colors duration-300 backdrop-blur-sm"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </motion.button>

            <AnimatePresence>
              {searchActive && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={searchVariants}
                  className="absolute right-9 top-0 h-10 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full h-full pl-4 pr-2 outline-none rounded-l-full bg-gray-100/95 dark:bg-gray-800/95 text-gray-900 dark:text-gray-100 border-none backdrop-blur-sm"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick booking button */}
          <a
            href={settings?.calendly_link || route('contact')}
            target={settings?.calendly_link ? '_blank' : undefined}
            rel={settings?.calendly_link ? 'noopener noreferrer' : undefined}
            title={settings?.calendly_link ? 'Prendre rendez-vous' : 'Nous contacter'}
            aria-label={settings?.calendly_link ? 'Prendre rendez-vous' : 'Nous contacter'}
            className="group relative hidden sm:block"
          >
            <motion.button
              variants={buttonHoverEffect}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/90 transition-colors duration-300 backdrop-blur-sm relative"
            >
              <Calendar1 className="w-[18px] h-[18px]" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-gradient-to-br from-[#DA2E29] to-rose-600 rounded-full ring-2 ring-white dark:ring-gray-900"
              ></motion.span>
            </motion.button>

            <span className="pointer-events-none absolute left-1/2 top-[115%] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap dark:bg-slate-100 dark:text-slate-900">
              {settings?.calendly_link ? 'Prendre rendez-vous' : 'Nous contacter'}
            </span>
          </a>

          {/* Theme Toggle with enhanced transition */}
          <motion.button
            variants={buttonHoverEffect}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-100/80 text-gray-700 backdrop-blur-sm transition-colors duration-300 hover:bg-gray-200 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700/90 sm:flex"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Login/Profile Button */}
          {!auth?.user && (
            <Link
              href={route('register.page', { tab: 'register' })}
              className="hidden md:inline-flex items-center rounded-full border border-[#DA2E29]/30 bg-[#DA2E29]/10 px-4 py-2 text-sm font-medium text-[#DA2E29] hover:bg-[#DA2E29]/15 transition-colors"
            >
              S'inscrire
            </Link>
          )}

          <Link href={!auth?.user ? route('login') : accountRoute} className="hidden sm:block">
            <motion.div
              variants={buttonHoverEffect}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#DA2E29] to-rose-600 text-white shadow-md shadow-rose-600/10 dark:shadow-rose-900/20"
            >
              {auth?.user ? (
                <User className="w-[18px] h-[18px]" />
              ) : (
                <LogIn className="w-[18px] h-[18px]" />
              )}
            </motion.div>
          </Link>

          {auth?.user && (
            <Link
              href={route('logout')}
              method="post"
              as="button"
              title="Déconnexion"
              aria-label="Déconnexion"
              className="hidden sm:block"
            >
              <motion.div
                variants={buttonHoverEffect}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:text-[#DA2E29] hover:bg-gray-200 dark:hover:bg-gray-700/90 transition-colors duration-300 backdrop-blur-sm"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </motion.div>
            </Link>
          )}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <motion.button
                  variants={buttonHoverEffect}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-10 h-10 flex flex-col items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/90 transition-colors duration-300 backdrop-blur-sm ml-1"
                >
                  <span className="w-5 h-0.5 bg-current mb-1.5 rounded-full"></span>
                  <span className="w-4 h-0.5 bg-current mb-1.5 rounded-full"></span>
                  <span className="w-3 h-0.5 bg-current rounded-full"></span>
                </motion.button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:w-[350px] p-0 overflow-hidden border-none"
              >
                <motion.div
                  className="h-full bg-white dark:bg-gray-900 flex flex-col"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={mobileMenuVariants}
                >
                  {/* Header with logo */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-center">
                      <img
                        src={`${theme === 'dark' ? '/assets/images/logo-dark.png' : '/assets/images/logo.png'}`}
                        className="w-28 h-auto"
                        alt="Redeemer Holding Logo"
                      />
                    </div>
                  </div>

                  {/* Navigation Links with enhanced visuals */}
                  <div className="flex-1 px-6 py-8 overflow-auto">
                    <nav className="space-y-5">
                      {navItems.map((item) => (
                        <motion.div
                          key={item.name}
                          variants={mobileItemVariants}
                          className="overflow-hidden"
                        >
                          <Link
                            href={item.href}
                            className="group flex items-center py-3 border-b border-gray-100 dark:border-gray-800/50 w-full"
                          >
                            <motion.span
                              className={`text-xl font-medium transition-all duration-300
                                                                ${
                                                                  isNavItemActive(currentPath, item)
                                                                    ? 'text-[#DA2E29]'
                                                                    : 'text-gray-800 dark:text-gray-200 group-hover:text-[#DA2E29] group-hover:translate-x-1'
                                                                }`}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.name}
                            </motion.span>
                            <ChevronRight className="ml-auto w-5 h-5 text-gray-400 group-hover:text-[#DA2E29] transition-colors duration-300 opacity-70 group-hover:opacity-100" />
                          </Link>
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Footer with enhanced visual separation */}
                  <div className="space-y-4 border-t border-gray-100 bg-gray-50/80 p-6 backdrop-blur-sm dark:border-gray-800/80 dark:bg-gray-900/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors duration-300">
                          {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                          ) : (
                            <Moon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-medium">
                          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        </span>
                      </button>

                      <Link
                        href={auth?.user ? accountRoute : route('login')}
                        className="ux-btn-secondary !px-4 !py-2"
                      >
          {auth?.user
            ? canAdminister
              ? 'Dashboard admin'
              : 'Mon espace'
            : 'Connexion'}
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <a
                        href={settings?.calendly_link || route('contact')}
                        target={settings?.calendly_link ? '_blank' : undefined}
                        rel={settings?.calendly_link ? 'noopener noreferrer' : undefined}
                        className="ux-btn-primary"
                      >
                        {settings?.calendly_link ? 'Prendre rendez-vous' : 'Nous contacter'}
                      </a>

                      {!auth?.user && (
                        <Link
                          href={route('register.page', { tab: 'register' })}
                          className="ux-btn-secondary"
                        >
                          S'inscrire
                        </Link>
                      )}

                      {auth?.user && (
                        <Link
                          href={route('logout')}
                          method="post"
                          as="button"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300 bg-white px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          Déconnexion
                          <LogOut className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
