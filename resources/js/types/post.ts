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
    tags: string[] | null;
}

// Pour le DataTable
export type PostColumns = {
    id: string;
    title: string;
    excerpt: string;
    published: boolean;
    published_at: string;
    categories: string;
};

export interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    category_ids: number[];
    published: boolean;
    published_at: string | null;
    featured_image: File | null;
}
export interface AuthorProps {
    name: string;
    avatar: string;
    bio: string;
}

export interface PostImageUrls {
    large: string;
    banner: string;
    medium: string;
    original: string;
    thumbnail: string;
}

export interface PostProps {
    id: number;
    slug: string;
    views: number;
    title: string;
    excerpt: string;
    publishedAt: string;
    readTime: string;
    category: string;
    coverImage: PostImageUrls;
    content: string;
    author: AuthorProps;

    tags: string[];
}

export interface PostResponse {
    data: PostProps[];
}
export interface SinglePostResponse {
    data: PostProps;
}
