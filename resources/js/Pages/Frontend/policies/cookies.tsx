import React from 'react';
import { Card } from '@/components/ui/card';
import FrontLayout from '@/components/frontend/layouts/front-layout';

const CookiesPage = () => {
  return (
    <FrontLayout>
      <div className="container mx-auto px-4 py-12 pt-32">
        <Card className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Politique des cookies</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead mb-8">
              Chez Redeemer Holding, nous accordons une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité explique comment nous
              collectons, utilisons et protégeons vos intrainings.
            </p>
            <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-CH')}</p>
            </div>
          </div>
        </Card>
      </div>
    </FrontLayout>
  );
};

export default CookiesPage;
