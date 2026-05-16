import React from 'react';
import { Card } from '@/components/ui/card';
import FrontLayout from '@/components/frontend/layouts/front-layout';

const PrivacyPolicy = () => {
  return (
    <FrontLayout>
      <div className="container mx-auto px-4 py-12 pt-32">
        <Card className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead mb-8">
              Chez Redeemer Holding, nous accordons une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité explique comment nous
              collectons, utilisons et protégeons vos intrainings.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Collecte des données</h2>
              <p>Nous collectons les intrainings suivantes lorsque vous utilisez nos services :</p>
              <ul>
                <li>Intrainings d'identification (nom, prénom)</li>
                <li>Coordonnées de contact (adresse email, numéro de téléphone)</li>
                <li>Intrainings de paiement (traitées de manière sécurisée par Stripe)</li>
                <li>Données de participation aux événements</li>
                <li>Intrainings techniques (adresse IP, données de navigation)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Gérer votre inscription aux événements</li>
                <li>Vous envoyer des confirmations et intrainings importantes</li>
                <li>Traiter vos paiements</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données
                contre tout accès, modification, divulgation ou destruction non autorisés. Ces
                mesures incluent :
              </p>
              <ul>
                <li>Le chiffrement des données sensibles</li>
                <li>Des protocoles de sécurité avancés</li>
                <li>Des accès restreints aux données personnelles</li>
                <li>La formation régulière de notre personnel à la sécurité</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Conservation des données</h2>
              <p>Nous conservons vos données personnelles aussi longtemps que nécessaire pour :</p>
              <ul>
                <li>Fournir nos services</li>
                <li>Respecter nos obligations légales</li>
                <li>Résoudre d'éventuels litiges</li>
              </ul>
              <p>
                En général, les données liées aux événements sont conservées pendant une durée de 3
                ans après votre dernière participation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p>
                Notre site utilise des cookies pour améliorer votre expérience. Ces cookies sont
                utilisés pour :
              </p>
              <ul>
                <li>Maintenir votre session active</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation du site</li>
                <li>Sécuriser votre connexion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Partage des données</h2>
              <p>
                Nous ne partageons vos données qu'avec des tiers de confiance nécessaires à la
                fourniture de nos services :
              </p>
              <ul>
                <li>Stripe pour le traitement des paiements</li>
                <li>Nos prestataires d'hébergement sécurisé</li>
                <li>Nos services de messagerie pour l'envoi d'emails</li>
              </ul>
              <p>
                Ces partenaires sont tenus de respecter la confidentialité de vos données et ne
                peuvent pas les utiliser à d'autres fins.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
              <p>
                Pour toute question concernant cette politique ou pour exercer vos droits, vous
                pouvez nous contacter :
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout
                moment. Les modifications entrent en vigueur dès leur publication sur notre site.
                Nous vous informerons des changements importants par email.
              </p>
            </section>

            <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-CH')}</p>
            </div>
          </div>
        </Card>
      </div>
    </FrontLayout>
  );
};

export default PrivacyPolicy;
