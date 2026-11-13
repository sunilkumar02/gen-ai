/** User details returned by POST /auth/login. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};
