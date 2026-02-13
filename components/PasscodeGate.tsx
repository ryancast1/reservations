"use client";

import { useState, useEffect } from "react";

const PASSCODE = "7412";
const STORAGE_KEY = "admin_unlocked";

export default function PasscodeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="text-center space-y-4 w-full max-w-xs">
        <h2 className="text-lg font-semibold text-gray-900">Enter Passcode</h2>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={input}
          onChange={(e) => {
            setError(false);
            setInput(e.target.value.slice(0, 4));
          }}
          placeholder="4-digit code"
          autoFocus
          className={`w-full text-center text-2xl tracking-[0.5em] rounded-lg border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
        {error && (
          <p className="text-red-600 text-sm">Incorrect passcode</p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium active:bg-blue-700"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
