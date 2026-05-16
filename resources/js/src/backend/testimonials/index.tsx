import { Head, Link, router } from '@inertiajs/react';

export default function Index({ testimonials }: any) {
  return (
    <>
      <Head title="Témoignages" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Témoignages</h1>

          <Link
            href={route('testimonials.create')}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Ajouter
          </Link>
        </div>

        <div className="bg-white shadow rounded">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Nom</th>
                <th className="p-3">Message</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {testimonials.map((t: any) => (
                <tr key={t.id} className="border-b">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.message}</td>
                  <td className="p-3 flex items-center gap-3">
                    {/* EDIT */}
                    <Link href={route('testimonials.edit', t.id)} className="text-blue-500">
                      Edit
                    </Link>

                    {/* ACCUEIL */}
                    <button
                      onClick={() => router.patch(route('testimonials.toggleHome', t.id))}
                      className={`rounded px-2 py-1 text-xs ${
                        t.position ? 'bg-red-600 text-white' : 'border'
                      }`}
                    >
                      {t.position ? `Accueil #${t.position}` : 'Accueil'}
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => {
                        if (confirm('Supprimer ce témoignage ?')) {
                          router.delete(route('testimonials.destroy', t.id));
                        }
                      }}
                      className="text-red-500"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => router.patch(route('testimonials.toggleFeatured', t.id))}
                      className={`rounded px-2 py-1 text-xs ${
                        t.is_featured ? 'bg-amber-500 text-white' : 'border'
                      }`}
                    >
                      {t.is_featured ? 'Mis en avant' : 'Mettre en avant'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
