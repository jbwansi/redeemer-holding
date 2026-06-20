import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LessonsIndex = ({ training, sections = [] }: any) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Formation</p>
          <h1 className="text-2xl font-bold">{training.title}</h1>
        </div>

        <Button asChild>
          <Link
            href={route('trainings.lessons.create', {
              training: training.id,
            })}
          >
            Nouvelle leçon
          </Link>
        </Button>
      </div>

      {sections.map((section: any) => (
        <Card key={section.id}>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">
              📚 {section.title}
            </h2>

            <p className="text-slate-500 mb-4">
              {section.description}
            </p>

            {section.lessons?.map((lesson: any) => (
              <div
                key={lesson.id}
                className="border rounded-xl p-4 mb-3 flex justify-between items-center"
              >
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

                  <p className="text-sm text-slate-500">
                    Ordre : {lesson.sort_order}
                  </p>
                </div>

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
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LessonsIndex;