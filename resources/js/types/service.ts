export interface Service {
  id: number;
  user_id: number;
  name: string;
  excerpt: string | null;
  content: string | null;
  icon: string;
  status: boolean;
  is_for_individuals: boolean;
  is_for_organizations: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  image?: string | null;
  featured_image?: string | null;
  tagline?: string | null;
  featured_note?: string | null;
  cta_primary_label?: string | null;
  cta_primary_url?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_url?: string | null;
  position?: number | null;
  ideal_for?: string[] | string | null;
}

export type ServiceColumns = {
  id: number;
  excerpt: string;
  name: string;
  icon: string;
  status: boolean;
};

export interface ServiceFormData {
  name: string;
  excerpt: string;
  content: string;
  icon: string;
  status: boolean;
}
