// src/components/children/Input.jsx
import React from "react";

export function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
