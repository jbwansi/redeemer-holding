import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Edit, Trash, FileText, GripVertical } from 'lucide-react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SortableLesson = ({ lesson, section, training, deleteLesson }: any) => {
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
      className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 ${
        isDragging ? 'opacity-70 bg-white shadow-lg' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab text-slate-400 hover:text-slate-700 active:cursor-grabbing"
          title="Déplacer la leçon"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="mt-0.5 rounded-lg border bg-white p-2">
          <FileText className="h-4 w-4 text-slate-500" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">{lesson.title}</p>

            <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
              {lesson.is_published ? 'Publié' : 'Brouillon'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link
            href={route('trainings.sections.lessons.edit', {
              training: training.id,
              section: section.id,
              lesson: lesson.id,
            })}
          >
            <Edit className="h-4 w-4" />
          </Link>
        </Button>

        <Button variant="destructive" size="sm" onClick={() => deleteLesson(section, lesson)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortableLesson;
