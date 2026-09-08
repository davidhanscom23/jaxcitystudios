"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import type { RoomId } from "@/lib/rates";

export type PlannerSnapshot = {
  episodeMinutes: number;
  clientType: "first-time" | "returning";
  roomId: RoomId;
  bookedHours: number;
  studioCost: number;
  total: number;
  deliverables: string[];
  title?: string;
};

type BookingContextValue = {
  open: boolean;
  openBooking: (opts?: {
    roomId?: RoomId;
    packageId?: string;
    planner?: PlannerSnapshot;
  }) => void;
  closeBooking: () => void;
  initialRoomId?: RoomId;
  initialPackageId?: string;
  planner?: PlannerSnapshot | null;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialRoomId, setInitialRoomId] = useState<RoomId | undefined>();
  const [initialPackageId, setInitialPackageId] = useState<string | undefined>();
  const [planner, setPlanner] = useState<PlannerSnapshot | null>(null);

  const openBooking = useCallback(
    (opts?: {
      roomId?: RoomId;
      packageId?: string;
      planner?: PlannerSnapshot;
    }) => {
      setInitialRoomId(opts?.roomId);
      setInitialPackageId(opts?.packageId);
      setPlanner(opts?.planner ?? null);
      setOpen(true);
    },
    [],
  );

  const closeBooking = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      open,
      openBooking,
      closeBooking,
      initialRoomId,
      initialPackageId,
      planner,
    }),
    [
      open,
      openBooking,
      closeBooking,
      initialRoomId,
      initialPackageId,
      planner,
    ],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
