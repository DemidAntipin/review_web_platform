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