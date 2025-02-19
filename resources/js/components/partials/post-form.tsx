import React from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, ImageIcon, Car, X } from "lucide-react";
import { Category } from "@/types/category";
import { Post } from "@/types/post";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import QuillEditor from "../ui/quill-editor";



interface PostFormProps {
    post?: Post;
    categories: Category[];
}

export function PostForm({ post, categories }: PostFormProps) {
    console.log(post?.featured_image);
    const [inputValue, setInputValue] = React.useState<string>('');
    const form = useForm<any>({
        title: post?.title ?? '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        featured_image: null as File | null,
        category_ids: post?.categories ?? [],
        published: post?.published ?? false,
        published_at: post?.published_at ? new Date(post?.published_at) : null,
        tags: post?.tags ?? [] as string[],
    });

    const [previewImage, setPreviewImage] = React.useState<string>(
        post?.featured_image ?? ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (post) {

            form.post(route('posts.update', post.id), {
                onSuccess: () => toast.success('Article mis à jour avec succès'),
                onError: () => toast.error('Une erreur est survenue')
            });
        } else {
            form.post(route('posts.store'), {
                onSuccess: () => toast.success('Article créé avec succès'),
                onError: () => toast.error('Une erreur est survenue')
            });
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                const newTags = [...form.data.tags, inputValue.trim()];
                form.setData('tags', newTags);
                setInputValue('');
            }
        }
    };
    const removeTag = (tagToRemove: string) => {
        const newTags = form.data.tags.filter((tag: string) => tag !== tagToRemove);
        form.setData('tags', newTags);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations principales</CardTitle>
                            <CardDescription>
                                Les informations essentielles de votre article
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre</Label>
                                <Input
                                    id="title"
                                    placeholder="Le titre de votre article"
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                    className={`h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-800 ${form.errors.title && "border-destructive"}`}
                                />
                                {form.errors.title && (
                                    <p className="text-sm text-destructive">{form.errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Extrait</Label>
                                <Textarea
                                    id="excerpt"
                                    placeholder="Un bref résumé de votre article"
                                    value={form.data.excerpt}
                                    onChange={e => form.setData('excerpt', e.target.value)}
                                    className={`h-32 px-4 rounded-xl bg-white/50 dark:bg-slate-800 ${form.errors.excerpt && "border-destructive"}`}
                                />
                                {form.errors.excerpt && (
                                    <p className="text-sm text-destructive">{form.errors.excerpt}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contenu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="write" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="write">Écrire</TabsTrigger>
                                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                                </TabsList>
                                <TabsContent value="write">
                                    <div className="space-y-2">
                                        {/* <Textarea
                                            placeholder="Le contenu de votre article..."
                                            value={form.data.content}
                                            onChange={e => form.setData('content', e.target.value)}
                                            className={cn(
                                                "min-h-[400px]",
                                                form.errors.content && "border-destructive"
                                            )}
                                        />
                                        {form.errors.content && (
                                            <p className="text-sm text-destructive">{form.errors.content}</p>
                                        )} */}
                                    </div>
                                    <QuillEditor
                                        value={form.data.content}
                                        onChange={(value) => form.setData('content', value)}
                                        className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[400px] rounded-md"
                                        labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                                    />
                                </TabsContent>
                                <TabsContent value="preview">
                                    <div className="prose min-h-[400px] p-4 border rounded-md">
                                        <div dangerouslySetInnerHTML={{ __html: form.data.content }} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publication</CardTitle>
                            <CardDescription>
                                Paramètres de publication de l'article
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="published">Publier</Label>
                                <Switch
                                    id="published"
                                    checked={form.data.published}
                                    onCheckedChange={checked => {
                                        form.setData('published', checked);
                                        if (checked && !form.data.published_at) {
                                            form.setData('published_at', new Date());
                                        }
                                    }}
                                />
                            </div>

                            {form.data.published && (
                                <div className="space-y-2">
                                    <Label>Date de publication</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !form.data.published_at && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.data.published_at ? (
                                                    format(form.data.published_at, "PPP", { locale: fr })
                                                ) : (
                                                    <span>Choisir une date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.data.published_at ?? undefined}
                                                onSelect={(date: any) => form.setData('published_at', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Catégories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={form.data.category_ids[0]?.toString()}
                                onValueChange={(value) => {
                                    form.setData('category_ids', [parseInt(value)]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.category_ids && (
                                <p className="mt-2 text-sm text-destructive">{form.errors.category_ids}</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags <span className="text-xs text-muted-foreground">(Appuyez sur Entrée pour ajouter un tag...)</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">


                            <div className="border rounded-lg p-2 flex flex-wrap gap-2">
                                {form.data.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            type="button"
                                            className="hover:bg-primary/20 rounded-full"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="border-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                                    placeholder="Entrez le nom des différents intervenants   ou invités..."
                                />
                            </div>

                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Image à la une</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                                {previewImage ? (
                                    <div className="relative w-full aspect-video">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="rounded-lg object-cover w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-2">
                                            <Button type="button" variant="outline" onClick={() => {
                                                document.getElementById('featured_image')?.click();
                                            }}>
                                                Sélectionner une image
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <input
                                    id="featured_image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            form.setData('featured_image', file);
                                            setPreviewImage(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                            {form.errors.featured_image && (
                                <p className="text-sm text-destructive">{form.errors.featured_image}</p>
                            )}
                            {previewImage && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setPreviewImage('');
                                        form.setData('featured_image', null);
                                    }}
                                    className="w-full"
                                >
                                    Supprimer l'image
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button className=" h-12 w-full rounded-xl text-base font-medium hover:scale-105 transition-transform dark:bg-primary dark:text-white"
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('posts.index'))}
                        >
                            Annuler
                        </Button>
                        <Button className=" h-12 w-full rounded-xl text-base font-medium hover:scale-105 transition-transform dark:bg-primary dark:text-white"
                            type="submit"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {post ? 'Mise à jour...' : 'Création...'}
                                </>
                            ) : (
                                post ? 'Mettre à jour' : 'Créer'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
