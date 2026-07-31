export interface LoginResponse {
  token: string;
  token_type?: string;
  session_id?: string;
  account_type?: string;
  role?: string;
  expires_at: string;
  user_id: number;
}