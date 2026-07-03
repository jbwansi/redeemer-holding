// Types for Training models

export interface Training {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  price: number;
  is_published: boolean;
  lessons_count?: number;
  completed_lessons?: number;
  progress?: number;
  is_completed?: boolean;
  action_label?: string;
  action_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingSection {
  id: number;
  training_id: number;
  title: string;
  sort_order: number;
  lessons?: TrainingLesson[];
  quiz?: TrainingQuiz;
}

export interface TrainingLesson {
  id: number;
  training_id: number;
  training_section_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  video_url: string | null;
  video_duration: number | null;
  thumbnail: string | null;
  sort_order: number;
  is_free: boolean;
  is_published: boolean;
  resources?: TrainingResource[];
  progress?: TrainingProgress;
}

export interface TrainingResource {
  id: number;
  training_lesson_id: number;
  title: string;
  description: string | null;
  external_url: string | null;
  file_path: string | null;
  file_type: 'pdf' | 'video' | 'image' | 'document' | 'audio';
  is_downloadable: boolean;
  is_public: boolean;
  sort_order: number;
}

export interface TrainingProgress {
  id: number;
  user_id: number;
  training_id: number;
  training_lesson_id: number;
  completed: boolean;
  completed_at: string | null;
  progress_percentage: number;
}

export interface TrainingQuiz {
  id: number;
  training_id: number;
  training_section_id: number;
  title: string;
  passing_score: number;
  is_published: boolean;
}

export interface EditLessonProps {
  training: Training;
  section: TrainingSection;
  lesson: TrainingLesson;
}

export interface CreateLessonProps {
  training: Training;
  section: TrainingSection;
}

export interface EditResourceProps {
  training: Training;
  lesson: TrainingLesson;
  resource: TrainingResource;
}

export interface ResourceFormData {
  title: string;
  description: string;
  external_url: string;
  file: File | null;
  file_type: 'pdf' | 'video' | 'image' | 'document' | 'audio';
  is_downloadable: boolean;
  is_public: boolean;
  sort_order: number;
}
