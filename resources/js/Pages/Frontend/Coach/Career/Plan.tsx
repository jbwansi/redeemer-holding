import { Head, useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
interface Action {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  source: string;
}
interface Goal {
  id: number;
  title: string;
  progress: number;
  actions: Action[];
}
export default function Plan({ goal }: { goal: Goal }) {
  const form = useForm({ title: '', description: '', priority: 'medium', due_date: '' });
  return (
    <DashboardLayout title="Plan d’action" currentPage="coach">
      <Head title={`Plan — ${goal.title}`} />
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">
          {goal.title} — {goal.progress}%
        </h1>
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Ajouter une action manuelle</h2>
          <form
            className="grid gap-2 md:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.post(route('coach.career.actions.store', goal.id), {
                onSuccess: () => form.reset(),
              });
            }}
          >
            <Input
              placeholder="Action"
              value={form.data.title}
              onChange={(e) => form.setData('title', e.target.value)}
              required
            />
            <select
              className="rounded-md border p-2"
              value={form.data.priority}
              onChange={(e) => form.setData('priority', e.target.value)}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
            <Input
              type="date"
              value={form.data.due_date}
              onChange={(e) => form.setData('due_date', e.target.value)}
            />
            <Button>Ajouter</Button>
          </form>
        </Card>
        {goal.actions.map((a) => (
          <Card className="space-y-3 p-4" key={a.id}>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                defaultValue={a.title}
                onBlur={(e) => {
                  if (e.target.value !== a.title)
                    router.patch(route('coach.career.actions.update', [goal.id, a.id]), {
                      title: e.target.value,
                    });
                }}
              />
              <Input
                defaultValue={a.description || ''}
                placeholder="Description"
                onBlur={(e) => {
                  if (e.target.value !== (a.description || ''))
                    router.patch(route('coach.career.actions.update', [goal.id, a.id]), {
                      description: e.target.value,
                    });
                }}
              />
            </div>
            <p className="text-sm">
              {a.status} · {a.source === 'proposed' ? 'Suggestion Coach' : 'Action manuelle'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  router.patch(route('coach.career.actions.update', [goal.id, a.id]), {
                    status: a.status === 'completed' ? 'todo' : 'completed',
                  })
                }
              >
                {a.status === 'completed' ? 'Rouvrir' : 'Terminer'}
              </Button>
              <select
                className="rounded-md border p-2"
                value={a.priority}
                onChange={(e) =>
                  router.patch(route('coach.career.actions.update', [goal.id, a.id]), {
                    priority: e.target.value,
                  })
                }
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              <Input
                className="w-auto"
                defaultValue={a.due_date?.slice(0, 10) || ''}
                type="date"
                onBlur={(e) =>
                  router.patch(route('coach.career.actions.update', [goal.id, a.id]), {
                    due_date: e.target.value || null,
                  })
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
