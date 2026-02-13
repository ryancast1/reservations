"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBlockout } from "@/lib/reservations";
import PasscodeGate from "@/components/PasscodeGate";

export default function BlockPage() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!checkIn || !checkOut) {
      setError("Both dates are required.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      await createBlockout(checkIn, checkOut);
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PasscodeGate>
      <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-blue-600 text-sm">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold">Block Dates</h1>
        </header>

        <p className="text-sm text-gray-500 mb-4">
          Block out dates so no one can book any room during this period.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="checkIn"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="checkOut"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium active:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Blocking..." : "Block Dates"}
          </button>
        </form>
      </main>
    </PasscodeGate>
  );
}
