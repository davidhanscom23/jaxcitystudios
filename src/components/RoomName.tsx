import Image from "next/image";
import { ROOMS, type RoomId } from "@/lib/rates";

const SIZE = {
  sm: 28,
  md: 40,
  lg: 56,
} as const;

type Size = keyof typeof SIZE;

export function RoomPlanet({
  roomId,
  size = "md",
  className = "",
}: {
  roomId: RoomId;
  size?: Size;
  className?: string;
}) {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return null;
  const px = SIZE[size];
  return (
    <Image
      src={room.planet}
      alt=""
      width={px}
      height={px}
      className={`inline-block shrink-0 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] ${className}`}
      aria-hidden
    />
  );
}

export function RoomName({
  roomId,
  size = "md",
  showLabel = true,
  className = "",
}: {
  roomId: RoomId | string;
  size?: Size;
  showLabel?: boolean;
  className?: string;
}) {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return <span className={className}>{roomId}</span>;
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ color: room.color }}
    >
      <RoomPlanet roomId={room.id} size={size} />
      {showLabel && (
        <span className="font-display leading-none">{room.name}</span>
      )}
    </span>
  );
}
