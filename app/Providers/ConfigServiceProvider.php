<?php

namespace App\Providers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class ConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void {}

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // configure smtp setting
        if (get_setting('host') != null) {
            $config = array(
                'status' => 1,
                'driver' => 'smtp',
                'host' => get_setting('host'),
                'port' => get_setting('port'),
                'username' => get_setting('username'),
                'password' => get_setting('password'),
                'encryption' => get_setting('encryption'),
                'from' => array('address' => get_setting('sender_email'), 'name' => get_setting('sender_name')),
                'sendmail' => '/usr/sbin/sendmail -bs',
                'pretend' => false,
            );
            Config::set('mail', $config);
        }

        // Configure session lifetime
        if (get_setting("session_lifetime") != null) {
            Config::set("session.lifetime", get_setting("session_lifetime"));
        }

        if(get_setting('default_timezone') != null) {
            Config::set('app.timezone', get_setting('default_timezone'));
            date_default_timezone_set(get_setting('default_timezone'));
        }
    }
}
