import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2, RefreshCw, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const roleOptions = [
    { id: 'admin', name: 'Administrateur', value: 'admin' },
    { id: 'editor', name: 'Éditeur', value: 'editor' },
    { id: 'user', name: 'Utilisateur', value: 'user' },
];

const statusOptions = [
    { id: 'active', name: 'Actif', value: 'active' },
    { id: 'inactive', name: 'Inactif', value: 'inactive' },
    { id: 'banned', name: 'Banni', value: 'banned' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'user',
        status: 'active',
    });

    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let password = '';

        // S'assurer d'avoir au moins un caractère de chaque catégorie
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Majuscule
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minuscule
        password += '0123456789'[Math.floor(Math.random() * 10)]; // Chiffre
        password += '!@#$%^&*()_+'[Math.floor(Math.random() * 12)]; // Caractère spécial

        // Compléter avec des caractères aléatoires
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mélanger le mot de passe
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        setData(data => ({
            ...data,
            password: password,
            password_confirmation: password
        }));
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(data.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <>
            <Head title="Créer un utilisateur" />

            <div className="flex flex-col min-h-screen bg-background">
                {/* Header */}
                <div className="border-b">
                    <div className="flex h-16 items-center mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-1 items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-4"
                                asChild
                            >
                                <Link href={route('users.index')}>
                                    <ChevronLeft className="h-6 w-6" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    Créer un utilisateur
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Ajoutez un nouvel utilisateur au système
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 py-6">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de l'utilisateur</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                Nom complet
                                            </label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="John Doe"
                                                className={`h-12 px-4 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Adresse email
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder="john@example.com"
                                                className={`h-12 px-4 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                                    Mot de passe
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={data.password}
                                                        onChange={e => setData('password', e.target.value)}
                                                        className={`h-12 px-4 rounded-xl ${errors.password ? 'border-red-500' : ''} pr-28`}
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={copyToClipboard}
                                                        >
                                                            {copied ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={generatePassword}
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {errors.password && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2">
                                                    Confirmer le mot de passe
                                                </label>
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.password_confirmation}
                                                    onChange={e => setData('password_confirmation', e.target.value)}
                                                    className='h-12 px-4 rounded-xl'
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="role" className="block text-sm font-medium mb-2">
                                                    Rôle
                                                </label>
                                                <Select
                                                    value={data.user_type}
                                                    onValueChange={(value) => setData('user_type', value)}
                                                >
                                                    <SelectTrigger className={`h-12 px-4 rounded-xl ${errors.user_type ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Sélectionnez un rôle" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roleOptions.map((option) => (
                                                            <SelectItem
                                                                key={option.id}
                                                                value={option.value}
                                                            >
                                                                {option.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.user_type && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.user_type}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium mb-2">
                                                    Statut
                                                </label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) => setData('status', value)}
                                                >
                                                    <SelectTrigger className={`h-12 px-4 rounded-xl ${errors.status ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Sélectionnez un statut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((option) => (
                                                            <SelectItem
                                                                key={option.id}
                                                                value={option.value}
                                                            >
                                                                {option.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            type="button"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Créer l'utilisateur
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
