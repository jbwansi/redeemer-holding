import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Archive } from 'lucide-react';
import { Post } from '@/types/post';
import { PageProps } from '@inertiajs/core';
import { DataTable } from '@/components/partials/posts-table';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  posts: Post[];
} & PageProps;

// On définit un layout par défaut
const TrashPage = ({ posts }: Props) => {
  return (
    <>
      <Head title="Corbeille des articles" />
      <div className="space-y-6 p-6">
        <div className="rounded-2xl border bg-gradient-to-r from-rose-50/70 to-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-slate-200">
                <Archive className="h-3.5 w-3.5" />
                Zone de récupération
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Corbeille des articles</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Consultez et restaurez les contenus supprimés si nécessaire.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={route('posts.create')}>
                <Button className="h-11 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Nouvel article
                </Button>
              </Link>
              <Link href={route('posts.index')}>
                <Button variant="outline" className="h-11 rounded-xl">
                  Quitter la corbeille
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{posts.length} article(s) en corbeille.</p>
          </CardContent>
        </Card>

        <DataTable data={posts} />
      </div>
    </>
  );
};

export default TrashPage;
