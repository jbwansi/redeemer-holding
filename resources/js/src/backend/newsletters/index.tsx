import React, { useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Users, UserCheck, TestTube2, Sparkles, Clock3, Upload } from 'lucide-react';
import { toast } from 'sonner';

type SegmentKey = 'newsletter_subscribers' | 'users' | 'event_participants' | 'formation_participants' | 'service_requests' | 'custom';

interface Props {
    segments: {
        newsletter_subscribers: number;
        users: number;
        event_participants: number;
        formation_participants: number;
        service_requests: number;
    };
    history: Array<{
        id: number;
        subject: string;
        status: 'queued' | 'sending' | 'completed' | 'failed';
        total_recipients: number;
        sent_count: number;
        failed_count: number;
        queued_at: string | null;
        started_at: string | null;
        completed_at: string | null;
        created_at: string;
    }>;
    unsubscribedCount: number;
    pendingSubscribersCount: number;
    confirmedSubscribersCount: number;
    pendingSubscribers: Array<{
        id: number;
        email: string;
        source: string | null;
        subscribed_at: string | null;
        confirmation_sent_at: string | null;
        created_at: string;
    }>;
    confirmedSubscribers: Array<{
        id: number;
        email: string;
        source: string | null;
        subscribed_at: string | null;
        confirmed_at: string | null;
        created_at: string;
    }>;
}

interface NewsletterForm {
    [key: string]: string | boolean | SegmentKey[];
    subject: string;
    headline: string;
    content: string;
    cta_text: string;
    cta_url: string;
    segments: SegmentKey[];
    custom_emails: string;
    test_mode: boolean;
    test_email: string;
    scheduled_at: string;
}

const segmentLabels: Record<Exclude<SegmentKey, 'custom'>, string> = {
    newsletter_subscribers: 'Abonnes newsletter',
    users: 'Utilisateurs',
    event_participants: 'Participants evenements',
    formation_participants: 'Participants formations',
    service_requests: 'Demandes de services',
};

