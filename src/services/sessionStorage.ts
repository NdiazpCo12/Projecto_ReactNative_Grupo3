import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthUser } from '../models/auth';

const keys = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
};

export const sessionStorage = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      AsyncStorage.setItem(keys.accessToken, accessToken),
      AsyncStorage.setItem(keys.refreshToken, refreshToken),
    ]);
  },

  async getAccessToken() {
    return AsyncStorage.getItem(keys.accessToken);
  },

  async getRefreshToken() {
    return AsyncStorage.getItem(keys.refreshToken);
  },

  async saveUser(user: AuthUser) {
    await AsyncStorage.setItem(keys.user, JSON.stringify(user));
  },

  async getUser(): Promise<AuthUser | null> {
    const rawUser = await AsyncStorage.getItem(keys.user);
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  },

  async clearSession() {
    await Promise.all([
      AsyncStorage.removeItem(keys.accessToken),
      AsyncStorage.removeItem(keys.refreshToken),
      AsyncStorage.removeItem(keys.user),
    ]);
  },
};
