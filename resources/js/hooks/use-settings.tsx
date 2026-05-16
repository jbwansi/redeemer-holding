import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings } from '../api/settings';
import { Settings } from '@/types/settings';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<Settings, Error>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
  };
};
