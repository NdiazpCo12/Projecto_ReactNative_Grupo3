import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthUser } from '../../features/auth/domain/entities/authUser';
import { normalizeDisplayText } from '../../utils/text';
import { LocalPreferences } from './LocalPreferences';

const keys = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
};

const normalizeUser = (user: AuthUser): AuthUser => ({
  id: normalizeDisplayText(user.id),
  email: normalizeDisplayText(user.email),
  name: normalizeDisplayText(user.name),
  role: normalizeDisplayText(user.role),
});

async function getSecureOrLegacyValue(key: string) {
  const secureValue = await SecureStore.getItemAsync(key);
  if (secureValue) return secureValue;

  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue) {
    await SecureStore.setItemAsync(key, legacyValue);
    await AsyncStorage.removeItem(key);
  }
  return legacyValue;
}

export const secureSessionStorage: LocalPreferences = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(keys.accessToken, accessToken),
      SecureStore.setItemAsync(keys.refreshToken, refreshToken),
    ]);
  },

  async getAccessToken() {
    return getSecureOrLegacyValue(keys.accessToken);
  },

  async getRefreshToken() {
    return getSecureOrLegacyValue(keys.refreshToken);
  },

  async saveUser(user: AuthUser) {
    await SecureStore.setItemAsync(keys.user, JSON.stringify(normalizeUser(user)));
    await AsyncStorage.removeItem(keys.user);
  },

  async getUser(): Promise<AuthUser | null> {
    const rawUser = await getSecureOrLegacyValue(keys.user);
    if (!rawUser) return null;
    try {
      return normalizeUser(JSON.parse(rawUser) as AuthUser);
    } catch {
      return null;
    }
  },

  async clearSession() {
    await Promise.all([
      SecureStore.deleteItemAsync(keys.accessToken),
      SecureStore.deleteItemAsync(keys.refreshToken),
      SecureStore.deleteItemAsync(keys.user),
      AsyncStorage.removeItem(keys.accessToken),
      AsyncStorage.removeItem(keys.refreshToken),
      AsyncStorage.removeItem(keys.user),
    ]);
  },
};
