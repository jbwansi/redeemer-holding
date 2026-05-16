import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Training {
  title: string;
  slug: string;
  location: string;
  start_date: string;
  end_date: string;
  price: number;
}

interface Participant {
  name: string;
  email: string;
  phone: string;
  reference: string;
  status: 'completed' | 'pending' | 'cancelled' | 'in_progress';
  statusLabel: string;
  qty: number;
  formattedCreatedAt: string;
  formattedPaymentDate: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  canBeCancelled: boolean;
}

const TrainingParticipantDetails = ({
  formation,
  participant,
}: {
  formation: Training;
  participant: Participant;
}) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Détails de l'inscription à la formation</h1>
          <div className="text-sm text-muted-foreground">Référence: {participant.reference}</div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          {participant.status === 'completed' && (
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = route('trainings.participants.invoice', [
                  formation.slug,
                  participant.reference,
                ]))
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger la facture
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intrainings du participant */}
        <Card>
          <CardHeader>
            <CardTitle>Intrainings du participant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">{participant.name}</div>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${participant.email}`} className="hover:underline">
                  {participant.email}
                </a>
              </div>
              {participant.phone && (
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${participant.phone}`} className="hover:underline">
                    {participant.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="font-medium mb-2">Statut de l'inscription</div>
              <Badge className={statusColors[participant.status]}>{participant.statusLabel}</Badge>
              <div className="text-sm text-muted-foreground mt-2">
                Inscrit le {participant.formattedCreatedAt}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails de la formation */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la formation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <div className="font-medium">{formation.title}</div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Du {new Date(formation.start_date).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(formation.end_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  De{' '}
                  {new Date(formation.start_date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  à{' '}
                  {new Date(formation.end_date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{formation.location}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="font-medium mb-2">Places réservées</div>
              <Badge variant="secondary">
                {participant.qty} place{participant.qty > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Détails du paiement */}
        {formation.price > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Détails du paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sous-total</div>
                  <div className="font-medium">
                    {participant.subtotal.toLocaleString('fr-CH')} CHF
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Frais de service</div>
                  <div className="font-medium">
                    {participant.serviceFee.toLocaleString('fr-CH')} CHF
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="font-medium">{participant.total.toLocaleString('fr-CH')} CHF</div>
                </div>
              </div>

              {participant.status === 'completed' && participant.formattedPaymentDate && (
                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Payé le {participant.formattedPaymentDate}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions disponibles */}
        {participant.canBeCancelled && (
          <Card className="md:col-span-2 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <div className="font-medium text-red-600">Annulation possible</div>
                  <p className="text-sm text-red-600 mt-1">
                    Cette inscription peut encore être annulée jusqu'à 24h avant le début de la
                    formation.
                    {formation.price > 0 &&
                      participant.status === 'completed' &&
                      ' Un remboursement sera effectué automatiquement.'}
                  </p>
                  <Button
                    variant="destructive"
                    className="mt-4"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
                        // Logique d'annulation à implémenter
                      }
                    }}
                  >
                    Annuler l'inscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrainingParticipantDetails;
