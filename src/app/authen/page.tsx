"use client";
import { LoginForm } from "@/components/authen/LoginForm";
import { RegisterForm } from "@/components/authen/RegisterForm";
import React, { useState } from "react";
import { Login, Register } from "@/lib/authentication";

enum AuthTab {
  LOGIN = "login",
  REGISTER = "register",
}

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  id_card: string;
  name: string;
  lastname: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const Authentication = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.LOGIN);

  const handleLoginSubmit = async (payload: LoginPayload) => {
    console.log(`${AuthTab.LOGIN} form submitted:`, payload);
    await Login(payload);
  };

  const handleRegisterSubmit = async (payload: RegisterPayload) => {
    console.log(`${AuthTab.REGISTER} form submitted:`, payload);
    await Register(payload);
  };

  return (
    <main className="flex p-8 justify-center">
      <div className="flex flex-col w-full items-center gap-4 py-10">
        <div className="w-1/3 p-8 bg-[#E5E5E5] rounded-md shadow-md space-y-6">
          {/* Toggle Tabs */}
          <div className="flex justify-center text-2xl font-semibold text-center rounded-md overflow-hidden">
            <button
              className={`w-1/2 p-2 ${
                activeTab === AuthTab.LOGIN
                  ? "bg-white text-blue-600"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setActiveTab(AuthTab.LOGIN)}
            >
              Login
            </button>
            <button
              className={`w-1/2 p-2 ${
                activeTab === AuthTab.REGISTER
                  ? "bg-white text-blue-600"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setActiveTab(AuthTab.REGISTER)}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div>
            <div className="text-2xl font-semibold">
              {activeTab === AuthTab.LOGIN ? "Sign In" : "Register"}
            </div>

            {activeTab === AuthTab.LOGIN ? (
              <LoginForm onSubmit={handleLoginSubmit} />
            ) : (
              <RegisterForm onSubmit={handleRegisterSubmit} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Authentication;
