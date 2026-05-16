import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit } from 'lucide-react';
import { Service } from '@/types/service';
import FormService from './form-service';

interface EditServiceProps {
  service?: Service;
}

const Edit = ({ service }: EditServiceProps) => {
  if (!service) {
    return null;
  }

  return (
    <>
      <Head title="Modifier le service" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href={route('services.show', service.id)}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au service
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Edit className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Modifier le service</h1>
              <p className="text-sm text-muted-foreground">{service.name}</p>
            </div>
          </div>
        </div>

        <FormService mode="edit" service={service} />
      </div>
    </>
  );
};

export default Edit;
