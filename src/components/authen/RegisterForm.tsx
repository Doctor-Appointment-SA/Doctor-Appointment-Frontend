"use client";
import React, { useState } from "react";

type RegisterFormProps = {
  onSubmit: (data: {
    id_card: string;
    name: string;
    lastname: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => void;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState({
    id_card: "",
    name: "",
    lastname: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {[
        { label: "ID Card", key: "id_card", type: "text" },
        { label: "Name", key: "name", type: "text" },
        { label: "Lastname", key: "lastname", type: "text" },
        { label: "Phone", key: "phone", type: "tel" },
        { label: "Password", key: "password", type: "password" },
        { label: "Confirm Password", key: "confirmPassword", type: "password" },
      ].map((input) => (
        <div key={input.key} className="flex flex-col gap-2">
          {input.label}
          <input
            type={input.type}
            value={(form as any)[input.key]}
            onChange={(e) => handleChange(input.key, e.target.value)}
            className="border border-gray-300 p-2 rounded-md bg-white"
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
      >
        Register
      </button>
    </form>
  );
};
