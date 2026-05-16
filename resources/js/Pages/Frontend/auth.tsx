import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { InputField } from '@/components/frontend/auth/input-field';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { route } from 'ziggy-js';

const AuthPage = ({ registrationEnabled = true }: { registrationEnabled?: boolean }) => {
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (tab === 'register' && registrationEnabled) {
      setActiveTab('register');
    }
  }, [registrationEnabled]);

  useEffect(() => {
    if (!registrationEnabled && activeTab === 'register') {
      setActiveTab('login');
    }
  }, [registrationEnabled, activeTab]);

  // Animations
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const backgroundVariants = {
    login: {
      backgroundPosition: '0% 50%',
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    register: {
      backgroundPosition: '100% 50%',
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
  };

  return (
    <FrontLayout>
      <div className="min-h-screen flex flex-col justify-center pb-12 pt-32 sm:px-6 lg:px-8 relative overflow-hidden">
        <Head title={activeTab === 'login' ? 'Connexion' : 'Inscription'} />

        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
          animate={activeTab}
          variants={backgroundVariants}
        />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
        <div className="absolute top-40 left-10 w-80 h-80 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700/30 relative overflow-hidden">
            {/* Subtle pattern background */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Tabs navigation */}
            <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-gray-700/50 mb-6 relative z-10">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-gray-800 text-[#DA2E29] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Connexion
              </button>
              {registrationEnabled && (
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-gray-800 text-[#DA2E29] shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Inscription
                </button>
              )}
            </div>

            {!registrationEnabled && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                Les inscriptions sont actuellement desactivees. Vous pouvez toujours vous connecter
                avec un compte existant.
              </div>
            )}

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-form"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <LoginForm
                    setActiveTab={setActiveTab}
                    registrationEnabled={registrationEnabled}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <RegisterForm setActiveTab={setActiveTab} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FrontLayout>
  );
};

// Input field component

// Login form component
const LoginForm = ({ setActiveTab, registrationEnabled }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    data,
    setData,
    post: loginPost,
    processing,
    errors: loginErrors,
    reset,
  } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    return () => {
      reset('password');
    };
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    loginPost(route('login'));
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenue</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          id="login-email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e: any) => setData('email', e.target.value)}
          autoComplete="email"
          placeholder="Adresse email"
          icon={Mail}
          error={loginErrors.email}
        />

        <InputField
          id="login-password"
          name="password"
          type="password"
          value={data.password}
          onChange={(e: any) => setData('password', e.target.value)}
          autoComplete="current-password"
          placeholder="Mot de passe"
          icon={Lock}
          error={loginErrors.password}
          showPassword={showPassword}
          togglePasswordVisibility={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={data.remember}
              onChange={(e: any) => setData('remember', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#DA2E29] focus:ring-[#DA2E29]"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link
              href={route('password.request')}
              className="font-medium text-[#DA2E29] hover:text-[#c02824] transition-colors"
            >
              Mot de passe oublié?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={processing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#DA2E29] hover:bg-[#c02824] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DA2E29] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {processing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        {registrationEnabled ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="font-medium text-[#DA2E29] hover:text-[#c02824] transition-colors"
            >
              S'inscrire
            </button>
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            La creation de compte est temporairement indisponible.
          </p>
        )}
      </div>
    </div>
  );
};

// Register form component
const RegisterForm = ({ setActiveTab }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
  });

  useEffect(() => {
    return () => {
      reset('password', 'password_confirmation');
    };
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('register'));
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Rejoignez-nous pour commencer votre transformation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="register-first_name"
            name="first_name"
            type="text"
            value={data.first_name}
            onChange={(e: any) => setData('first_name', e.target.value)}
            required
            autoComplete="given-name"
            placeholder="Prénom"
            icon={User}
            error={errors.first_name}
          />
          <InputField
            id="register-last_name"
            name="last_name"
            type="text"
            value={data.last_name}
            onChange={(e: any) => setData('last_name', e.target.value)}
            required
            autoComplete="family-name"
            placeholder="Nom"
            icon={User}
            error={errors.last_name}
          />
        </div>

        <InputField
          id="register-email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e: any) => setData('email', e.target.value)}
          required
          autoComplete="email"
          placeholder="Adresse email"
          icon={Mail}
          error={errors.email}
        />

        <InputField
          id="register-password"
          name="password"
          type="password"
          value={data.password}
          onChange={(e: any) => setData('password', e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Mot de passe"
          icon={Lock}
          error={errors.password}
          showPassword={showPassword}
          togglePasswordVisibility={() => setShowPassword(!showPassword)}
        />

        <InputField
          id="register-password_confirmation"
          name="password_confirmation"
          type="password"
          value={data.password_confirmation}
          onChange={(e: any) => setData('password_confirmation', e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Confirmer le mot de passe"
          icon={Lock}
          error={errors.password_confirmation}
          showPassword={showPasswordConfirmation}
          togglePasswordVisibility={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
        />

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={data.terms}
              onChange={(e: any) => setData('terms', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#DA2E29] focus:ring-[#DA2E29]"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
              J'accepte les{' '}
              <Link
                href={route('terms.show')}
                className="text-[#DA2E29] hover:text-[#c02824] transition-colors"
              >
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link
                href={route('policy.show')}
                className="text-[#DA2E29] hover:text-[#c02824] transition-colors"
              >
                politique de confidentialité
              </Link>
            </label>
            {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={processing || !data.terms}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#DA2E29] hover:bg-[#c02824] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DA2E29] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {processing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Inscription en cours...
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Déjà inscrit?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="font-medium text-[#DA2E29] hover:text-[#c02824] transition-colors"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
