import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generatorsApi } from './api';
import { projectKeys } from '../projects/query-keys';
import { sceneKeys } from '../scenes/query-keys';

export const useGenerateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generatorsApi.generateVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

export const useGenerateMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generatorsApi.generateMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

export const useGenerateTTS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generatorsApi.generateTTS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sceneKeys.all('') });
    },
  });
};

export const useGenerateScript = () => {
  return useMutation({
    mutationFn: generatorsApi.generateScript,
  });
};
