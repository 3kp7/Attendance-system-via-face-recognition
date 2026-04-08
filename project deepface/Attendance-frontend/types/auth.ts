
export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface CurrentUserResponse {
  user: User | null;
}
export interface User {
  username: string;
  email?: string;
  full_name?: string;
  disabled?: boolean;
}
