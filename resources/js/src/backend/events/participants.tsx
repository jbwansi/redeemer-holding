import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Download, Mail, Phone, Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import DOMPurify from 'dompurify';
import { route } from 'ziggy-js';

const EventParticipants = ({ event, participants, meta }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredParticipants = participants.filter((participant) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return (
            participant.name.toLowerCase().includes(q) ||
            participant.email.toLowerCase().includes(q) ||
            participant.reference.toLowerCase().includes(q)
        );
    });

    const statusColors = {
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    };

    const statusLabels = {
        completed: "Payé",
        pending: "En attente",
        cancelled: "Annulé",
        in_progress: "En cours"
    };

    const getPaymentAmount = (participant) => {
        if (participant.status !== 'completed' || !event.price) return '-';
        const subtotal = event.price * participant.qty;
        const serviceFee = subtotal * 0.05;
        return `${(subtotal + serviceFee).toLocaleString('fr-CH')} CHF`;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Participants Événement</h1>
                        <p className="mt-2 text-white/80">
                            {event.title} • {event.participant_count} participant{event.participant_count > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl bg-white/10 border-white/25 text-white hover:bg-white/20" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <Button variant="outline" className="rounded-xl bg-white text-slate-900 hover:bg-slate-100" onClick={() => window.location.href = route('events.participants.export', event.slug)}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{event.participant_count}</div>
                        <div className="text-sm text-muted-foreground">Total participants</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {participants.filter(p => p.status === 'completed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Inscriptions confirmées</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {participants.filter(p => p.status === 'pending').length}
                        </div>
                        <div className="text-sm text-muted-foreground">En attente de paiement</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {event.max_participants - event.participant_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Places restantes</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Rechercher un participant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-xl"
                    />
                </div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {filteredParticipants.length} résultat{filteredParticipants.length > 1 ? 's' : ''}
                </div>
            </div>

            <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Participant</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Inscription</TableHead>
                                <TableHead>Paiement</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParticipants.map((participant) => (
                                <TableRow key={participant.id}>
                                    <TableCell>
                                        <div className="font-medium">{participant.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Ref: {participant.reference}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4" />
                                            <a href={`mailto:${participant.email}`} className="hover:underline">
                                                {participant.email}
                                            </a>
                                        </div>
                                        {participant.phone && (
                                            <div className="flex items-center gap-2 text-sm mt-1">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${participant.phone}`} className="hover:underline">
                                                    {participant.phone}
                                                </a>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {participant.qty} place{participant.qty > 1 ? 's' : ''}
                                            </Badge>
                                            <Badge className={statusColors[participant.status]}>
                                                {statusLabels[participant.status]}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {new Date(participant.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {getPaymentAmount(participant)}
                                        </div>
                                        {participant.payment_date && (
                                            <div className="text-sm text-muted-foreground">
                                                Payé le {new Date(participant.payment_date).toLocaleDateString('fr-FR')}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    •••
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => window.location.href = route('events.participants.show', [event.slug, participant.id])}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Détails
                                                </DropdownMenuItem>
                                                {participant.status === 'completed' && (
                                                    <DropdownMenuItem onClick={() => window.location.href = route('events.participants.invoice', [event.slug, participant.reference])}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Facture
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredParticipants.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Aucun participant trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {meta.total > meta.per_page && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Affichage de {meta.from}-{meta.to} sur {meta.total} participants
                    </div>
                    <div className="flex items-center gap-2">
                        {meta.links.map((link: any, i: any) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                disabled={!link.url}
                                onClick={() => window.location.href = link.url}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(link.label || '') }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventParticipants;
