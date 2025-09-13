"use client";
import { LoginForm } from "@/components/authen/LoginForm";
import { RegisterForm } from "@/components/authen/RegisterForm";
import React, { useState } from "react";
import { Login, Register } from "@/lib/authentication";

enum AuthTab {
  LOGIN = "login",
  REGISTER = "register",
}

const Authentication = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.LOGIN);

  const handleSubmit = async (payload: any) => {
    // payload = {username: "HN25000003", password: "mypassword"};
    // payload = {
    //   id_card: "1234567890129",
    //   name: "John4",
    //   lastname: "Doe",
    //   phone: "0890000000",
    //   password: "mypassword",
    //   confirmPassword: "mypassword",
    // };
    console.log(`${activeTab} form submitted:`, payload);

    if (activeTab === AuthTab.LOGIN) {
      Login(payload);
    } else {
      Register(payload);
    }
  };

  return (
    <main className="flex p-8 justify-center">
      <div className="flex flex-col w-full items-center gap-4 py-10">
        <div className="w-1/3 p-8 bg-[#E5E5E5] rounded-md shadow-md space-y-6">
          {/* Toggle Tabs */}
          <div className="flex justify-center text-2xl font-semibold text-center rounded-md overflow-hidden">
            <button
              className={`w-1/2 p-2 ${
                activeTab === "login"
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
              {activeTab === "login" ? "Sign In" : "Register"}
            </div>

            {activeTab === "login" ? (
              <LoginForm onSubmit={(data) => handleSubmit(data)} />
            ) : (
              <RegisterForm onSubmit={(data) => handleSubmit(data)} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Authentication;
