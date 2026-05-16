import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';
import { cn } from '@/lib/utils';

type IconPreset = 'media' | 'coaching' | 'mixed';

const MEDIA_OPTIONS = [
  { value: 'mic2', label: 'Micro' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'video', label: 'Video' },
  { value: 'headphones', label: 'Audio' },
  { value: 'radio', label: 'Radio' },
  { value: 'monitorPlay', label: 'Diffusion' },
  { value: 'audioLines', label: 'Waveform' },
  { value: 'volume2', label: 'Son' },
  { value: 'music2', label: 'Musique' },
  { value: 'camera', label: 'Camera' },
];

const COACHING_OPTIONS = [
  { value: 'userRound', label: 'Profil' },
  { value: 'users', label: 'Equipe' },
  { value: 'target', label: 'Objectif' },
  { value: 'star', label: 'Excellence' },
  { value: 'lightbulb', label: 'Idees' },
  { value: 'heart', label: 'Bien-etre' },
  { value: 'handshake', label: 'Partenariat' },
  { value: 'graduationCap', label: 'Training' },
  { value: 'lineChart', label: 'Progression' },
  { value: 'compass', label: 'Orientation' },
  { value: 'rocket', label: 'Croissance' },
  { value: 'award', label: 'Reussite' },
  { value: 'calendar', label: 'Planification' },
  { value: 'clock', label: 'Temps' },
  { value: 'messageCircle', label: 'Communication' },
  { value: 'sparkles', label: 'Innovation' },
  { value: 'shield', label: 'Confiance' },
  { value: 'briefcase', label: 'Business' },
  { value: 'workflow', label: 'Processus' },
  { value: 'zap', label: 'Energie' },
];

const ALL_OPTIONS = [...MEDIA_OPTIONS, ...COACHING_OPTIONS];

const PRESET_BUTTONS: Array<{ value: IconPreset; label: string }> = [
  { value: 'media', label: '2. Media/Creatif' },
  { value: 'coaching', label: '1. Coaching/Business' },
  { value: 'mixed', label: '3. Mixte' },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [preset, setPreset] = React.useState<IconPreset>('media');
  const normalizedValue = normalizeServiceIconName(value);
  const selectedOption = ALL_OPTIONS.find((option) => option.value === normalizedValue);

  const displayedOptions = React.useMemo(() => {
    if (preset === 'mixed') return ALL_OPTIONS;
    return preset === 'media' ? MEDIA_OPTIONS : COACHING_OPTIONS;
  }, [preset]);

  const safeOptions = React.useMemo(() => {
    if (!selectedOption) return displayedOptions;
    const exists = displayedOptions.some((option) => option.value === selectedOption.value);
    return exists ? displayedOptions : [selectedOption, ...displayedOptions];
  }, [displayedOptions, selectedOption]);

  const presetLabel = React.useMemo(() => {
    if (preset === 'media') return 'Media/Creatif';
    if (preset === 'coaching') return 'Coaching/Business';
    return 'Mixte';
  }, [preset]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Style d'icone</p>
        <p className="text-xs text-muted-foreground">Actif: {presetLabel}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PRESET_BUTTONS.map((button) => (
          <button
            key={button.value}
            type="button"
            onClick={() => setPreset(button.value)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all',
              preset === button.value
                ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                : 'border-input bg-background text-foreground/80 hover:bg-muted hover:text-foreground'
            )}
          >
            {button.label}
          </button>
        ))}
      </div>

      <Select value={normalizedValue} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-lg">
          <SelectValue placeholder="Selectionner une icone">
            <div className="flex items-center gap-2">
              {normalizedValue && <IconComponent name={normalizedValue} size={16} />}
              <span>{selectedOption?.label || 'Choisir une icone'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="h-72">
          {preset === 'mixed' ? (
            <>
              <SelectGroup>
                <SelectLabel>Media/Creatif</SelectLabel>
                {MEDIA_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent name={option.value} size={16} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Coaching/Business</SelectLabel>
                {COACHING_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent name={option.value} size={16} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          ) : (
            safeOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="flex items-center gap-2 py-2"
              >
                <div className="flex items-center gap-2">
                  <IconComponent name={option.value} size={16} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
