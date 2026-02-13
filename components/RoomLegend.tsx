import { ROOMS, ROOM_COLORS } from "@/lib/types";

export default function RoomLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3 justify-center">
      {ROOMS.map((room) => (
        <div key={room} className="flex items-center gap-1.5">
          <span
            className={`w-3 h-3 rounded-sm ${ROOM_COLORS[room].bg}`}
          />
          <span className="text-gray-600">{ROOM_COLORS[room].label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm border border-gray-300 overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, transparent 50%, #9ca3af 50%)" }}
        />
        <span className="text-gray-600">Arrive</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm border border-gray-300 overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, #9ca3af 50%, transparent 50%)" }}
        />
        <span className="text-gray-600">Depart</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm"
          style={{ background: "#6b728033" }}
        />
        <span className="text-gray-600">Blocked</span>
      </div>
    </div>
  );
}
