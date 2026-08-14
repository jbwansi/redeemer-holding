import React from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { LEGAL_LAST_UPDATED } from '@/lib/legal';

const TermsAndConditions = () => {
  return (
    <FrontLayout>
      <Head title="Conditions générales">
        <meta
          name="description"
          content="Consultez les conditions générales applicables aux services, événements et paiements proposés par Redeemer Holding."
        />
      </Head>
      <div className="container mx-auto px-4 py-12 pt-32">
        <Card className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Conditions Générales</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead mb-8">
              Les présentes conditions générales régissent l'utilisation de la plateforme
              d'événements de Redeemer Holding et la participation aux événements organisés via
              celle-ci.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Objet et champ d'application</h2>
              <p>
                Ces conditions générales s'appliquent à l'ensemble des services proposés par
                Redeemer Holding sur sa plateforme d'événements. Elles régissent les relations entre
                :
              </p>
              <ul>
                <li>Redeemer Holding (ci-après "nous")</li>
                <li>Les participants aux événements (ci-après "vous")</li>
              </ul>
              <p>
                En utilisant notre plateforme ou en participant à nos événements, vous acceptez ces
                conditions générales dans leur intégralité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Inscription aux événements</h2>
              <p>
                La réservation de places pour nos événements est soumise aux conditions suivantes :
              </p>
              <ul>
                <li>L'inscription est nominative et non transférable</li>
                <li>Une inscription n'est validée qu'après confirmation du paiement</li>
                <li>Le nombre de places est limité et attribué selon l'ordre des réservations</li>
                <li>Nous nous réservons le droit de refuser une inscription</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Paiements</h2>
              <p>Concernant les paiements sur notre plateforme :</p>
              <ul>
                <li>Les prix sont indiqués en Francs Suisses (CHF), toutes taxes comprises</li>
                <li>Des frais de service de 5% sont appliqués sur chaque transaction</li>
                <li>Les paiements sont sécurisés et traités par Stripe</li>
                <li>Une facture est émise automatiquement après chaque paiement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Annulation et remboursement</h2>
              <h3 className="text-xl font-semibold mb-2">4.1 Annulation par le participant</h3>
              <ul>
                <li>Possible jusqu'à 24h avant l'événement</li>
                <li>
                  Remboursement intégral (hors frais de service) si annulation dans les délais
                </li>
                <li>Aucun remboursement pour une annulation tardive</li>
                <li>L'annulation doit être notifiée via la plateforme</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Annulation par l'organisateur</h3>
              <ul>
                <li>Remboursement intégral (incluant les frais de service)</li>
                <li>Notification par email au minimum 24h avant l'événement</li>
                <li>Possibilité de report de date selon les circonstances</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Responsabilités</h2>
              <h3 className="text-xl font-semibold mb-2">5.1 Nos responsabilités</h3>
              <ul>
                <li>Assurer le bon déroulement des événements</li>
                <li>Garantir la sécurité des participants pendant les événements</li>
                <li>Protéger les données personnelles des participants</li>
                <li>Communiquer tout changement important concernant un événement</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Vos responsabilités</h3>
              <ul>
                <li>Fournir des informations exactes lors de l'inscription</li>
                <li>Respecter les horaires et le règlement des événements</li>
                <li>Avoir un comportement approprié durant les événements</li>
                <li>Ne pas céder ou revendre votre place</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
              <p>
                Tous les contenus présents sur notre plateforme (textes, images, logos, etc.) sont
                protégés par les droits de propriété intellectuelle. Leur utilisation sans notre
                autorisation expresse est interdite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Protection des données</h2>
              <p>
                Le traitement de vos données personnelles est soumis à notre politique de
                confidentialité, disponible sur notre site. En acceptant ces conditions, vous
                acceptez également notre politique de confidentialité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Force majeure</h2>
              <p>
                Nous ne pourrons être tenus responsables en cas d'inexécution de nos obligations due
                à un cas de force majeure (catastrophe naturelle, épidémie, grève, etc.). Dans ces
                cas, nous nous engageons à :
              </p>
              <ul>
                <li>Informer rapidement les participants</li>
                <li>Proposer un report de l'événement si possible</li>
                <li>Procéder au remboursement si l'événement est annulé</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Droit applicable et juridiction</h2>
              <p>
                Les présentes conditions sont soumises au droit suisse. Tout litige relatif à leur
                interprétation ou leur exécution relève de la compétence exclusive des tribunaux de
                Fribourg, Suisse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p>
                Pour toute question concernant ces conditions générales, vous pouvez nous contacter
                :
              </p>
              <ul>
                <li>
                  Par email :{' '}
                  <a
                    href="mailto:jb.wansi@redeemerholding.com"
                    className="text-red-600 hover:underline"
                  >
                    jb.wansi@redeemerholding.com
                  </a>
                </li>
                <li>
                  Par téléphone :{' '}
                  <a href="tel:+41765821109" className="text-red-600 hover:underline">
                    +41 76 582 11 09
                  </a>
                </li>
                <li>Par courrier : Avenue Jean-Marie-Musy 5, 1700 Fribourg, Suisse</li>
              </ul>
            </section>

            <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <p>Dernière mise à jour : {LEGAL_LAST_UPDATED}</p>
            </div>
          </div>
        </Card>
      </div>
    </FrontLayout>
  );
};

export default TermsAndConditions;
