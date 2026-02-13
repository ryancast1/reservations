"use client";

import { useState, useEffect } from "react";
import { getReservationsForMonth } from "@/lib/reservations";
import { Reservation, ROOMS, ROOM_HEX, BLOCKED_HEX, BookableRoom } from "@/lib/types";
import RoomLegend from "./RoomLegend";

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getRoomStatus(
  dateStr: string,
  room: BookableRoom,
  reservations: Reservation[],
  monthFirstDay: string
): {
  status: "none" | "check-in" | "check-out" | "booked";
  guestName?: string;
  showLabel: boolean;
} {
  for (const r of reservations) {
    if (r.room !== room) continue;
    if (dateStr === r.check_in)
      return { status: "check-in", guestName: r.guest_name, showLabel: true };
    if (dateStr === r.check_out)
      return { status: "check-out", guestName: r.guest_name, showLabel: false };
    if (dateStr > r.check_in && dateStr < r.check_out) {
      // Show label on first visible day: either check_in or first of month
      const firstVisible = r.check_in >= monthFirstDay ? r.check_in : monthFirstDay;
      return {
        status: "booked",
        guestName: r.guest_name,
        showLabel: dateStr === firstVisible,
      };
    }
  }
  return { status: "none", showLabel: false };
}

function getRoomBarStyle(
  status: string,
  room: BookableRoom
): React.CSSProperties {
  const hex = ROOM_HEX[room];
  switch (status) {
    case "check-in":
      return {
        background: `linear-gradient(to bottom right, transparent 50%, ${hex} 50%)`,
      };
    case "check-out":
      return {
        background: `linear-gradient(to bottom right, ${hex} 50%, transparent 50%)`,
      };
    case "booked":
      return { background: hex };
    default:
      return { background: "transparent" };
  }
}

function getBlockedStatus(
  dateStr: string,
  reservations: Reservation[]
): "none" | "check-in" | "check-out" | "blocked" {
  for (const r of reservations) {
    if (r.room !== "ALL") continue;
    if (dateStr === r.check_in) return "check-in";
    if (dateStr === r.check_out) return "check-out";
    if (dateStr > r.check_in && dateStr < r.check_out) return "blocked";
  }
  return "none";
}

function getBlockedCellStyle(
  status: "none" | "check-in" | "check-out" | "blocked"
): React.CSSProperties {
  switch (status) {
    case "check-in":
      return {
        background: `linear-gradient(to bottom right, transparent 50%, ${BLOCKED_HEX}33 50%)`,
      };
    case "check-out":
      return {
        background: `linear-gradient(to bottom right, ${BLOCKED_HEX}33 50%, transparent 50%)`,
      };
    case "blocked":
      return { background: `${BLOCKED_HEX}33` };
    default:
      return {};
  }
}

function getMonthName(month: number): string {
  return new Date(2000, month).toLocaleString("default", { month: "long" });
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    setLoading(true);
    getReservationsForMonth(year, month)
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const monthFirstDay = formatDateStr(year, month, 1);
  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfMonth + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ day: 0, inMonth: false, dateStr: "" });
    } else {
      cells.push({
        day: dayNum,
        inMonth: true,
        dateStr: formatDateStr(year, month, dayNum),
      });
    }
  }

  // Collect tooltip info for a cell
  function getTooltip(dateStr: string): string {
    const parts: string[] = [];
    for (const room of ROOMS) {
      const { status, guestName } = getRoomStatus(dateStr, room, reservations, monthFirstDay);
      if (status !== "none" && guestName) {
        const action =
          status === "check-in"
            ? "arrives"
            : status === "check-out"
              ? "departs"
              : "staying";
        parts.push(`${guestName} ${action} (${room})`);
      }
    }
    return parts.join("\n");
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg active:bg-gray-300"
        >
          &larr; Prev
        </button>
        <h2 className="text-base font-semibold">
          {getMonthName(month)} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg active:bg-gray-300"
        >
          Next &rarr;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell.inMonth) {
            return <div key={i} className="day-cell bg-gray-100 rounded" />;
          }

          const today = new Date();
          const isToday =
            cell.day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const blockedStatus = getBlockedStatus(cell.dateStr, reservations);
          const isBlocked = blockedStatus !== "none";

          return (
            <div
              key={i}
              className={`day-cell rounded flex flex-col p-0.5 overflow-hidden bg-white ${
                isToday ? "ring-2 ring-blue-400 ring-inset" : ""
              }`}
              style={isBlocked ? getBlockedCellStyle(blockedStatus) : undefined}
              title={isBlocked ? "Blocked" : getTooltip(cell.dateStr)}
            >
              <span
                className={`text-[10px] leading-none ${
                  isToday ? "font-bold text-blue-600" : "text-gray-500"
                }`}
              >
                {cell.day}
              </span>
              {!isBlocked && (
                <div className="flex-1 flex flex-col justify-end gap-0.5 pb-0.5">
                  {ROOMS.map((room) => {
                    const { status, guestName, showLabel } = getRoomStatus(
                      cell.dateStr,
                      room,
                      reservations,
                      monthFirstDay
                    );
                    return (
                      <div
                        key={room}
                        className="room-bar relative overflow-hidden"
                        style={getRoomBarStyle(status, room)}
                      >
                        {showLabel && guestName && status !== "check-in" && (
                          <span className="absolute inset-0 flex items-center px-0.5 text-[7px] leading-none text-white font-medium truncate pointer-events-none">
                            {guestName}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <RoomLegend />

      {/* Loading overlay */}
      {loading && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Loading...
        </div>
      )}
    </div>
  );
}
