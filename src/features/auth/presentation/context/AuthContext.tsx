import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AuthUser } from '../../domain/entities/authUser';
import { authRepository } from '../../data/repositories/authRepositoryImpl';
import { isStudentRole } from '../../data/datasources/authDatasource';
import { biometricPreferences } from '../../../../core/local/BiometricPreferences';
import { biometricService } from '../../../../core/security/BiometricService';

type AuthContextValue = {
  user: AuthUser | null;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  isBiometricSubmitting: boolean;
  isBiometricLoginEnabled: boolean;
  isBiometricAvailable: boolean;
  canUseBiometricLogin: boolean;
  biometricLabel: string;
  biometricReason?: string;
  signIn: (email: string) => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
  enableBiometricLogin: () => Promise<void>;
  disableBiometricLogin: () => Promise<void>;
  refreshBiometricState: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricSubmitting, setIsBiometricSubmitting] = useState(false);
  const [isBiometricLoginEnabled, setIsBiometricLoginEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('verificacion biometrica');
  const [biometricReason, setBiometricReason] = useState<string | undefined>();
  const [hasStoredSession, setHasStoredSession] = useState(false);

  const loadBiometricState = useCallback(async () => {
    const [enabled, availability, storedUser] = await Promise.all([
      biometricPreferences.isBiometricLoginEnabled(),
      biometricService.getAvailability(),
      authRepository.getStoredUser(),
    ]);

    setIsBiometricLoginEnabled(enabled);
    setIsBiometricAvailable(availability.available);
    setBiometricLabel(availability.label);
    setBiometricReason(availability.reason);
    setHasStoredSession(Boolean(storedUser && isStudentRole(storedUser.role)));
  }, []);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const [storedUser, enabled, availability] = await Promise.all([
        authRepository.getStoredUser(),
        biometricPreferences.isBiometricLoginEnabled(),
        biometricService.getAvailability(),
      ]);
      const valid = await authRepository.verifyToken();
      const sessionIsValid = valid || (await authRepository.refreshToken());
      const storedStudent = Boolean(storedUser && isStudentRole(storedUser.role));
      if (mounted) {
        setIsBiometricLoginEnabled(enabled);
        setIsBiometricAvailable(availability.available);
        setBiometricLabel(availability.label);
        setBiometricReason(availability.reason);
        setHasStoredSession(storedStudent);
        setUser(
          sessionIsValid && storedUser && isStudentRole(storedUser.role) && !enabled
            ? storedUser
            : null,
        );
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
      isBiometricSubmitting,
      isBiometricLoginEnabled,
      isBiometricAvailable,
      canUseBiometricLogin:
        isBiometricLoginEnabled && isBiometricAvailable && hasStoredSession,
      biometricLabel,
      biometricReason,
      async signIn(email: string) {
        setIsSubmitting(true);
        try {
          const session = await authRepository.signIn(email);
          if (!isStudentRole(session.user.role)) {
            await authRepository.clearLocalSession();
            throw new Error(
              'Este proyecto solo habilita el apartado de estudiante.',
            );
          }
          setUser(session.user);
          setHasStoredSession(true);
        } finally {
          setIsSubmitting(false);
        }
      },
      async signInWithBiometrics() {
        setIsBiometricSubmitting(true);
        try {
          const enabled = await biometricPreferences.isBiometricLoginEnabled();
          if (!enabled) {
            throw new Error('Activa Biometric Verification desde Perfil primero.');
          }

          const availability = await biometricService.getAvailability();
          setIsBiometricAvailable(availability.available);
          setBiometricLabel(availability.label);
          setBiometricReason(availability.reason);
          if (!availability.available) {
            throw new Error(availability.reason ?? 'Biometria no disponible.');
          }

          const result = await biometricService.authenticate(
            `Ingresar con ${availability.label}`,
          );
          if (!result.success) {
            throw new Error(result.message);
          }

          const storedUser = await authRepository.getStoredUser();
          if (!storedUser || !isStudentRole(storedUser.role)) {
            await biometricPreferences.clearBiometricLoginEnabled();
            setIsBiometricLoginEnabled(false);
            setHasStoredSession(false);
            throw new Error('Inicia sesion con tus credenciales para activar biometria.');
          }

          const valid = await authRepository.verifyToken();
          const sessionIsValid = valid || (await authRepository.refreshToken());
          if (!sessionIsValid) {
            await authRepository.clearLocalSession();
            await biometricPreferences.clearBiometricLoginEnabled();
            setIsBiometricLoginEnabled(false);
            setHasStoredSession(false);
            throw new Error('Tu sesion expiro. Inicia sesion nuevamente.');
          }

          setUser(storedUser);
          setHasStoredSession(true);
        } finally {
          setIsBiometricSubmitting(false);
        }
      },
      async enableBiometricLogin() {
        setIsBiometricSubmitting(true);
        try {
          if (!user) {
            throw new Error('Inicia sesion antes de activar Biometric Verification.');
          }
          const availability = await biometricService.getAvailability();
          setIsBiometricAvailable(availability.available);
          setBiometricLabel(availability.label);
          setBiometricReason(availability.reason);
          if (!availability.available) {
            throw new Error(availability.reason ?? 'Biometria no disponible.');
          }

          const result = await biometricService.authenticate(
            `Activar ${availability.label}`,
          );
          if (!result.success) {
            throw new Error(result.message);
          }

          await biometricPreferences.setBiometricLoginEnabled(true);
          setIsBiometricLoginEnabled(true);
          setHasStoredSession(true);
        } finally {
          setIsBiometricSubmitting(false);
        }
      },
      async disableBiometricLogin() {
        await biometricPreferences.setBiometricLoginEnabled(false);
        setIsBiometricLoginEnabled(false);
      },
      refreshBiometricState: loadBiometricState,
      async signOut() {
        const biometricEnabled = await biometricPreferences.isBiometricLoginEnabled();
        if (biometricEnabled) {
          setUser(null);
          setHasStoredSession(true);
          return;
        }

        await authRepository.logout();
        setHasStoredSession(false);
        setUser(null);
      },
    }),
    [
      biometricLabel,
      biometricReason,
      hasStoredSession,
      isBiometricAvailable,
      isBiometricLoginEnabled,
      isBiometricSubmitting,
      isBootstrapping,
      isSubmitting,
      loadBiometricState,
      user,
    ],
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
