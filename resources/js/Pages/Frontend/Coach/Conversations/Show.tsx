import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system_internal';
  content: string;
  structured_data?: { next_actions?: string[] };
}
interface Conversation {
  id: number;
  title: string;
  language: string;
  status: string;
  messages: Message[];
}
interface Document {
  id: number;
  type: string;
  original_name: string;
}
interface PageProps {
  flash?: { error?: string };
  [key: string]: unknown;
}
export default function Show({
  conversation,
  documents,
}: {
  conversation: Conversation;
  documents: Document[];
}) {
  const form = useForm({ content: '', document_ids: [] as number[] });
  const { flash } = usePage<PageProps>().props;
  return (
    <DashboardLayout title={conversation.title} currentPage="coach">
      <Head title={conversation.title} />
      <main className="mx-auto max-w-3xl space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-bold">{conversation.title}</h1>
          <p className="text-sm text-muted-foreground">
            Langue : {conversation.language.toUpperCase()}
          </p>
        </div>
        {flash?.error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {flash.error}
          </div>
        )}
        <div className="space-y-3">
          {conversation.messages
            .filter((m) => m.role !== 'system_internal')
            .map((m) => (
              <article
                className={`rounded p-4 ${m.role === 'user' ? 'bg-slate-100' : 'bg-red-50'}`}
                key={m.id}
              >
                <strong>{m.role === 'user' ? 'Vous' : 'Coach'}</strong>
                <p>{m.content}</p>
                {m.structured_data?.next_actions && (
                  <ul className="list-disc pl-5">
                    {m.structured_data.next_actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.post(route('coach.conversations.messages.store', conversation.id), {
              onSuccess: () => form.reset('content'),
            });
          }}
        >
          {documents.length > 0 && (
            <fieldset className="mb-3 space-y-2">
              <legend className="text-sm font-medium">Documents à inclure explicitement</legend>
              {documents.map((document) => (
                <label className="mr-4 inline-flex items-center gap-2 text-sm" key={document.id}>
                  <input
                    type="checkbox"
                    checked={form.data.document_ids.includes(document.id)}
                    onChange={(event) =>
                      form.setData(
                        'document_ids',
                        event.target.checked
                          ? [...form.data.document_ids, document.id]
                          : form.data.document_ids.filter((id) => id !== document.id)
                      )
                    }
                  />
                  {document.original_name}
                </label>
              ))}
            </fieldset>
          )}
          <Textarea
            value={form.data.content}
            onChange={(e) => form.setData('content', e.target.value)}
            placeholder="Écrivez votre message…"
          />
          <Button className="mt-2" disabled={form.processing || conversation.status === 'archived'}>
            Envoyer
          </Button>
        </form>
      </main>
    </DashboardLayout>
  );
}
