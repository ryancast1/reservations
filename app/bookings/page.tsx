"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllReservations } from "@/lib/reservations";
import { Reservation, ROOM_COLORS, BookableRoom } from "@/lib/types";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

function getRoomBadgeClass(room: string): string {
  if (room === "ALL") return "bg-gray-200 text-gray-700";
  const colors = ROOM_COLORS[room as BookableRoom];
  return colors ? `${colors.bg} text-white` : "bg-gray-200 text-gray-700";
}

function getRoomLabel(room: string): string {
  if (room === "ALL") return "Blocked";
  return room;
}

export default function BookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReservations()
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcoming = reservations.filter((r) => r.check_out > now);
  const past = reservations.filter((r) => r.check_out <= now);

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-blue-600 text-sm">
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">All Bookings</h1>
      </header>

      {loading && (
        <p className="text-sm text-gray-400 text-center">Loading...</p>
      )}

      {!loading && reservations.length === 0 && (
        <p className="text-sm text-gray-500 text-center">No bookings yet.</p>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Upcoming & Current
          </h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <Link
                key={r.id}
                href={`/bookings/${r.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-3 active:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {r.room === "ALL" ? "Blocked Dates" : r.guest_name}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getRoomBadgeClass(r.room)}`}
                  >
                    {getRoomLabel(r.room)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(r.check_in)} &mdash; {formatDate(r.check_out)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Past
          </h2>
          <div className="space-y-2">
            {past.map((r) => (
              <Link
                key={r.id}
                href={`/bookings/${r.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-3 active:bg-gray-50 opacity-60"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {r.room === "ALL" ? "Blocked Dates" : r.guest_name}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getRoomBadgeClass(r.room)}`}
                  >
                    {getRoomLabel(r.room)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(r.check_in)} &mdash; {formatDate(r.check_out)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
