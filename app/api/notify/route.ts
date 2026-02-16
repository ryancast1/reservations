import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotifyBody {
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function nightCount(checkIn: string, checkOut: string): number {
  const ms =
    new Date(checkOut + "T00:00:00").getTime() -
    new Date(checkIn + "T00:00:00").getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NotifyBody;
    const { guestName, room, checkIn, checkOut } = body;

    if (!guestName || !room || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const to = process.env.NOTIFICATION_EMAIL_TO;
    if (!to) {
      console.error("NOTIFICATION_EMAIL_TO not set");
      return NextResponse.json(
        { error: "Notification not configured" },
        { status: 500 }
      );
    }

    const nights = nightCount(checkIn, checkOut);

    const { error } = await resend.emails.send({
      from: "Bookings <onboarding@resend.dev>",
      to,
      subject: `New Booking: ${guestName} — ${room}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1d4ed8; margin-top: 0;">New Reservation</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 100px;">Guest</td>
              <td style="padding: 8px 0; font-weight: 600;">${guestName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Room</td>
              <td style="padding: 8px 0; font-weight: 600;">${room}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Check-in</td>
              <td style="padding: 8px 0;">${formatDate(checkIn)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Check-out</td>
              <td style="padding: 8px 0;">${formatDate(checkOut)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Nights</td>
              <td style="padding: 8px 0;">${nights}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Allen Creek Resort Bookings</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notify error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
