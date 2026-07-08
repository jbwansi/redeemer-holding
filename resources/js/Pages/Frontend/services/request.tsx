import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';

// Types
interface Service {
  id: number;
  name: string;
  slug: string;
  excerpt: string | null;
  icon: string | null;
  status: number;
}

interface ServiceRequestProps {
  service: Service;
}

const ServiceRequest = ({ service }: ServiceRequestProps) => {
  const iconName = normalizeServiceIconName(service.icon);

  // Form handling with Inertia
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    service_id: service.id,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Success state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [liveErrors, setLiveErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string): string => {
    const trimmed = value.trim();

    if (['first_name', 'last_name', 'email', 'message'].includes(field) && !trimmed) {
      return 'Ce champ est obligatoire.';
    }

    if (field === 'email' && trimmed && !/\S+@\S+\.\S+/.test(trimmed)) {
      return 'Veuillez saisir une adresse email valide.';
    }

    if (field === 'phone' && trimmed && !/^[+0-9()\s-]{7,20}$/.test(trimmed)) {
      return 'Numéro invalide (caractères autorisés: + chiffres, espaces, parenthèses).';
    }

    if (field === 'message' && trimmed && trimmed.length < 20) {
      return 'Ajoutez au moins 20 caractères pour contextualiser votre demande.';
    }

    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    setData(field as any, value);
    clearErrors(field as any);

    const message = validateField(field, value);
    setLiveErrors((prev) => {
      if (!message) {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [field]: message };
    });
  };

  const handleFieldBlur = (field: string, value: string) => {
    const message = validateField(field, value);
    setLiveErrors((prev) => {
      if (!message) {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [field]: message };
    });
  };

  const getFieldError = (field: string): string | undefined => {
    return liveErrors[field] || (errors as Record<string, string>)[field];
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    (['first_name', 'last_name', 'email', 'phone', 'message'] as const).forEach((field) => {
      const message = validateField(field, String((data as any)[field] || ''));
      if (message) {
        nextErrors[field] = message;
      }
    });

    setLiveErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    post(route('service-requests.store', service?.id), {
      onSuccess: () => {
        reset();
        setLiveErrors({});
        setIsSubmitted(true);
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      },
    });
  };

  // Animation variants
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

  return (
    <FrontLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-32 pb-20">
        <Head title={`Demande de ${service.name}`} />

        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
        <div className="absolute top-40 left-10 w-80 h-80 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-700/30 relative overflow-hidden"
              >
                {/* Subtle pattern background */}
                <div
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Form Header */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Demande de {service.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complétez le formulaire ci-dessous pour soumettre votre demande. Nous vous
                    répondrons dans les plus brefs délais.
                  </p>
                </motion.div>

                {/* Success Message */}
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg flex items-start"
                  >
                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-300">
                        Demande envoyée avec succès!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Nous avons bien reçu votre demande et vous contacterons très prochainement.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Request Form */}
                <motion.form onSubmit={handleSubmit} variants={containerVariants}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Prénom <span className="text-[#DA2E29]">*</span>
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="first_name"
                          name="first_name"
                          type="text"
                          value={data.first_name}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                          onBlur={(e) => handleFieldBlur('first_name', e.target.value)}
                          required
                          className={`block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
                            getFieldError('first_name')
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
                          } rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                          placeholder="Votre prénom"
                        />
                        {getFieldError('first_name') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Last Name */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Nom <span className="text-[#DA2E29]">*</span>
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="last_name"
                          name="last_name"
                          type="text"
                          value={data.last_name}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                          onBlur={(e) => handleFieldBlur('last_name', e.target.value)}
                          required
                          className={`block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
                            getFieldError('last_name')
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
                          } rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                          placeholder="Votre nom"
                        />
                        {getFieldError('last_name') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email <span className="text-[#DA2E29]">*</span>
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={data.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onBlur={(e) => handleFieldBlur('email', e.target.value)}
                          required
                          className={`block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
                            getFieldError('email')
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
                          } rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                          placeholder="votre.email@exemple.com"
                        />
                        {getFieldError('email') ? (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                        ) : (
                          <p className="ux-field-help">Nous utilisons cet email pour vous répondre.</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Phone (Optional) */}
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Téléphone <span className="text-gray-400 text-xs">(optionnel)</span>
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={data.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                          className={`block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
                            getFieldError('phone')
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
                          } rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                          placeholder="+33 6 12 34 56 78"
                        />
                        {getFieldError('phone') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Message */}
                  <motion.div variants={itemVariants} className="mt-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Message <span className="text-[#DA2E29]">*</span>
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={data.message}
                        onChange={(e) => handleFieldChange('message', e.target.value)}
                        onBlur={(e) => handleFieldBlur('message', e.target.value)}
                        required
                        rows={5}
                        className={`block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
                          getFieldError('message')
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
                        } rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        placeholder="Décrivez votre besoin ou posez vos questions..."
                      />
                      {getFieldError('message') ? (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('message')}</p>
                      ) : (
                        <p className="ux-field-help">Plus votre message est précis, plus la réponse sera utile.</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="mt-8">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#DA2E29] hover:bg-[#c02824] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DA2E29] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {processing ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer ma demande
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                      En soumettant ce formulaire, vous acceptez notre{' '}
                      <a href={route('policy.show')} className="underline hover:text-[#DA2E29]">
                        politique de confidentialité
                      </a>
                      .
                    </p>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-5">
              {/* Service Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/30 overflow-hidden mb-8"
              >
                {/* Service Header */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#DA2E29] to-rose-600"></div>
                  <div className="absolute inset-0 opacity-20 bg-pattern"></div>
                  <div className="relative h-full flex flex-col justify-center items-center text-white p-6 text-center">
                    {service.icon && (
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        <IconComponent name={iconName || 'checkCircle'} size={32} color="#ffffff" />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold">{service.name}</h2>
                    {service.excerpt && (
                      <p className="mt-2 text-white/80 text-sm line-clamp-2">{service.excerpt}</p>
                    )}
                  </div>
                </div>

                {/* Service Benefits */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ce service comprend
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#DA2E29] mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Consultation initiale pour évaluer vos besoins
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#DA2E29] mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Plan d'action personnalisé
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#DA2E29] mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Suivi régulier de vos progrès
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#DA2E29] mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Ressources et outils exclusifs
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Process Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/30"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Prochaines étapes
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DA2E29] text-white flex items-center justify-center font-medium mr-4">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Soumission</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Complétez et envoyez le formulaire de demande
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DA2E29] text-white flex items-center justify-center font-medium mr-4">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Confirmation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Vous recevrez un email de confirmation sous 24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DA2E29] text-white flex items-center justify-center font-medium mr-4">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Consultation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Nous planifierons un appel pour discuter de vos besoins
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DA2E29] text-white flex items-center justify-center font-medium mr-4">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Démarrage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Début de votre accompagnement personnalisé
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/30"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DA2E29]/10 flex items-center justify-center text-[#DA2E29] mr-4">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Temps de réponse</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Nous répondons à toutes les demandes dans un délai de 24 heures ouvrées.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </FrontLayout>
  );
};

export default ServiceRequest;