export default function NewsletterIndex({
    segments,
    history,
    unsubscribedCount,
    pendingSubscribersCount,
    confirmedSubscribersCount,
    pendingSubscribers,
    confirmedSubscribers,
}: Props) {
    const { data, setData, post, processing, reset } = useForm<NewsletterForm>({
        subject: '',
        headline: '',
        content: '',
        cta_text: '',
        cta_url: '',
        segments: ['users'] as SegmentKey[],
        custom_emails: '',
        test_mode: false,
        test_email: '',
        scheduled_at: '',
    });

    const estimatedRecipients = useMemo(() => {
        const sum = data.segments.reduce((total, key) => {
            if (key === 'custom') {
                const count = (data.custom_emails || '')
                    .split(/[\s,;]+/)
                    .map((email) => email.trim())
                    .filter(Boolean).length;
                return total + count;
            }

            return total + (segments[key] || 0);
        }, 0);

        return sum;
    }, [data.segments, data.custom_emails, segments]);

    const toggleSegment = (key: SegmentKey, checked: boolean) => {
        const current = data.segments;

        if (checked) {
            if (!current.includes(key)) {
                setData('segments', [...current, key]);
            }
            return;
        }

        setData('segments', current.filter((segment) => segment !== key));
    };

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        post(route('admin.newsletters.send'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(data.test_mode ? 'Email de test envoye.' : 'Newsletter envoyee avec succes.');
                if (!data.test_mode) {
                    reset('subject', 'headline', 'content', 'cta_text', 'cta_url', 'custom_emails');
                }
            },
            onError: () => {
                toast.error('Impossible d envoyer la newsletter. Verifiez les champs et la configuration SMTP.');
            },
        });
    };

    const importUsersContacts = () => {
        router.post(route('newsletters.import-users'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contacts utilisateurs importes avec succes.'),
            onError: () => toast.error('Impossible d importer les contacts utilisateurs.'),
        });
    };

    return (
        <>
            <Head title="Newsletters" />

            <div className="p-6 space-y-6">
                <div className="rounded-2xl border bg-gradient-to-r from-sky-50 to-white p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">Newsletters</h1>
                            <p className="text-muted-foreground">
                                Creez, testez et envoyez vos campagnes depuis un espace unifie.
                            </p>
                        </div>
                        <Badge className="px-3 py-1 text-sm" variant="secondary">
                            <Sparkles className="h-4 w-4 mr-2" />
                            {estimatedRecipients} destinataires estimes
                        </Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="button" variant="outline" onClick={importUsersContacts}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importer les utilisateurs comme contacts
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-5">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Segments actifs</p>
                            <p className="mt-1 text-2xl font-semibold">{data.segments.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Abonnés confirmés</p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                {confirmedSubscribersCount}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">En attente de confirmation</p>
                            <p className="mt-1 text-2xl font-semibold text-orange-600">
                                {pendingSubscribersCount}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Desabonnes</p>
                            <p className="mt-1 text-2xl font-semibold text-amber-600">{unsubscribedCount}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Campagnes historiques</p>
                            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                                <Clock3 className="h-5 w-5 text-muted-foreground" />
                                {history.length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
                            <p className="text-muted-foreground">
                                {unsubscribedCount} contact(s) actuellement desabonne(s) des newsletters.
                            </p>
                            <p className="text-muted-foreground">
                                Les envois sont mis en file et traites en arriere-plan.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Nouveau message
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Objet</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="Ex: Nouveautes de ce mois"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="headline">Titre principal</Label>
                                        <Input
                                            id="headline"
                                            value={data.headline}
                                            onChange={(e) => setData('headline', e.target.value)}
                                            placeholder="Ex: Les actus qui vont vous inspirer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Contenu</Label>
                                    <Textarea
                                        id="content"
                                        rows={10}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Redigez votre newsletter ici..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cta_text">Texte du bouton (optionnel)</Label>
                                        <Input
                                            id="cta_text"
                                            value={data.cta_text}
                                            onChange={(e) => setData('cta_text', e.target.value)}
                                            placeholder="Lire l article"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cta_url">Lien du bouton (optionnel)</Label>
                                        <Input
                                            id="cta_url"
                                            value={data.cta_url}
                                            onChange={(e) => setData('cta_url', e.target.value)}
                                            placeholder="https://votre-site.com"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">Mode test</p>
                                            <p className="text-sm text-muted-foreground">Envoyer uniquement a une adresse de test.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={data.test_mode}
                                            onChange={(event) => setData('test_mode', event.target.checked)}
                                            className="h-4 w-4"
                                        />
                                    </div>

                                    {data.test_mode && (
                                        <div className="space-y-2">
                                            <Label htmlFor="test_email">Email de test</Label>
                                            <Input
                                                id="test_email"
                                                type="email"
                                                value={data.test_email}
                                                onChange={(e) => setData('test_email', e.target.value)}
                                                placeholder="test@exemple.com"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">Programmer l’envoi (optionnel)</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Laissez vide pour un envoi immédiat.
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing} className="min-w-44">
                                        {data.test_mode ? <TestTube2 className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                        {processing
                                            ? 'Traitement...'
                                            : data.test_mode
                                                ? 'Envoyer un test'
                                                : data.scheduled_at
                                                    ? 'Programmer la newsletter'
                                                    : 'Envoyer la newsletter'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Audience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(Object.keys(segmentLabels) as Array<Exclude<SegmentKey, 'custom'>>).map((key) => (
                                    <div key={key} className="flex items-center justify-between gap-3 rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{segmentLabels[key]}</p>
                                            <p className="text-xs text-muted-foreground">{segments[key]} email(s)</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={data.segments.includes(key)}
                                            onChange={(event) => toggleSegment(key, event.target.checked)}
                                            className="h-4 w-4"
                                        />
                                    </div>
                                ))}

                                <div className="rounded-md border p-3 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">Emails personnalises</p>
                                            <p className="text-xs text-muted-foreground">Ajoutez des emails manuels</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={data.segments.includes('custom')}
                                            onChange={(event) => toggleSegment('custom', event.target.checked)}
                                            className="h-4 w-4"
                                        />
                                    </div>

                                    {data.segments.includes('custom') && (
                                        <Textarea
                                            rows={4}
                                            value={data.custom_emails}
                                            onChange={(e) => setData('custom_emails', e.target.value)}
                                            placeholder="email1@exemple.com, email2@exemple.com"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Conseils
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>1. Verifiez votre configuration SMTP avant un envoi massif.</p>
                                <p>2. Commencez par un envoi en mode test.</p>
                                <p>3. Utilisez un objet court et explicite pour ameliorer le taux d ouverture.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnés confirmés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {confirmedSubscribers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucun abonné confirmé pour le moment.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {confirmedSubscribers.map((subscriber) => (
                                        <div key={subscriber.id} className="rounded-lg border p-3">
                                            <p className="font-medium">{subscriber.email}</p>
                                            <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                <p>Source : {subscriber.source || 'non définie'}</p>
                                                <p>
                                                    Abonné le :{' '}
                                                    {subscriber.subscribed_at
                                                        ? new Date(subscriber.subscribed_at).toLocaleString()
                                                        : '—'}
                                                </p>
                                                <p>
                                                    Confirmé le :{' '}
                                                    {subscriber.confirmed_at
                                                        ? new Date(subscriber.confirmed_at).toLocaleString()
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>En attente de confirmation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingSubscribers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucun abonnement en attente.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {pendingSubscribers.map((subscriber) => (
                                        <div key={subscriber.id} className="rounded-lg border p-3">
                                            <p className="font-medium">{subscriber.email}</p>
                                            <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                <p>Source : {subscriber.source || 'non définie'}</p>
                                                <p>
                                                    Inscrit le :{' '}
                                                    {subscriber.subscribed_at
                                                        ? new Date(subscriber.subscribed_at).toLocaleString()
                                                        : '—'}
                                                </p>
                                                <p>
                                                    Email de confirmation envoyé le :{' '}
                                                    {subscriber.confirmation_sent_at
                                                        ? new Date(subscriber.confirmation_sent_at).toLocaleString()
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historique des campagnes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucune campagne envoyee pour le moment.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="py-2 pr-3">Objet</th>
                                            <th className="py-2 pr-3">Statut</th>
                                            <th className="py-2 pr-3">Destinataires</th>
                                            <th className="py-2 pr-3">Succes</th>
                                            <th className="py-2 pr-3">Echecs</th>
                                            <th className="py-2">Cree le</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((campaign) => (
                                            <tr key={campaign.id} className="border-b">
                                                <td className="py-2 pr-3 font-medium">{campaign.subject}</td>
                                                <td className="py-2 pr-3">
                                                    <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                                                        {campaign.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-3">{campaign.total_recipients}</td>
                                                <td className="py-2 pr-3">{campaign.sent_count}</td>
                                                <td className="py-2 pr-3">{campaign.failed_count}</td>
                                                <td className="py-2">{new Date(campaign.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}