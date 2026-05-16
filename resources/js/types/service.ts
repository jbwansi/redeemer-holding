export interface Service {
  id: number;
  user_id: number;
  name: string;
  excerpt: string | null;
  content: string | null;
  icon: string;
  status: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
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
