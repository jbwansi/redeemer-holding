export interface Event {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    location: string;
    start_date: string;
    end_date: string;
    price: number;
    max_participants: number;
    featured_image: {
        thumbnail: string;
        medium: string;
        large: string;
        banner: string;
    };
    category: EventCategory;
    is_published: boolean;
    published_at: string;
}

export interface EventCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    events_count?: number;
}
