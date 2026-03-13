import type { AuthRegistrationGender } from '@/features/auth/domain/models';

export type TopCongoApiUser = {
  id: number | string;
  name: string;
  email: string | null;
  phone: string | null;
  gender: AuthRegistrationGender | null;
  role: string | null;
  created_at: string | null;
};

export type TopCongoAuthSuccessResponse = {
  token: string;
  user: TopCongoApiUser;
};

export type TopCongoValidationErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isTopCongoApiUser(value: unknown): value is TopCongoApiUser {
  return (
    isRecord(value) &&
    (typeof value.id === 'number' || typeof value.id === 'string') &&
    typeof value.name === 'string' &&
    ('email' in value ? value.email === null || typeof value.email === 'string' : true) &&
    ('phone' in value ? value.phone === null || typeof value.phone === 'string' : true) &&
    ('gender' in value ? value.gender === null || value.gender === 'male' || value.gender === 'female' : true) &&
    ('role' in value ? value.role === null || typeof value.role === 'string' : true) &&
    ('created_at' in value ? value.created_at === null || typeof value.created_at === 'string' : true)
  );
}

export function isTopCongoAuthSuccessResponse(value: unknown): value is TopCongoAuthSuccessResponse {
  return isRecord(value) && typeof value.token === 'string' && isTopCongoApiUser(value.user);
}

export function isTopCongoValidationErrorResponse(value: unknown): value is TopCongoValidationErrorResponse {
  return isRecord(value) && typeof value.message === 'string';
}
