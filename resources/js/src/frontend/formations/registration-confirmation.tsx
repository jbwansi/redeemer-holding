import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import {
    Calendar, Clock, MapPin, CheckCircle, Printer, Download, ArrowLeft, Share2,
    CalendarDays, Mail, FileText, GraduationCap, Monitor, BookOpen
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { route } from 'ziggy-js';

const FormationConfirmationPage = ({ formation, registration }: any) => {
    const isFormationFree = formation.price <= 0;

    const handlePrint = () => {
        window.print();
    };

    // Générer l'URL pour ajouter la formation au calendrier
    const generateCalendarUrl = () => {
        const startDate = new Date(formation.start_date);
        const endDate = new Date(formation.end_date);
        const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
        const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(formation.title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(`Votre inscription: ${registration.reference}\n\n${formation.description}`)}&location=${encodeURIComponent(formation.format)}`;
    };

    // Générer le contenu du QR code
    const qrCodeValue = `${window.location.origin}/formations/${registration.reference}`;

    return (
        <FrontLayout>
            <Head title={`Confirmation - ${formation.title}`} />

            <main className="pt-24 pb-16 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bannière de succès */}
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-xl mb-10 print:hidden">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-bold">Inscription confirmée !</h2>
                                <p className="mt-2">
                                    Votre inscription à la formation a été {isFormationFree ? 'enregistrée' : 'payée'} avec succès.
                                    Un email de confirmation avec les instructions d'accès vous a été envoyé à l'adresse {registration.email}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex flex-wrap gap-3 mb-8 print:hidden">
                        <Link
                            href={route('formations.details', formation.slug)}
                            className="inline-flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span>Retour à la formation</span>
                        </Link>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            <span>Imprimer la confirmation</span>
                        </button>

                        <a
                            href={generateCalendarUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                        >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            <span>Ajouter au calendrier</span>
                        </a>

                        {!isFormationFree && (
                            <button
                                onClick={() => window.location.href = route('formations.facture.download', {
                                    slug: formation.slug,
                                    reference: registration.reference
                                })}
                                className="inline-flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                <span>Télécharger la facture</span>
                            </button>
                        )}
                    </div>

                    {/* Certificat d'inscription */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 mb-8 relative print:shadow-none print:border-0">
                        {/* En-tête */}
                        <div className="bg-red-600 text-white px-6 py-4 print:bg-white print:text-black">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Certificat d'inscription</h2>
                                <div className="text-sm">REF: {registration.reference}</div>
                            </div>
                        </div>

                        {/* Corps du certificat */}
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Informations principales */}
                                <div className="md:w-2/3">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        {formation.title}
                                    </h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Date de début</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formatDate(formation.start_date)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Durée</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formation.duration} heures de formation
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Format</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formation.format}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <GraduationCap className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Niveau</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formation.level}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Participant</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {registration.name}
                                                    <div>{registration.email}</div>
                                                    {registration.phone && <div>{registration.phone}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations de paiement */}
                                    {!isFormationFree && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                Détails du paiement
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                                    <span>Formation</span>
                                                    <span>{formatCurrency(formation.price)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                                    <span>Frais de plateforme</span>
                                                    <span>{formatCurrency(formation.price * 0.05)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <span>Total payé</span>
                                                    <span>{formatCurrency(formation.price * 1.05)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code */}
                                <div className="md:w-1/3 flex flex-col items-center justify-center">
                                    <div className="bg-white p-4 rounded-lg mb-3">
                                        <QRCode
                                            value={qrCodeValue}
                                            size={150}
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                            level="M"
                                        />
                                    </div>
                                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        Votre identifiant unique
                                        <div className="font-mono font-medium text-gray-700 dark:text-gray-300 mt-1">
                                            {registration.reference}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions d'accès */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                    Accès à la formation
                                </h4>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                                            <span className="text-red-700 dark:text-red-300">
                                                Connectez-vous à votre espace apprenant pour accéder au contenu de la formation
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Calendar className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                                            <span className="text-red-700 dark:text-red-300">
                                                La formation débute le {formatDate(formation.start_date)}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Mail className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                                            <span className="text-red-700 dark:text-red-300">
                                                Vous recevrez un email avec les instructions détaillées avant le début de la formation
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions supplémentaires */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6 print:hidden">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Plus d'options
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* <Link
                                href="/dashboard/formations"
                                className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                                <BookOpen className="w-5 h-5 mr-3" />
                                <span>Accéder à mon espace formation</span>
                            </Link> */}

                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                            >
                                <Printer className="w-5 h-5 mr-3" />
                                <span>Imprimer la confirmation</span>
                            </button>

                            <button
                                onClick={() => {
                                    const emailSubject = `Confirmation d'inscription - ${formation.title}`;
                                    const emailBody = `Je confirme mon inscription à la formation ${formation.title}. Référence: ${registration.reference}. Voir les détails: ${window.location.href}`;
                                    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                                }}
                                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                            >
                                <Mail className="w-5 h-5 mr-3" />
                                <span>Envoyer par email</span>
                            </button>

                            <a
                                href={generateCalendarUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                            >
                                <CalendarDays className="w-5 h-5 mr-3" />
                                <span>Ajouter au calendrier</span>
                            </a>

                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `Inscription à ${formation.title}`,
                                            text: `Je me suis inscrit(e) à la formation ${formation.title}. Référence: ${registration.reference}`,
                                            url: window.location.href,
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Lien copié dans le presse-papier');
                                    }
                                }}
                                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                            >
                                <Share2 className="w-5 h-5 mr-3" />
                                <span>Partager l'inscription</span>
                            </button>

                            {!isFormationFree && (
                                <button
                                    onClick={() => window.location.href = route('formations.facture.download', {
                                        slug: formation.slug,
                                        reference: registration.reference
                                    })}
                                    className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                                >
                                    <FileText className="w-5 h-5 mr-3" />
                                    <span>Télécharger la facture</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Autres formations recommandées */}
                    {formation.related_formations && formation.related_formations.length > 0 && (
                        <div className="mt-10 print:hidden">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Autres formations qui pourraient vous intéresser
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {formation.related_formations.map((relatedFormation: any) => (
                                    <Link
                                        key={relatedFormation.id}
                                        href={route('formations.details', relatedFormation.slug)}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={relatedFormation.featured_image?.original || '/assets/images/formation-placeholder.jpg'}
                                                alt={relatedFormation.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                                <div className="text-white">
                                                    <div className="text-sm">Débute le {formatDate(relatedFormation.start_date)}</div>
                                                    <div className="font-medium">{relatedFormation.title}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </FrontLayout>
    );
};

export default FormationConfirmationPage;
