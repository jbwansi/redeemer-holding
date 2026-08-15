import { FormEvent, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Camera, CheckCircle2, Keyboard, TriangleAlert } from 'lucide-react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ScannerEvent = {
  slug: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  checked_in_places: number;
  confirmed_places: number;
};

type ScanResponse = {
  result: 'checked_in' | 'already_checked_in';
  message: string;
  participant: {
    name: string;
    reference: string;
    quantity: number;
    checked_in_at: string;
  };
};

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

const EventScanner = ({ event }: { event: ScannerEvent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const [ticketUrl, setTicketUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedInPlaces, setCheckedInPlaces] = useState(event.checked_in_places);

  const stopCamera = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const submitTicket = async (value: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setError(null);

    try {
      const response = await axios.post<ScanResponse>(route('events.check-in', event.slug), {
        ticket_url: value.trim(),
      });
      setResult(response.data);
      if (response.data.result === 'checked_in') {
        setCheckedInPlaces((count) => count + response.data.participant.quantity);
      }
      setTicketUrl('');
      stopCamera();
    } catch (requestError: unknown) {
      const responseData = axios.isAxiosError<{
        errors?: { ticket?: string[] };
        message?: string;
      }>(requestError)
        ? requestError.response?.data
        : undefined;
      setResult(null);
      setError(
        responseData?.errors?.ticket?.[0] ??
          responseData?.message ??
          'Impossible de valider ce billet.'
      );
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const startCamera = async () => {
    setError(null);
    const Detector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor })
      .BarcodeDetector;

    if (!Detector) {
      setError(
        'Le scanner caméra n’est pas disponible dans ce navigateur. Utilisez la saisie manuelle.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const detector = new Detector({ formats: ['qr_code'] });

      const detect = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            await submitTicket(codes[0].rawValue);
            return;
          }
        } catch {
          // Une image vidéo intermédiaire non lisible est normale pendant le scan.
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch {
      setError('Accès à la caméra refusé ou indisponible. Utilisez la saisie manuelle.');
      stopCamera();
    }
  };

  useEffect(() => () => stopCamera(), []);

  const handleSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    if (ticketUrl.trim()) void submitTicket(ticketUrl);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/70">Contrôle des entrées</p>
            <h1 className="mt-1 text-3xl font-bold">Scanner QR</h1>
            <p className="mt-2 text-white/80">
              {event.title} · {event.location}
            </p>
          </div>
          <Button asChild variant="outline" className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href={route('events.participants', event.slug)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Participants
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Scanner un billet</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-hidden rounded-xl bg-slate-950">
              <video
                ref={videoRef}
                muted
                playsInline
                className={`aspect-video w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div className="flex aspect-video items-center justify-center text-slate-400">
                  <Camera className="mr-2 h-6 w-6" /> Caméra inactive
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={cameraActive ? stopCamera : startCamera} disabled={processing}>
                <Camera className="mr-2 h-4 w-4" />
                {cameraActive ? 'Arrêter la caméra' : 'Démarrer la caméra'}
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 border-t pt-5">
              <label htmlFor="ticket-url" className="flex items-center text-sm font-medium">
                <Keyboard className="mr-2 h-4 w-4" /> Saisie manuelle de l’URL du billet
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="ticket-url"
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://…/billets/evenements/…?signature=…"
                  disabled={processing}
                />
                <Button type="submit" disabled={processing || !ticketUrl.trim()}>
                  {processing ? 'Validation…' : 'Valider l’entrée'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {checkedInPlaces} / {event.confirmed_places}
              </div>
              <p className="text-sm text-muted-foreground">places enregistrées</p>
            </CardContent>
          </Card>
          {result && (
            <Card
              className={result.result === 'checked_in' ? 'border-green-500' : 'border-amber-500'}
            >
              <CardContent className="space-y-2 pt-6">
                <CheckCircle2
                  className={`h-8 w-8 ${result.result === 'checked_in' ? 'text-green-600' : 'text-amber-600'}`}
                />
                <h3 className="font-semibold">{result.message}</h3>
                <p>{result.participant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {result.participant.quantity} place(s) · {result.participant.reference}
                </p>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-red-500">
              <CardContent className="flex gap-3 pt-6 text-red-700">
                <TriangleAlert className="h-5 w-5 shrink-0" /> <p>{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventScanner;
