<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    public function uploadImage(UploadedFile $file, string $path, array $sizes = []): array
    {
        $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        $fullPath = $path . '/' . $filename;

        // Stocker l'image originale
        $file->storeAs($path, $filename, 'public');

        $images = [
            'original' => $fullPath
        ];

        // Générer les différentes tailles
        foreach ($sizes as $size => $dimensions) {
            $resizedImage = Image::make($file)
                ->fit($dimensions['width'], $dimensions['height'])
                ->encode($file->getClientOriginalExtension(), 90);

            $resizedPath = $path . '/' . $size . '_' . $filename;
            Storage::disk('public')->put($resizedPath, $resizedImage);

            $images[$size] = $resizedPath;
        }

        return $images;
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
}
