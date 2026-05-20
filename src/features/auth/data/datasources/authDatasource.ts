import axios from 'axios';

import { robleConfig } from '../../../../config/robleConfig';
import { AuthSession, AuthUser } from '../../domain/entities/authUser';
import { secureSessionStorage } from '../../../../core/local/SecureSessionStorage';
import { normalizeDisplayText } from '../../../../utils/text';

type LoginBody = {
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<AuthUser>;
  message?: string | string[];
};

const jsonHeaders = { 'Content-Type': 'application/json; charset=UTF-8' };

const messageFrom = (body: unknown, fallback: string) => {
  const value = body as { message?: unknown };
  if (typeof value?.message === 'string' && value.message.trim()) {
    return normalizeDisplayText(value.message);
  }
  if (Array.isArray(value?.message)) {
    return normalizeDisplayText(value.message.join(', '));
  }
  return normalizeDisplayText(fallback);
};

export const defaultUserPassword = 'ThePassword!1';

export const isStudentRole = (role: string) => {
  const normalized = role.trim().toLowerCase();
  return (
    normalized === 'estudiante' ||
    normalized === 'student' ||
    normalized === 'alumno'
  );
};

export const authService = {
  async signIn(email: string, password = defaultUserPassword) {
    try {
      const response = await axios.post<LoginBody>(
        `${robleConfig.authBaseUrl}/login`,
        { email, password },
        { headers: jsonHeaders },
      );
      const user = response.data.user ?? {};
      const session: AuthSession = {
        accessToken: response.data.accessToken ?? '',
        refreshToken: response.data.refreshToken ?? '',
        user: {
          id: normalizeDisplayText(user.id ?? ''),
          email: normalizeDisplayText(user.email ?? ''),
          name: normalizeDisplayText(user.name ?? ''),
          role: normalizeDisplayText(user.role ?? ''),
        },
      };

      if (!session.accessToken || !session.refreshToken) {
        throw new Error('No fue posible iniciar sesión en este momento.');
      }

      await secureSessionStorage.saveTokens(
        session.accessToken,
        session.refreshToken,
      );
      await secureSessionStorage.saveUser(session.user);
      return session;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          messageFrom(error.response?.data, 'No se pudo iniciar sesión.'),
        );
      }
      throw error;
    }
  },

  async logout() {
    const token = await secureSessionStorage.getAccessToken();
    if (!token) {
      await secureSessionStorage.clearSession();
      return;
    }

    try {
      await axios.post(`${robleConfig.authBaseUrl}/logout`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      await secureSessionStorage.clearSession();
    }
  },

  async verifyToken() {
    const token = await secureSessionStorage.getAccessToken();
    if (!token) return false;
    try {
      const response = await axios.get(`${robleConfig.authBaseUrl}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  async refreshToken() {
    const refreshToken = await secureSessionStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await axios.post<LoginBody>(
        `${robleConfig.authBaseUrl}/refresh-token`,
        { refreshToken },
        { headers: jsonHeaders },
      );
      const accessToken = response.data.accessToken ?? '';
      const newRefreshToken = response.data.refreshToken ?? refreshToken;
      if (!accessToken) return false;
      await secureSessionStorage.saveTokens(accessToken, newRefreshToken);
      return true;
    } catch {
      return false;
    }
  },

  getStoredUser: secureSessionStorage.getUser,
  clearLocalSession: secureSessionStorage.clearSession,
};
