export enum AuthTab {
  LOGIN = "login",
  REGISTER = "register",
}

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  user: UserPayload;
  access_token: string;
};

export type RegisterPayload = {
  id_card: string;
  name: string;
  lastname: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  access_token: string;
};

export type UserPayload = {
  id: string;
  id_card: string;
  name: string;
  lastname: string;
  phone: string;
  role: string;
  username: string;
  health_benefits: string[];
  createdAt: string | null;
};