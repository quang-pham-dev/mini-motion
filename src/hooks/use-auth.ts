import { ERROR_MESSAGES } from '@/constants';
import { AuthContext } from '@/context/auth-context';
import { useContext } from 'react';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(ERROR_MESSAGES.AUTH_PROVIDER_MISSING);
  }
  return context;
}
