import React from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Post } from "@/types/post";
import { PageProps } from "@inertiajs/core";
import { route } from "ziggy-js";
import { DataTable } from "@/components/partials/posts-table";

type Props = {
    posts: Post[];
} & PageProps;

// On définit un layout par défaut
const TrashPage = ({ posts }: Props) => {
    return (
        <div className="p-x py-2 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
                    <p className="text-muted-foreground">
                        Gérez les articles de votre blog
                    </p>
                </div>
                <div className="flex space-x-4">
                <Link href={route('posts.create')}>
                    <Button className=" h-12 rounded-xl text-base font-medium hover:scale-105 transition-transform dark:bg-primary dark:text-white">
                        <Plus className="mr-2 h-4 w-4" /> Nouvel article
                    </Button>
                </Link>
                <Link href={route('posts.trash')}>
                    <Button className=" h-12 rounded-xl bg-red-500 text-white text-base font-medium hover:scale-105 transition-transform dark:bg-red-500 dark:text-white">
                        <Trash className="mr-2 h-4 w-4" /> Corbeille
                    </Button>
                </Link>
                </div>
            </div>

            <DataTable data={posts} />
        </div>
    );
};


export default TrashPage;
