import React from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, Trash, Plus, HelpCircle, GripVertical } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SortableLesson from './SortableLesson';

const SortableSection = ({
  section,
  training,
  openSections,
  toggleSection,
  deleteSection,
  deleteLesson,
}: any) => {
  const [lessons, setLessons] = React.useState(section.lessons || []);

  React.useEffect(() => {
    setLessons(section.lessons || []);
  }, [section.lessons]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lessonSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = lessons.findIndex((lesson: any) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson: any) => lesson.id === over.id);

    const newLessons = arrayMove(lessons, oldIndex, newIndex);

    setLessons(newLessons);

    router.post(
      route('trainings.sections.lessons.reorder', {
        training: training.id,
        section: section.id,
      }),
      {
        lessons: newLessons.map((lesson: any, index: number) => ({
          id: lesson.id,
          sort_order: index + 1,
        })),
      },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-xl border bg-white ${
        isDragging ? 'opacity-70 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4 border-b bg-slate-50/60 p-4">
        <div className="flex flex-1 gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab text-slate-400 hover:text-slate-700 active:cursor-grabbing"
            title="Déplacer le module"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-2 font-semibold text-slate-900"
              >
                <span>{openSections.includes(section.id) ? '▼' : '▶'}</span>
                {section.title}
              </button>

              <Badge variant={section.is_published ? 'default' : 'secondary'}>
                {section.is_published ? 'Publié' : 'Brouillon'}
              </Badge>
            </div>

            {section.description && (
              <p className="text-sm text-slate-500 mt-1">{section.description}</p>
            )}

            <p className="text-sm text-slate-500 mt-1">
              {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={route('trainings.sections.lessons.create', {
                training: training.id,
                section: section.id,
              })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Leçon
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link
              href={route('trainings.sections.quiz.edit', {
                training: training.id,
                section: section.id,
              })}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
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

          <Button variant="destructive" size="sm" onClick={() => deleteSection(section)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {openSections.includes(section.id) && (
        <div className="divide-y">
          {lessons.length > 0 ? (
            <DndContext
              sensors={lessonSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleLessonDragEnd}
            >
              <SortableContext
                items={lessons.map((lesson: any) => lesson.id)}
                strategy={verticalListSortingStrategy}
              >
                {lessons.map((lesson: any) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    section={section}
                    training={training}
                    deleteLesson={deleteLesson}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="p-4">
              <p className="text-sm text-slate-400">Aucune leçon dans ce module.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SortableSection;
