import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = {
  biometricLoginEnabled: 'biometricLoginEnabled',
};

export const biometricPreferences = {
  async isBiometricLoginEnabled() {
    return AsyncStorage.getItem(keys.biometricLoginEnabled).then(
      (value) => value === 'true',
    );
  },

  async setBiometricLoginEnabled(enabled: boolean) {
    await AsyncStorage.setItem(keys.biometricLoginEnabled, String(enabled));
  },

  async clearBiometricLoginEnabled() {
    await AsyncStorage.removeItem(keys.biometricLoginEnabled);
  },
};
