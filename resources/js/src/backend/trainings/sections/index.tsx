import React from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, Trash, Plus, ArrowLeft } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SectionsIndex = ({ training, sections = [] }: any) => {
  const deleteSection = (section: any) => {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      router.delete(route('trainings.sections.destroy', {
        training: training.id,
        section: section.id,
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Formation</p>
          <h1 className="text-2xl font-bold">{training.title}</h1>
          <p className="text-slate-500 mt-1">Gestion des modules</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={route('trainings.show', training.slug)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>

          <Button asChild>
            <Link href={route('trainings.sections.create', training.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un module
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {sections.length === 0 ? (
            <p className="text-slate-500">Aucun module pour cette formation.</p>
          ) : (
            <div className="space-y-4">
              {sections.map((section: any) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{section.title}</h2>

                      <Badge variant={section.is_published ? 'default' : 'secondary'}>
                        {section.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>

                    {section.description && (
                      <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                    )}

                    <p className="text-sm text-slate-500 mt-1">
                      Ordre : {section.sort_order} • {section.lessons_count || 0} leçon
                      {(section.lessons_count || 0) > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={route('trainings.sections.quiz.edit', {
                          training: training.id,
                          section: section.id,
                        })}
                      >
                        Quiz
                      </Link>
                    </Button>

                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={route('trainings.sections.edit', {
                          training: training.id,
                          section: section.id,
                        })}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSection(section)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionsIndex;