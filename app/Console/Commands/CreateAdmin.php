<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Create an administrator through a controlled interactive prompt';

    public function handle(): int
    {
        $name = trim((string) $this->ask('Nom'));
        $email = strtolower(trim((string) $this->ask('Adresse email')));
        $password = (string) $this->secret('Mot de passe');
        $confirmation = (string) $this->secret('Confirmez le mot de passe');

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        if (!$this->confirm("Créer le compte administrateur {$email} ?")) {
            $this->warn('Création annulée.');

            return self::FAILURE;
        }

        $admin = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
            'is_active' => true,
        ]);

        if (!$admin->can('administer')) {
            $admin->delete();
            $this->error('Le compte n’a pas obtenu les permissions administrateur attendues.');

            return self::FAILURE;
        }

        $this->info('Compte administrateur créé avec succès.');

        return self::SUCCESS;
    }
}
