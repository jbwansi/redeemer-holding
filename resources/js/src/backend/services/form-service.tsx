// resources/js/Pages/MediaCategories/Form.tsx
import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import QuillEditor from "@/components/ui/quill-editor"
import { Service, ServiceFormData } from "@/types/service"
import { IconPicker } from "@/components/ui/IconPicker"

interface Props {
    service?: Service
    mode: 'create' | 'edit'
}

export default function FormService({ service, mode }: Props) {
    const [formData, setFormData] = useState<ServiceFormData | any>({
        name: service?.name ?? '',
        excerpt: service?.excerpt ?? '',
        content: service?.content ?? '',
        icon: service?.icon ?? '',

    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (mode === 'create') {
            router.post(route('services.store'), formData)
        } else if (service) {
            router.put(route('services.update', service.id), formData)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {mode === 'create' ? 'Nouveau service' : 'Modifier le service'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                name: e.target.value
                            })}
                            placeholder="Nom du service"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Extrait</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            rows={5}
                            onChange={(e) => setFormData({
                                ...formData,
                                excerpt: e.target.value
                            })}
                            placeholder="Un bref résumé de ce service"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Icône</Label>
                        <IconPicker
                            value={formData.icon}
                            onChange={(icon) => setFormData({
                                ...formData,
                                icon
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contenu</Label>
                        <Tabs defaultValue="write" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="write">Écrire</TabsTrigger>
                                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                            </TabsList>
                            <TabsContent value="write">

                                <QuillEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData({
                                        ...formData,
                                        content: value
                                    })}
                                    className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[200px] rounded-md"
                                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                                />
                            </TabsContent>
                            <TabsContent value="preview">
                                <div className="prose min-h-[400px] p-4 border rounded-md">
                                    <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.cancel()}
                    >
                        Annuler
                    </Button>
                    <Button type="submit">
                        {mode === 'create' ? 'Créer' : 'Mettre à jour'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
