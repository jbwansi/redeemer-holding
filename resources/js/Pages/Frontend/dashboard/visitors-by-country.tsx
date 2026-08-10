import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

const VisitorsByCountry = () => {
  const { auth } = usePage().props as any;

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // Ne rien afficher si ce n'est pas un admin
  if (auth?.can?.administer !== true) {
    return null;
  }

  useEffect(() => {
    fetch('/api/analytics/countries')
      .then((res) => res.json())
      .then((countries) => {
        setData(countries);

        setTotal(countries.reduce((sum: number, c: any) => sum + Number(c.users), 0));
      });
  }, []);

  if (!data.length) {
    return <div>Chargement des statistiques visiteurs…</div>;
  }

  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4">Visiteurs par pays (30 derniers jours)</h3>

      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Pays</th>
            <th className="text-left py-2">Visiteurs</th>
            <th className="text-left py-2">%</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row: any) => (
            <tr key={row.country}>
              <td className="py-1">{row.country}</td>
              <td className="py-1">{row.users}</td>
              <td className="py-1">
                {total > 0 ? ((row.users / total) * 100).toFixed(1) : '0.0'} %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorsByCountry;
