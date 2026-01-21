import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '@/lib/blink';

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useBlinkAuth();

  const login = () => {
    blink.auth.login(window.location.href);
  };

  const logout = () => {
    blink.auth.signOut();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
