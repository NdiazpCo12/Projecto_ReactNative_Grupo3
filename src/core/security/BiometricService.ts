import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

type BiometricAvailability = {
  available: boolean;
  enrolled: boolean;
  label: string;
  reason?: string;
  types: LocalAuthentication.AuthenticationType[];
};

const labelFromTypes = (types: LocalAuthentication.AuthenticationType[]) => {
  if (Platform.OS === 'ios') {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
  }

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'verificacion facial';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'huella digital';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'verificacion biometrica';
};

const messageFromError = (error?: LocalAuthentication.LocalAuthenticationError) => {
  switch (error) {
    case 'not_enrolled':
      return 'Configura la biometria del dispositivo para usar esta opcion.';
    case 'not_available':
      return 'Este dispositivo no tiene biometria disponible.';
    case 'passcode_not_set':
      return 'Configura un codigo de bloqueo en el dispositivo para usar biometria.';
    case 'lockout':
      return 'La biometria esta bloqueada temporalmente. Intenta con el login normal.';
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
      return 'Autenticacion cancelada.';
    case 'authentication_failed':
      return 'No se pudo validar la biometria.';
    default:
      return 'No fue posible validar la biometria.';
  }
};

export const biometricService = {
  async getAvailability(): Promise<BiometricAvailability> {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    if (!hasHardware) {
      return {
        available: false,
        enrolled,
        label: 'verificacion biometrica',
        reason: 'Este dispositivo no tiene biometria disponible.',
        types,
      };
    }

    if (!enrolled) {
      return {
        available: false,
        enrolled,
        label: labelFromTypes(types),
        reason: 'Configura Face ID, Touch ID o huella en el dispositivo.',
        types,
      };
    }

    return {
      available: true,
      enrolled,
      label: labelFromTypes(types),
      types,
    };
  },

  async authenticate(promptMessage = 'Valida tu identidad') {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar codigo',
      biometricsSecurityLevel: 'strong',
    });

    if (result.success) {
      return { success: true as const };
    }

    return {
      success: false as const,
      error: result.error,
      message: messageFromError(result.error),
    };
  },
};
