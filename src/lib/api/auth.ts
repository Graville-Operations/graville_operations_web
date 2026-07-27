import api from '@/lib/api';
import { API } from '@/lib/endpoints';

interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>(API.auth.forgotPassword, {
    email: email.trim().toLowerCase(),
  });
  return data.message;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>(API.auth.resetPassword, {
    email: email.trim().toLowerCase(),
    otp,
    new_password: newPassword,
  });
  return data.message;
}