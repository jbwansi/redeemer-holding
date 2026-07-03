import React from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, ArrowLeft } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SortableSection from '@/components/admin/trainings/SortableSection';

const SectionsIndex = ({ training, sections = [] }: any) => {
  const [openSections, setOpenSections] = React.useState<number[]>([]);
  const [orderedSections, setOrderedSections] = React.useState<any[]>(sections);

  React.useEffect(() => {
    setOrderedSections(sections);
  }, [sections]);

  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const toggleSection = (sectionId: number) => {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  };

  const totalSections = orderedSections.length;

  const totalLessons = orderedSections.reduce(
    (total: number, section: any) => total + (section.lessons?.length || 0),
    0
  );

  const publishedLessons = orderedSections.reduce(
    (total: number, section: any) =>
      total + (section.lessons?.filter((lesson: any) => lesson.is_published)?.length || 0),
    0
  );

  const draftLessons = totalLessons - publishedLessons;

  const deleteSection = (section: any) => {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      router.delete(
        route('trainings.sections.destroy', {
          training: training.id,
          section: section.id,
        })
      );
    }
  };

  const deleteLesson = (section: any, lesson: any) => {
    if (confirm('Voulez-vous vraiment supprimer cette leçon ?')) {
      router.delete(
        route('trainings.sections.lessons.destroy', {
          training: training.id,
          section: section.id,
          lesson: lesson.id,
        })
      );
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedSections.findIndex((section: any) => section.id === active.id);

    const newIndex = orderedSections.findIndex((section: any) => section.id === over.id);

    const newSections = arrayMove(orderedSections, oldIndex, newIndex);

    setOrderedSections(newSections);

    router.post(
      route('trainings.sections.reorder', {
        training: training.id,
      }),
      {
        sections: newSections.map((section: any, index: number) => ({
          id: section.id,
          sort_order: index + 1,
        })),
      },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Formation</p>
          <h1 className="text-2xl font-bold">{training.title}</h1>
          <p className="text-slate-500 mt-1">Constructeur de formation</p>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Modules</p>
            <p className="text-2xl font-bold">{totalSections}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Leçons</p>
            <p className="text-2xl font-bold">{totalLessons}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Leçons publiées</p>
            <p className="text-2xl font-bold">{publishedLessons}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Brouillons</p>
            <p className="text-2xl font-bold">{draftLessons}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          {orderedSections.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-slate-500 mb-4">Aucun module pour cette formation.</p>

              <Button asChild>
                <Link href={route('trainings.sections.create', training.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier module
                </Link>
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sectionSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={orderedSections.map((section: any) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {orderedSections.map((section: any) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      training={training}
                      openSections={openSections}
                      toggleSection={toggleSection}
                      deleteSection={deleteSection}
                      deleteLesson={deleteLesson}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionsIndex;
