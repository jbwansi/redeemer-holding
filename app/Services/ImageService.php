<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    public function uploadImage(UploadedFile $file, string $path, array $sizes = []): array
    {
        // Validate file type
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \InvalidArgumentException('Invalid file type');
        }

        $extension = $this->getExtensionFromMime($file->getMimeType());
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $fullPath = $path . '/' . $filename;

        // Stocker l'image originale
        $file->storeAs($path, $filename, 'public');

        $images = [
            'original' => $fullPath
        ];

        // Fallback: when no image engine is available, keep only original file.
        if (!$this->canProcessImages()) {
            foreach (array_keys($sizes) as $size) {
                $images[$size] = $fullPath;
            }

            return $images;
        }

        // Générer les différentes tailles
        try {
            foreach ($sizes as $size => $dimensions) {
                $resizedImage = Image::make($file)
                    ->fit($dimensions['width'], $dimensions['height'])
                    ->encode($file->getClientOriginalExtension(), 90);

                $resizedPath = $path . '/' . $size . '_' . $filename;
                Storage::disk('public')->put($resizedPath, $resizedImage);

                $images[$size] = $resizedPath;
            }
        } catch (\Throwable $e) {
            // Do not block entity creation if the server cannot resize images.
            foreach (array_keys($sizes) as $size) {
                $images[$size] = $fullPath;
            }
        }

        return $images;
    }

    private function canProcessImages(): bool
    {
        return extension_loaded('gd') || extension_loaded('imagick');
    }

    public function deleteImages(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    public function generateImageVersions(): array
    {
        return [
            'thumbnail' => ['width' => 150, 'height' => 150],
            'medium' => ['width' => 400, 'height' => 300],
            'large' => ['width' => 800, 'height' => 600],
            'banner' => ['width' => 1200, 'height' => 400],
        ];
    }

    private function getExtensionFromMime(string $mime): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'jpg',
        };
    }
}
