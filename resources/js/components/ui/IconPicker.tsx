// resources/js/Components/IconPicker.tsx
import React from 'react'
import {
    Music2,
    Radio,
    Mic2,
    Podcast,
    Video,
    Headphones,
    Music4,
    AudioLines,
    RadioTower,
    Speaker,
    MonitorPlay,
    Volume2
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ICONS = {
    Music2,
    Radio,
    Mic2,
    Podcast,
    Video,
    Headphones,
    Music4,
    AudioLines,
    RadioTower,
    Speaker,
    MonitorPlay,
    Volume2
}

type IconType = keyof typeof ICONS

interface IconPickerProps {
    value: string
    onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const SelectedIcon = value ? ICONS[value as IconType] : null

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une icône">
                    <div className="flex items-center gap-2">
                        {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
                        <span>{value || "Choisir une icône"}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {Object.entries(ICONS).map(([name, Icon]) => (
                    <SelectItem
                        key={name}
                        value={name}
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
