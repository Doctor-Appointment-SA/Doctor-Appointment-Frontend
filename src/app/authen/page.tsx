"use client";
import { LoginForm } from "@/components/authen/LoginForm";
import { RegisterForm } from "@/components/authen/RegisterForm";
import React, { useEffect, useState } from "react";
import { getCookie, Login, refreshToken, Register, setCookie, whoami } from "@/lib/authentication";
import { AuthTab, LoginPayload, RegisterPayload } from "@/type/authenticationType";

const Authentication = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.LOGIN);

  const handleLoginSubmit = async (payload: LoginPayload) => {
    console.log(`${AuthTab.LOGIN} form submitted:`, payload);
    const data = await Login(payload);

    console.log("data acc", data.access_token)
    setCookie("access_token", data.access_token);
  };

  const handleRegisterSubmit = async (payload: RegisterPayload) => {
    console.log(`${AuthTab.REGISTER} form submitted:`, payload);
    const data = await Register(payload);

    setCookie("access_token", data.access_token);
  };

  // const whoamiTEMP = async () => {
  //   const w = await whoami();
  //   return w;
  // }

  // const refreshTEMP = async () => {
  //   const re = await refreshToken();
  //   return re;
  // }

  // useEffect(()=>{
  //   whoamiTEMP();
  //   // refreshTEMP();
  // }, [])

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
