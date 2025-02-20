import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Calendar, Clock, MapPin, Users, CheckCircle, Printer, Download, ArrowLeft, Share2, CalendarDays, Mail, FileText } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import QRCode from 'react-qr-code';

const PaymentConfirmationPage = ({ event, registration }: any) => {
    const isEventFree = event.price <= 0;

    const handlePrint = () => {
        window.print();
    };

    // Générer l'URL pour ajouter l'événement au calendrier
    const generateCalendarUrl = () => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        // Formater pour Google Calendar
        const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
        const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(`Votre réservation: ${registration.reference}\n\n${event.description}`)}&location=${encodeURIComponent(event.location)}`;
    };

    // Générer le contenu du QR code (lien vers la page du billet)
    const qrCodeValue = `${window.location.origin}/tickets/${registration.reference}`;

    return (
        <FrontLayout>
            <Head title={`Confirmation - ${event.title}`} />

            <main className="pt-24 pb-16 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bannière de succès */}
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-xl mb-10 print:hidden">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-bold">Réservation confirmée !</h2>
                                <p className="mt-2">
                                    Votre inscription à l'événement a été {isEventFree ? 'enregistrée' : 'payée'} avec succès.
                                    Un email de confirmation vous a été envoyé à l'adresse {registration.email}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex flex-wrap gap-3 mb-8 print:hidden">
                        <Link
                            href={route('evenements.details', event.slug)}
                            className="inline-flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span>Retour à l'événement</span>
                        </Link>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            <span>Imprimer le billet</span>
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
                        {!isEventFree && (
                            <button
                                onClick={() => window.location.href = route('evenements.facture.download', {
                                    slug: event.slug,
                                    reference: registration.reference
                                })}
                                className="inline-flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                <span>Télécharger la facture</span>
                            </button>
                        )}
                    </div>

                    {/* Billet */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 mb-8 relative print:shadow-none print:border-0">
                        {/* En-tête du billet */}
                        <div className="bg-red-600 text-white px-6 py-4 print:bg-white print:text-black">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Billet d'événement</h2>
                                <div className="text-sm">REF: {registration.reference}</div>
                            </div>
                        </div>

                        {/* Corps du billet */}
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Informations principales */}
                                <div className="md:w-2/3">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Date</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formatDate(event.start_date)}
                                                    {event.start_date !== event.end_date && (
                                                        <div>jusqu'au {formatDate(event.end_date)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Horaires</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Lieu</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Users className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Réservation</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {registration.qty} {registration.qty > 1 ? 'places' : 'place'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Réservé pour</div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {registration.name}
                                                    <div>{registration.email}</div>
                                                    {registration.phone && <div>{registration.phone}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations de paiement */}
                                    {!isEventFree && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                Détails du paiement
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                                    <span>Sous-total</span>
                                                    <span>{formatCurrency(event.price * registration.qty)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                                    <span>Frais de service</span>
                                                    <span>{formatCurrency(event.price * registration.qty * 0.05)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <span>Total payé</span>
                                                    <span>{formatCurrency(event.price * registration.qty * 1.05)}</span>
                                                </div>
                                                {registration.payment_date && (
                                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                        <span>Date de paiement</span>
                                                        <span>{new Date(registration.payment_date).toLocaleDateString('fr-FR')} à {new Date(registration.payment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
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

                            {/* Conditions d'utilisation */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                <p className="mb-2">
                                    <strong>Conditions:</strong> Ce billet est valable uniquement pour l'événement et la date indiqués.
                                    Veuillez présenter ce billet (imprimé ou sur votre appareil mobile) à l'entrée.
                                </p>
                                <p>
                                    <strong>Annulation:</strong> En cas d'empêchement, vous pouvez annuler votre réservation jusqu'à 24 heures avant le début de l'événement
                                    {!isEventFree && ' pour obtenir un remboursement'}.
                                </p>
                            </div>
                        </div>

                        {/* Filigrane pour l'impression */}
                        <div className="hidden print:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 rotate-45 text-9xl font-black text-gray-300">
                            CONFIRMÉ
                        </div>
                    </div>

                    {/* Actions supplémentaires */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6 print:hidden">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Plus d'options
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                            >
                                <Printer className="w-5 h-5 mr-3" />
                                <span>Imprimer le billet</span>
                            </button>

                            <button
                                onClick={() => {
                                    const emailSubject = `Billet pour ${event.title}`;
                                    const emailBody = `Voici mon billet pour l'événement ${event.title}. Référence: ${registration.reference}. Voir les détails: ${window.location.href}`;
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
                                            title: `Billet pour ${event.title}`,
                                            text: `Voici mon billet pour l'événement ${event.title}. Référence: ${registration.reference}`,
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
                                <span>Partager le billet</span>
                            </button>
                            {!isEventFree && (
                                <button
                                    onClick={() => window.location.href = route('evenements.facture.download', {
                                        slug: event.slug,
                                        reference: registration.reference
                                    })}
                                    className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                                >
                                    <FileText className="w-5 h-5 mr-3" />
                                    <span>Télécharger la facture</span>
                                </button>
                            )}
                        </div>

                        {/* Bouton d'annulation */}
                        {registration.can_be_cancelled && (
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Annulation
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Si vous ne pouvez pas assister à l'événement, vous pouvez annuler votre réservation jusqu'à 24 heures avant le début.
                                    {!isEventFree && ' Un remboursement sera effectué selon nos conditions générales.'}
                                </p>
                                <Link
                                    href={route('events.registration.cancel', { slug: event.slug, participant_id: registration.id })}
                                    method="delete"
                                    as="button"
                                    className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                                    preserveScroll
                                    preserveState
                                    confirm="Êtes-vous sûr de vouloir annuler votre réservation?"
                                    confirmText="Annuler ma réservation"
                                    cancelText="Conserver ma réservation"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    <span>Annuler ma réservation</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Prochains événements */}
                    {event.related_events && event.related_events.length > 0 && (
                        <div className="mt-10 print:hidden">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Autres événements qui pourraient vous intéresser
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {event.related_events.map((relatedEvent: any) => (
                                    <Link
                                        key={relatedEvent.id}
                                        href={route('evenements.details', relatedEvent.slug)}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={relatedEvent.featured_image?.original || '/assets/images/event-placeholder.jpg'}
                                                alt={relatedEvent.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                                <div className="text-white">
                                                    <div className="text-sm">{formatDate(relatedEvent.start_date, false)}</div>
                                                    <div className="font-medium">{relatedEvent.title}</div>
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

export default PaymentConfirmationPage;
