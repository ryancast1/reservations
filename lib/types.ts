export type BookableRoom = "Main Guest Room" | "Guest Room 2" | "Guest Room 3";
export type Room = BookableRoom | "ALL";

export const BOOKABLE_ROOMS: BookableRoom[] = [
  "Main Guest Room",
  "Guest Room 2",
  "Guest Room 3",
];

export const ROOMS = BOOKABLE_ROOMS;

export const ROOM_COLORS: Record<
  BookableRoom,
  { bg: string; text: string; label: string }
> = {
  "Main Guest Room": { bg: "bg-blue-500", text: "text-blue-500", label: "Main" },
  "Guest Room 2": { bg: "bg-emerald-500", text: "text-emerald-500", label: "Rm 2" },
  "Guest Room 3": { bg: "bg-amber-500", text: "text-amber-500", label: "Rm 3" },
};

export const ROOM_HEX: Record<BookableRoom, string> = {
  "Main Guest Room": "#3b82f6",
  "Guest Room 2": "#10b981",
  "Guest Room 3": "#f59e0b",
};

export const BLOCKED_HEX = "#6b7280";

export interface Reservation {
  id: string;
  guest_name: string;
  room: Room;
  check_in: string;
  check_out: string;
  created_at: string;
}
