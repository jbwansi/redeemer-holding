<?php

use App\Providers\ConfigServiceProvider;

return [
    App\Providers\AppServiceProvider::class,
    Intervention\Image\ImageServiceProvider::class,
    ConfigServiceProvider::class,
];
