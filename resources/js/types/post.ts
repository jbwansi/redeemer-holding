import { Category } from "./category";

// types/post.ts
export interface Post {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    published: boolean;
    published_at: string | null;
    user_id: number;
    created_at: string;
    updated_at: string;
    categories: Category[];
}

// Pour le DataTable
export type PostColumns = {
    id: string;
    title: string;
    excerpt: string;
    published: boolean;
    published_at: string;
    categories: string;
}

export interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    category_ids: number[];
    published: boolean;
    published_at: string | null;
    featured_image: File | null;
}
