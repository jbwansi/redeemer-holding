// src/Pages/Posts/Create.tsx
import React from "react";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@inertiajs/core";
import { Category } from "@/types/category";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { PostForm } from "@/components/partials/post-form";
import { AlertCircle, ArrowLeft, Plus } from "lucide-react";

interface CreatePostProps extends PageProps {
    categories: Category[];
}

const Create = ({ categories }: CreatePostProps) => {

    return (
        <>
            <Head title="Créer un article" />
            <div className="p-6 space-y-6">
                <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6">
                    <Link
                        href={route('posts.index')}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux articles
                    </Link>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">Créer un article</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Préparez votre contenu et publiez un nouvel article.
                    </p>
                </div>

            {categories?.length === 0 && (
                <div className="rounded-lg border bg-amber-50 border-amber-200 shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900">
                                    Aucune catégorie disponible
                                </h3>
                                <p className="text-sm mt-1 text-amber-700">
                                    Vous devez créer une catégorie avant de pouvoir publier un article.
                                </p>
                            </div>
                            <Link
                                href={route('categories.index')}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-200 h-9 px-4 py-2"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Créer une catégorie
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {
                    categories?.length > 0 && (
                        <PostForm categories={categories} />
                    )
                }
            </div>
            </div>
        </>
    );
};

export default Create;
