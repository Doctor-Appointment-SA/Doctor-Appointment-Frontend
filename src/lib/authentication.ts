import { api } from "@/lib/api";
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UserPayload,
} from "@/type/authenticationType";
import axios from "axios";

// ================= authentication helper ================
export async function Login(payload: { username: string; password: string }) {
  try {
    const res = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      payload,
      { withCredentials: true }
    );
    const data = res.data;
    console.log("Login successful:", data);
    return data;
  } catch (e) {
    throw new Error("Login failed" + e);
  }
}

export async function Register(payload: {
  id_card: string;
  name: string;
  lastname: string;
  phone: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const res = await axios.post<RegisterResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      payload,
      { withCredentials: true }
    );
    const data = res.data;
    console.log("Register successful:", data);
    return data;
  } catch (e) {
    throw new Error("Register failed" + e);
  }
}

export async function whoami() {
  try {
    const access_token = getCookie("access_token");
    console.log("get access_token:", access_token);

    const res = await axios.get<UserPayload>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/whoami`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = res.data;
    console.log("whoami successful:", data);
    return data;
  } catch (e) {
    throw new Error("whoami failed" + e);
  }
}

export async function refreshToken() {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {}, // second argument is payload, not credential
      { withCredentials: true }
    ); // withCredentials tell browser to accept cookie header in response
    const data = res.data;
    const access_token = data.new_access_token;
    setCookie("access_token", access_token);

    console.log("refresh token successful:", data);
    return data;
  } catch (e) {
    throw new Error("refresh token failed" + e);
  }
}

// ================= cookie helper ================
export function setCookie(name: string, value: any) {
  const days = 1;
  const encoded = encodeURIComponent(JSON.stringify(value));
  const maxAge = days * 24 * 60 * 60; // seconds
  const secureFlag = location.protocol === "https:" ? "Secure;" : "";

  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAge}; ${secureFlag} SameSite=Strict`;
}

export function getCookie(name: string) {
  const match = document?.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return decodeURIComponent(match[2]);
  }
}
