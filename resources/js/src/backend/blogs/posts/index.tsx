// src/Pages/Posts/Index.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Newspaper } from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { DataTable } from '@/components/partials/posts-table';
import { Post } from '@/types/post';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  posts: Post[];
} & PageProps;

// On définit un layout par défaut
const Index = ({ posts }: Props) => {
  return (
    <>
      <Head title="Articles" />

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-slate-200">
                <Newspaper className="h-3.5 w-3.5" />
                Contenu éditorial
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Articles du blog</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Organisez vos publications et gardez une ligne éditoriale claire.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={route('posts.create')}>
                <Button className="h-11 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Nouvel article
                </Button>
              </Link>
              <Link href={route('posts.trash')}>
                <Button variant="destructive" className="h-11 rounded-xl">
                  <Trash className="mr-2 h-4 w-4" /> Corbeille
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total affiché</p>
              <p className="mt-1 text-2xl font-semibold">{posts.length}</p>
            </CardContent>
          </Card>
        </div>

        <DataTable data={posts} />
      </div>
    </>
  );
};

export default Index;
