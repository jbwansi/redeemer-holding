export interface BlogInteractionSummary {
  likes_count: number;
  liked: boolean;
  ratings_count: number;
  rating_average: number | null;
  my_rating: number | null;
  comments_count: number;
}
export interface BlogComment {
  id: number;
  display_name: string;
  body: string;
  created_at: string;
}
export interface BlogCommentsPage {
  data: BlogComment[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
export interface BlogCommentPayload {
  comment_form_token: string;
  display_name?: string;
  body: string;
  website: string;
}
export interface BlogFormSession {
  token: string;
  receivedAt: number;
}
export interface BlogApiError {
  message: string;
  fields: Record<string, string>;
}
