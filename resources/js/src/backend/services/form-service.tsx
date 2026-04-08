// resources/js/Pages/MediaCategories/Form.tsx
import { useState } from "react";
import DOMPurify from 'dompurify';
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QuillEditor from "@/components/ui/quill-editor";
import { Service, ServiceFormData } from "@/types/service";
import { IconPicker } from "@/components/ui/IconPicker";
import { FileText, Palette, AlignLeft, Save, X } from "lucide-react";

interface Props {
    service?: Service;
    mode: "create" | "edit";
}

export default function FormService({ service, mode }: Props) {
    const [formData, setFormData] = useState<ServiceFormData | any>({
        name: service?.name ?? "",
        excerpt: service?.excerpt ?? "",
        content: service?.content ?? "",
        icon: service?.icon ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "create") {
            router.post(route("services.store"), formData);
        } else if (service) {
            router.put(route("services.update", service.id), formData);
        }
    };

    const safePreviewContent = DOMPurify.sanitize(formData.content || '');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity section */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Informations générales
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du service <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Consulting stratégique"
                            className="font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">
                            <span className="flex items-center gap-1.5">
                                <AlignLeft className="h-3.5 w-3.5" />
                                Résumé court
                            </span>
                        </Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            rows={3}
                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Un bref résumé de ce service (affiché dans les listes)"
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">Visible dans les cartes de liste et les aperçus.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Icon section */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        Icône
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <IconPicker
                        value={formData.icon}
                        onChange={icon => setFormData({ ...formData, icon })}
                    />
                </CardContent>
            </Card>

            {/* Content section */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlignLeft className="h-4 w-4 text-primary" />
                        Description détaillée
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="write" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="write">Écrire</TabsTrigger>
                            <TabsTrigger value="preview">Aperçu</TabsTrigger>
                        </TabsList>
                        <TabsContent value="write">
                            <QuillEditor
                                value={formData.content}
                                onChange={value => setFormData({ ...formData, content: value })}
                                className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[220px] rounded-md"
                                labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                            />
                        </TabsContent>
                        <TabsContent value="preview">
                            <div className="prose prose-sm min-h-[220px] p-4 border rounded-md bg-slate-50 dark:bg-slate-900/40">
                                {formData.content
                                    ? <div dangerouslySetInnerHTML={{ __html: safePreviewContent }} />
                                    : <p className="text-muted-foreground italic">Aucun contenu à prévisualiser.</p>
                                }
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(
                        mode === "edit" && service
                            ? route("services.show", service.id)
                            : route("services.index")
                    )}
                    className="gap-2"
                >
                    <X className="h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Créer le service" : "Enregistrer"}
                </Button>
            </div>
        </form>
    );
}
