import React from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, GripVertical } from 'lucide-react';

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

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SortableLesson = ({ lesson, training }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-xl p-4 mb-3 flex justify-between items-center bg-white ${isDragging ? 'opacity-70 shadow-lg' : ''
        }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-slate-700 active:cursor-grabbing"
          title="Déplacer la leçon"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div>
          <Link
            href={route('trainings.lessons.show', {
              training: training.id,
              lesson: lesson.id,
            })}
            className="font-medium hover:text-red-600"
          >
            {lesson.title}
          </Link>

          <p className="text-sm text-slate-500">Ordre : {lesson.sort_order}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link
            href={route('trainings.lessons.edit', {
              training: training.id,
              lesson: lesson.id,
            })}
          >
            Modifier
          </Link>
        </Button>

        <Button size="sm" variant="outline" asChild>
          <Link
            href={route('trainings.lessons.resources.index', {
              training: training.id,
              lesson: lesson.id,
            })}
          >
            Ressources
          </Link>
        </Button>
      </div>
    </div>
  );
};

const LessonsSection = ({ training, section }: any) => {
  const [lessons, setLessons] = React.useState(section.lessons || []);

  React.useEffect(() => {
    setLessons(section.lessons || []);
  }, [section.lessons]);

  const sensors = useSensors(
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
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">📚 {section.title}</h2>

            {section.description && <p className="text-slate-500">{section.description}</p>}
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link
              href={route('trainings.lessons.create', {
                training: training.id,
                section: section.id,
              })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Leçon
            </Link>
          </Button>
        </div>

        {lessons.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={lessons.map((lesson: any) => lesson.id)}
              strategy={verticalListSortingStrategy}
            >
              {lessons.map((lesson: any) => (
                <SortableLesson key={lesson.id} lesson={lesson} training={training} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-slate-500">
            Aucune leçon dans ce module.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LessonsIndex = ({ training, sections = [] }: any) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Formation</p>
          <h1 className="text-2xl font-bold">{training.title}</h1>
          <p className="text-slate-500 mt-1">Gestion des leçons</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section: any) => (
          <LessonsSection key={section.id} training={training} section={section} />
        ))}
      </div>
    </div>
  );
};

export default LessonsIndex;
