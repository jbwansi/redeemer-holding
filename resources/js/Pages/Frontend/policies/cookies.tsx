import React from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { LEGAL_LAST_UPDATED } from '@/lib/legal';
import { useCookieConsent } from '@/components/frontend/consent/cookie-consent-provider';

const CookiesPage = () => {
  const { openPreferences } = useCookieConsent();
  return (
    <FrontLayout>
      <Head title="Politique des cookies">
        <meta
          name="description"
          content="Consultez la politique de Redeemer Holding concernant l'utilisation des cookies sur le site."
        />
      </Head>
      <div className="container mx-auto px-4 py-12 pt-32">
        <Card className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Politique des cookies</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead mb-8">
              Cette politique explique les éléments stockés sur votre appareil et les services
              externes susceptibles d’être chargés lorsque vous utilisez le site Redeemer Holding.
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">1. Éléments nécessaires</h2>
              <p>
                La session Laravel, la protection CSRF et les préférences indispensables au
                fonctionnement et à la sécurité restent toujours actives. Ils permettent notamment
                l’authentification, l’envoi sécurisé des formulaires et la mémorisation du thème.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">2. Mesure d’audience</h2>
              <p>
                Google Analytics est optionnel et n’est chargé qu’après votre consentement à la
                catégorie Analytics. Un refus n’empêche pas la navigation ni l’utilisation des
                formulaires nécessaires.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">3. Médias externes</h2>
              <p>
                Les vidéos hébergées par YouTube ou Vimeo sont remplacées par un contenu local tant
                que vous n’avez pas autorisé les médias externes. Cette préférence est indépendante
                de la mesure d’audience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">4. Liens externes</h2>
              <p>
                Calendly et Google Maps sont proposés sous forme de liens. Aucun script, calendrier
                ou carte provenant de ces services n’est chargé avant que vous décidiez de suivre
                le lien. Le site externe applique ensuite sa propre politique de confidentialité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">5. Modifier vos choix</h2>
              <p>
                Vos choix sont conservés localement dans votre navigateur. Vous pouvez les modifier
                à tout moment depuis le lien « Gérer mes cookies » présent dans le pied de page ou
                avec le bouton ci-dessous.
              </p>
              <button type="button" onClick={openPreferences} className="ux-btn-primary mt-4">
                Gérer mes cookies
              </button>
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

export default CookiesPage;
