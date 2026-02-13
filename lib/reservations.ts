import { supabase } from "./supabaseClient";
import { Reservation } from "./types";

export async function getReservationsForMonth(
  year: number,
  month: number
): Promise<Reservation[]> {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const startStr = monthStart.toISOString().split("T")[0];
  const endStr = monthEnd.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .lte("check_in", endStr)
    .gt("check_out", startStr)
    .order("check_in", { ascending: true });

  if (error) throw error;
  return (data as Reservation[]) ?? [];
}

export async function checkConflict(
  room: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  // Check room-specific conflicts
  const { data: roomData, error: roomError } = await supabase
    .from("reservations")
    .select("id")
    .eq("room", room)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (roomError) throw roomError;
  if ((roomData?.length ?? 0) > 0) return true;

  // Check blocked date conflicts
  const { data: blockedData, error: blockedError } = await supabase
    .from("reservations")
    .select("id")
    .eq("room", "ALL")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (blockedError) throw blockedError;
  return (blockedData?.length ?? 0) > 0;
}

export async function createReservation(
  guestName: string,
  room: string,
  checkIn: string,
  checkOut: string
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      guest_name: guestName,
      room,
      check_in: checkIn,
      check_out: checkOut,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}

export async function getAllReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("check_in", { ascending: true });

  if (error) throw error;
  return (data as Reservation[]) ?? [];
}

export async function getReservation(id: string): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Reservation;
}

export async function updateReservation(
  id: string,
  guestName: string,
  room: string,
  checkIn: string,
  checkOut: string
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update({
      guest_name: guestName,
      room,
      check_in: checkIn,
      check_out: checkOut,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function checkConflictExcluding(
  id: string,
  room: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const { data: roomData, error: roomError } = await supabase
    .from("reservations")
    .select("id")
    .eq("room", room)
    .neq("id", id)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (roomError) throw roomError;
  if ((roomData?.length ?? 0) > 0) return true;

  const { data: blockedData, error: blockedError } = await supabase
    .from("reservations")
    .select("id")
    .eq("room", "ALL")
    .neq("id", id)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (blockedError) throw blockedError;
  return (blockedData?.length ?? 0) > 0;
}

export async function checkBlockedConflict(
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("reservations")
    .select("id")
    .eq("room", "ALL")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function createBlockout(
  checkIn: string,
  checkOut: string
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      guest_name: "Blocked",
      room: "ALL",
      check_in: checkIn,
      check_out: checkOut,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}
