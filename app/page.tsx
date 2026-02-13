import Link from "next/link";
import Calendar from "@/components/Calendar";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Allen Creek Resort</h1>
        <div className="flex gap-2">
          <Link
            href="/block"
            className="bg-gray-500 text-white text-sm font-medium px-3 py-2 rounded-lg active:bg-gray-600"
          >
            Block Dates
          </Link>
          <Link
            href="/book"
            className="bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg active:bg-blue-700"
          >
            Book a Room
          </Link>
        </div>
      </header>
      <Calendar />
      <div className="mt-4 text-center">
        <Link
          href="/bookings"
          className="text-blue-600 text-sm font-medium"
        >
          View All Bookings
        </Link>
      </div>
    </main>
  );
}
