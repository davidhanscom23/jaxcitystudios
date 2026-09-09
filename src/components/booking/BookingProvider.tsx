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

export type BookingPresentation = "modal" | "standalone";

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
  presentation: BookingPresentation;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  presentation = "modal",
  defaultOpen = false,
}: {
  children: ReactNode;
  presentation?: BookingPresentation;
  /** When true (book app), the flow mounts open and stays full-screen. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || presentation === "standalone");
  const [initialRoomId, setInitialRoomId] = useState<RoomId | undefined>();
  const [initialPackageId, setInitialPackageId] = useState<string | undefined>(
    presentation === "standalone" ? "session" : undefined,
  );
  const [planner, setPlanner] = useState<PlannerSnapshot | null>(null);

  const openBooking = useCallback(
    (opts?: {
      roomId?: RoomId;
      packageId?: string;
      planner?: PlannerSnapshot;
    }) => {
      setInitialRoomId(opts?.roomId);
      setInitialPackageId(
        opts?.packageId ??
          (presentation === "standalone" ? "session" : undefined),
      );
      setPlanner(opts?.planner ?? null);
      setOpen(true);
    },
    [presentation],
  );

  const closeBooking = useCallback(() => {
    if (presentation === "standalone") {
      // Standalone app stays on the booking flow; reset by reopening.
      setOpen(false);
      queueMicrotask(() => setOpen(true));
      return;
    }
    setOpen(false);
  }, [presentation]);

  const value = useMemo(
    () => ({
      open,
      openBooking,
      closeBooking,
      initialRoomId,
      initialPackageId,
      planner,
      presentation,
    }),
    [
      open,
      openBooking,
      closeBooking,
      initialRoomId,
      initialPackageId,
      planner,
      presentation,
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
