// File validation utilities for training resources

export const MAX_FILE_SIZE = 52428800; // 50MB
export const ALLOWED_FILE_TYPES = ['pdf', 'video', 'image', 'document', 'audio'];

export const MIME_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, fileType: string): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier dépasse la taille maximale autorisée (50 Mo).`,
    };
  }

  // Check file type
  const allowedMimes = MIME_TYPES[fileType] || [];
  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `Le type de fichier n'est pas autorisé pour le type ${fileType}.`,
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
