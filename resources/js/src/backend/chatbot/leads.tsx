import React from 'react'
import DOMPurify from 'dompurify';
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Download, MessageCircle, Mail } from 'lucide-react'

type Lead = {
  id: number
  name: string | null
  email: string
  source: string
  created_at: string
}

type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

type LeadsProp = {
  data: Lead[]
  total: number
  from: number | null
  to: number | null
  per_page: number
  links: PaginationLink[]
}

const ChatbotLeads = ({ leads, filters }: { leads: LeadsProp; filters: { search?: string } }) => {
  const [search, setSearch] = React.useState(filters?.search ?? '')

  const onSearch = (value: string) => {
    setSearch(value)
    router.get(route('chatbot-leads.index'), { search: value || undefined }, { preserveState: true, replace: true })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leads Chatbot</h1>
            <p className="mt-2 text-white/80">Gerez les emails collectes par l'assistant visiteur.</p>
          </div>
          <div className="flex gap-2">
            <Link href={route('chatbot.edit')}>
              <Button variant="outline" className="rounded-xl bg-white/10 border-white/25 text-white hover:bg-white/20">
                <MessageCircle className="h-4 w-4 mr-2" />
                Config Chatbot
              </Button>
            </Link>
            <a href={route('chatbot-leads.export', { search: search || undefined })}>
              <Button className="rounded-xl bg-white text-slate-900 hover:bg-slate-100">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </a>
          </div>
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
        <CardContent className="p-4 space-y-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input className="pl-10 rounded-xl" placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => onSearch(e.target.value)} />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{leads.total} lead{leads.total > 1 ? 's' : ''}</div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.data.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.id}</TableCell>
                  <TableCell>{lead.name || '-'}</TableCell>
                  <TableCell>
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 hover:underline">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </a>
                  </TableCell>
                  <TableCell><Badge variant="outline">{lead.source}</Badge></TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleString('fr-FR')}</TableCell>
                </TableRow>
              ))}

              {leads.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    Aucun lead trouve.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {leads.total > leads.per_page && (
        <div className="flex items-center gap-2 justify-end">
          {leads.links.map((link, i) => (
            <Button
              key={i}
              variant={link.active ? 'default' : 'outline'}
              disabled={!link.url}
              onClick={() => link.url && router.visit(link.url)}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(link.label || '') }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatbotLeads
