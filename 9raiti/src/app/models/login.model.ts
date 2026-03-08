export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  email: string;
  role: string;
  token: string;
  expiration: string;
}

export interface LoginResult {
  success: boolean;
  isBlocked: boolean;
  token: string;
  role: string;
  expiration: string;
  message: string;
}
