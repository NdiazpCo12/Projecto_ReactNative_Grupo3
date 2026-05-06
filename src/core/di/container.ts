import { authRepository } from '../../features/auth/data/repositories/authRepositoryImpl';
import { studentRepository } from '../../features/student/data/repositories/studentRepositoryImpl';
import { sessionStorage } from '../local/LocalPreferencesAsyncStorage';

export const container = {
  authRepository,
  studentRepository,
  localPreferences: sessionStorage,
};
