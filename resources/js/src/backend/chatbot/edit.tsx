import React from 'react'
import { useForm } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface FaqItem { question: string; answer: string }

interface Meta {
  enabled: boolean
  title: string
  welcome_message: string
  quick_questions: string[]
  lead_capture_enabled: boolean
  lead_prompt: string
  faqs: FaqItem[]
}

interface Page {
  id: number
  title: string
  content: string
  meta: Meta | null
}

const defaultMeta: Meta = {
  enabled: true,
  title: 'Assistant Redeemer',
  welcome_message: 'Bonjour. Je suis l\'assistant Redeemer. Je peux vous aider 24h/24 sur les formations, evenements, services et contacts.',
  quick_questions: [
    'Quelles formations sont disponibles ?',
    'Comment participer a un evenement ?',
    'Comment vous contacter ?',
  ],
  lead_capture_enabled: true,
  lead_prompt: 'Laissez votre email pour etre recontacte rapidement.',
  faqs: [],
}

const ChatbotEdit = ({ page }: { page: Page }) => {
  const { data, setData, put, processing } = useForm<any>({
    title: page.title,
    content: page.content ?? '',
    meta: page.meta ?? defaultMeta,
  })

  const m: Meta = (data.meta ?? defaultMeta) as Meta
  const setMeta = (patch: Partial<Meta>) => setData('meta', { ...m, ...patch })

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chatbot</h1>
        <p className="text-muted-foreground">Configurez l\'assistant visiteur 24h/24</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); put('/dashboard/chatbot') }} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border p-3">
              <input type="checkbox" checked={Boolean(m.enabled)} onChange={e => setMeta({ enabled: e.target.checked })} className="h-4 w-4" />
              <Label className="mb-0">Activer le chatbot</Label>
            </div>
            <div>
              <Label className="mb-2">Titre</Label>
              <Input value={m.title} onChange={e => setMeta({ title: e.target.value })} />
            </div>
            <div>
              <Label className="mb-2">Message d'accueil</Label>
              <Textarea rows={3} value={m.welcome_message} onChange={e => setMeta({ welcome_message: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions rapides</CardTitle>
            <Button type="button" size="sm" onClick={() => setMeta({ quick_questions: [...m.quick_questions, ''] })}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.quick_questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input value={q} onChange={e => setMeta({ quick_questions: m.quick_questions.map((x, idx) => idx === i ? e.target.value : x) })} />
                <Button type="button" variant="ghost" size="sm" onClick={() => setMeta({ quick_questions: m.quick_questions.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capture de leads</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border p-3">
              <input type="checkbox" checked={Boolean(m.lead_capture_enabled)} onChange={e => setMeta({ lead_capture_enabled: e.target.checked })} className="h-4 w-4" />
              <Label className="mb-0">Activer la capture d'email</Label>
            </div>
            <div>
              <Label className="mb-2">Texte d'invitation</Label>
              <Input value={m.lead_prompt} onChange={e => setMeta({ lead_prompt: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>FAQ fallback</CardTitle>
            <Button type="button" size="sm" onClick={() => setMeta({ faqs: [...m.faqs, { question: '', answer: '' }] })}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {m.faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => setMeta({ faqs: m.faqs.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                <Input placeholder="Question" value={faq.question} onChange={e => setMeta({ faqs: m.faqs.map((x, idx) => idx === i ? { ...x, question: e.target.value } : x) })} />
                <Textarea rows={3} placeholder="Reponse" value={faq.answer} onChange={e => setMeta({ faqs: m.faqs.map((x, idx) => idx === i ? { ...x, answer: e.target.value } : x) })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={processing} className="min-w-32">
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatbotEdit
