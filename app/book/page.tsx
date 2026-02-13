"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROOMS, BookableRoom } from "@/lib/types";
import { checkConflict, createReservation } from "@/lib/reservations";

export default function BookPage() {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [room, setRoom] = useState<BookableRoom>(ROOMS[0]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!guestName.trim() || !checkIn || !checkOut) {
      setError("All fields are required.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    try {
      const conflict = await checkConflict(room, checkIn, checkOut);
      if (conflict) {
        setError(
          "This room is already booked for those dates. Please choose different dates."
        );
        return;
      }
      await createReservation(guestName.trim(), room, checkIn, checkOut);
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-blue-600 text-sm">
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">Book a Room</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="guestName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Guest Name
          </label>
          <input
            id="guestName"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="room"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room
          </label>
          <select
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value as BookableRoom)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="checkIn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Check-in Date
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
            Check-out Date
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium active:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </main>
  );
}
