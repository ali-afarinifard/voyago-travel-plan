"use client";

import Link from "next/link";
import { useAppDispatch } from "@/lib/redux/hooks";
import { deleteTrip } from "@/lib/redux/slices/tripsSlice";
import type { Trip } from "@/lib/types/travel";
import { ArrowRight, CalendarDays, Trash2, Wallet, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import dayjs from "dayjs";

const SYNC_BADGE: Record<
  Trip["syncStatus"],
  { label: string; cls: string }
> = {
  synced: { label: "Synced", cls: "bg-green-500/10 text-green-600" },
  pending: { label: "Pending sync", cls: "bg-amber-500/10 text-amber-600" },
  offline: { label: "Offline", cls: "bg-(--color-terracotta)/10 text-(--color-terracotta)" },
};

export function TripCard({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const badge = SYNC_BADGE[trip.syncStatus];
  const nights = dayjs(trip.endDate).diff(dayjs(trip.startDate), "day");

  return (
    <article className="boarding-pass group flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-4xl leading-none" aria-hidden="true">
            {trip.destinationEmoji}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              badge.cls,
            )}
          >
            {trip.syncStatus === "offline" && <WifiOff size={10} aria-hidden="true" />}
            {badge.label}
          </span>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-(--color-foreground)">
            {trip.destinationName}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-(--color-foreground)/70">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-(--color-secondary)" aria-hidden="true" />
            {dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D, YYYY")}{" "}
            · {nights} night{nights !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Wallet size={14} className="text-(--color-secondary)" aria-hidden="true" />
            Budget - {trip.budget.toLocaleString()} {trip.currency}
          </span>
        </div>
      </div>

      <hr className="stub-divider mx-5" />

      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          aria-label={`Delete trip to ${trip.destinationName}`}
          onClick={() => dispatch(deleteTrip({ tripId: trip.id }))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-(--color-foreground)/40 transition-colors hover:bg-(--color-terracotta)/10 hover:text-(--color-terracotta) cursor-pointer"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          Open planner <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
