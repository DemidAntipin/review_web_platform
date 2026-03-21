export interface User {
  id: number;
  username: string;
  email: string;
  role: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: number;
}