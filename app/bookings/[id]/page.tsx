"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROOMS, BookableRoom } from "@/lib/types";
import {
  getReservation,
  updateReservation,
  deleteReservation,
  checkConflictExcluding,
} from "@/lib/reservations";
import PasscodeGate from "@/components/PasscodeGate";

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [room, setRoom] = useState<BookableRoom | "ALL">("Main Guest Room");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    getReservation(id)
      .then((r) => {
        setGuestName(r.guest_name);
        setRoom(r.room);
        setCheckIn(r.check_in);
        setCheckOut(r.check_out);
      })
      .catch(() => setError("Booking not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const isBlocked = room === "ALL";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isBlocked && !guestName.trim()) {
      setError("Guest name is required.");
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Both dates are required.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    try {
      if (!isBlocked) {
        const conflict = await checkConflictExcluding(id, room, checkIn, checkOut);
        if (conflict) {
          setError("This room is already booked for those dates.");
          return;
        }
      }
      await updateReservation(
        id,
        isBlocked ? "Blocked" : guestName.trim(),
        room,
        checkIn,
        checkOut
      );
      router.push("/bookings");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteReservation(id);
      router.push("/bookings");
    } catch {
      setError("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <p className="text-sm text-gray-400 text-center mt-8">Loading...</p>
      </main>
    );
  }

  return (
    <PasscodeGate>
      <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/bookings" className="text-blue-600 text-sm">
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">
          {isBlocked ? "Edit Blocked Dates" : "Edit Booking"}
        </h1>
      </header>

      <form onSubmit={handleSave} className="space-y-4">
        {!isBlocked && (
          <>
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
          </>
        )}

        <div>
          <label
            htmlFor="checkIn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {isBlocked ? "Start Date" : "Check-in Date"}
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
            {isBlocked ? "End Date" : "Check-out Date"}
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
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-red-600 text-sm font-medium py-2"
          >
            Delete this {isBlocked ? "blockout" : "booking"}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium active:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
    </PasscodeGate>
  );
}
