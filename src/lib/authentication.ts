import { api } from "@/lib/api";

type Login = {
  username: String;
  password: String;
};

type Register = {
  id_card: String;
  name: String;
  lastname: String;
  phone: String;
  password: String;
  confirmPassword: String;
};

export async function Login(payload: { username: string; password: string }) {
    try {
        const data = await api.post<Login>("/auth/login", payload);
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
        const data = await api.post<Register>("/auth/register", payload);
            console.log("Register successful:", data);
            return data;
    } catch (e) {
        throw new Error("Register failed" + e);
    }
}