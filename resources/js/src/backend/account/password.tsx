import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Monitor, Shield, XCircle } from 'lucide-react';
import AccountWrapper from './AccountWrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
}

interface Auth {
  user: User;
}

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  is_current_device: boolean;
  location: {
    city: string;
    country: string;
  } | null;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface Props {
  auth: Auth;
  flash: {
    success?: string;
  };
  errors: {
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  };
}

const PasswordUser: React.FC = ({ sessions }: any) => {
  const { auth, flash, errors } = usePage<any>().props;

  const { data, setData, post, processing, reset } = useForm<PasswordForm>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('profile.password.update'), {
      onSuccess: () => {
        reset('current_password', 'password', 'password_confirmation');
      },
    });
  };

  const terminateSession = (sessionId: string) => {
    post(route('profile.terminate-session', sessionId));
  };

  return (
    <AccountWrapper>
      {/* En-tête avec image de profil */}
      <div className="relative z-0 w-full px-4 pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-[#F8E1AF] to-[#F6CFCF] dark:from-[#bca981] dark:to-[#cbb4b4]" />

        <div className="relative z-10 mx-auto max-w-screen-2xl">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 pb-6 sm:pb-8 lg:pb-10">
            {/* Image de profil */}
            <div className="relative -mt-8 sm:-mt-12 lg:-mt-16 aspect-square w-24 sm:w-28 lg:w-32 xl:w-40 overflow-hidden rounded-full border-4 sm:border-6 border-white bg-gray-100 shadow-lg dark:border-gray-50">
              <img
                src={auth.user.profile_photo_path || '/default-avatar.png'}
                alt="Photo de profil"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Intrainings utilisateur */}
            <div className="sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-3 dark:text-gray-100">
                {auth.user.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{auth.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section mot de passe */}
            <div className="border rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold">Changement de mot de passe</h2>

              {flash.success && (
                <Alert className="mt-4 bg-green-50 dark:bg-green-900/20">
                  <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div>
                  <label className="block mb-2 font-semibold">Mot de passe actuel</label>
                  <Input
                    type="password"
                    value={data.current_password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setData('current_password', e.target.value)
                    }
                    className="h-12 px-4 rounded-xl w-full"
                  />
                  {errors.current_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Nouveau mot de passe</label>
                  <Input
                    type="password"
                    value={data.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setData('password', e.target.value)
                    }
                    className="h-12 px-4 rounded-xl w-full"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    Confirmer votre nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setData('password_confirmation', e.target.value)
                    }
                    className="h-12 px-4 rounded-xl w-full"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-40 h-12 rounded-xl text-base font-medium transition-transform hover:scale-105 dark:bg-primary dark:text-white"
                  >
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>

            {/* Section sessions */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Sessions actives</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Voici la liste de vos appareils connectés. Vous pouvez révoquer l'accès aux
                  sessions que vous ne reconnaissez pas.
                </p>
              </div>

              <div className="space-y-4">
                {sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {session.user_agent.split(') ')[0].split(' (')[0]}
                          {session.is_current_device && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Appareil actuel
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.location
                            ? `${session.location.city}, ${session.location.country}`
                            : 'Localisation inconnue'}
                          • {session.ip_address}
                        </div>
                        <div className="text-sm text-gray-500">
                          Dernière activité {session.last_activity}
                        </div>
                      </div>
                    </div>

                    {!session.is_current_device && (
                      <Button
                        onClick={() => terminateSession(session.id)}
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountWrapper>
  );
};

export default PasswordUser;
