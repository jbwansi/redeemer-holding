// src/Pages/Posts/Edit.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { Post } from '@/types/post';
import { Category } from '@/types/category';
import { PostForm } from '@/components/partials/post-form';
import { ArrowLeft } from 'lucide-react';

interface EditPostProps extends PageProps {
  post: Post;
  categories: Category[];
}

const Edit = ({ post, categories }: EditPostProps) => {
  return (
    <>
      <Head title="Modifier un article" />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6">
          <Link
            href={route('posts.index')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux articles
          </Link>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Modifier l'article</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Mettez à jour les informations de publication.
          </p>
        </div>

        <div className="grid gap-6">
          <PostForm post={post} categories={categories} />
        </div>
      </div>
    </>
  );
};

export default Edit;
