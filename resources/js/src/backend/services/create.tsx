import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Plus } from 'lucide-react';
import FormService from './form-service';

export default function Create() {
  return (
    <>
      <Head title="Nouveau service" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href={route('services.index')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Nouveau service</h1>
              <p className="text-sm text-muted-foreground">
                Créez un nouveau service visible sur votre site
              </p>
            </div>
          </div>
        </div>

        <FormService mode="create" />
      </div>
    </>
  );
}
