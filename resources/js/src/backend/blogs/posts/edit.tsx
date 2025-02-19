// src/Pages/Posts/Edit.tsx
import React from "react";
import { PageProps } from "@inertiajs/core";
import { Post } from "@/types/post";
import { Category } from "@/types/category";
import { PostForm } from "@/components/partials/post-form";

interface EditPostProps extends PageProps {
    post: Post;
    categories: Category[];
}

const Edit = ({ post, categories }: EditPostProps) => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Modifier l'article</h2>
                    <p className="text-muted-foreground">
                        Modifiez les informations de votre article
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <PostForm post={post} categories={categories} />
            </div>
        </div>
    );
};

export default Edit;
