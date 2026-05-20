import { authRepository } from '../../features/auth/data/repositories/authRepositoryImpl';
import { studentRepository } from '../../features/student/data/repositories/studentRepositoryImpl';
import { secureSessionStorage } from '../local/SecureSessionStorage';

export const container = {
  authRepository,
  studentRepository,
  localPreferences: secureSessionStorage,
};
