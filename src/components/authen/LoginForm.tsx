"use client";
import React, { useState } from "react";

type LoginFormProps = {
  onSubmit: (data: { username: string; password: string }) => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [username, setHospitalNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        Hospital Number
        <input
          type="text"
          value={username}
          onChange={(e) => setHospitalNumber(e.target.value)}
          className="border border-gray-300 p-2 rounded-md bg-white"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 rounded-md bg-white"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
      >
        Login
      </button>
    </form>
  );
};
