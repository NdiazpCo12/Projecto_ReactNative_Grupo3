import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AuthUser } from '../../models/auth';
import { authService, isStudentRole } from '../../services/authService';

type AuthContextValue = {
  user: AuthUser | null;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const storedUser = await authService.getStoredUser();
      const valid = await authService.verifyToken();
      if (mounted) {
        setUser(valid && storedUser && isStudentRole(storedUser.role) ? storedUser : null);
        setIsBootstrapping(false);
      }
    };
    restore();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      isSubmitting,
      async signIn(email: string) {
        setIsSubmitting(true);
        try {
          const session = await authService.signIn(email);
          if (!isStudentRole(session.user.role)) {
            await authService.clearLocalSession();
            throw new Error(
              'Este proyecto solo habilita el apartado de estudiante.',
            );
          }
          setUser(session.user);
        } finally {
          setIsSubmitting(false);
        }
      },
      async signOut() {
        await authService.logout();
        setUser(null);
      },
    }),
    [isBootstrapping, isSubmitting, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
};
