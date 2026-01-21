import { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

export function useAuth() {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setIsLoading(state.isLoading);
      setIsAuthenticated(state.isAuthenticated);
    });

    return unsubscribe;
  }, []);

  const login = () => {
    blink.auth.login(window.location.href);
  };

  const logout = () => {
    blink.auth.logout();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
