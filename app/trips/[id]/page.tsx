"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Send, Wallet } from "lucide-react";
import dayjs from "dayjs";
import { useAppSelector } from "@/lib/redux/hooks";
import { Container } from "@/components/ui/Container";
import { ItineraryBoard } from "@/components/trips/ItineraryBoard";

export default function TripPlannerPage() {
  const { id } = useParams<{ id: string }>();
  const trip = useAppSelector((state) =>
    state.trips.items.find((t) => t.id === id),
  );

  if (!trip) {
    // Can't call notFound() inside a client component render without a try-catch,
    // so we render an inline "not found" state instead.
    return (
      <Container className="py-16 text-center">
        <p className="font-display text-xl font-semibold text-(--color-foreground)">
          Trip not found
        </p>
        <Link
          href="/trips"
          className="mt-4 inline-block text-sm text-(--color-primary) hover:underline"
        >
          ← Back to my trips
        </Link>
      </Container>
    );
  }

  const nights = dayjs(trip.endDate).diff(dayjs(trip.startDate), "day");

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-(--color-foreground)/60 hover:text-(--color-foreground)"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        My trips
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none" aria-hidden="true">
            {trip.destinationEmoji}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold text-(--color-foreground) sm:text-4xl">
              {trip.destinationName}
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-(--color-foreground)/60">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                {dayjs(trip.startDate).format("MMM D")} –{" "}
                {dayjs(trip.endDate).format("MMM D, YYYY")} · {nights} night
                {nights !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet size={14} aria-hidden="true" />
                {trip.budget.toLocaleString()} {trip.currency} budget
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/destinations/${trip.destinationCode.toLowerCase()}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-surface-muted)"
        >
          <Send size={14} aria-hidden="true" />
          Destination info
        </Link>
      </div>

      <div className="mt-10">
        <ItineraryBoard trip={trip} />
      </div>
    </Container>
  );
}
