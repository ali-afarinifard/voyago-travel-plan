"use client";

import { Progress } from "antd";
import type { Trip } from "@/lib/types/travel";

export function BudgetBar({ trip }: { trip: Trip }) {
  const spent = trip.days
    .flatMap((d) => d.activities)
    .reduce((sum, a) => sum + (a.cost ?? 0), 0);

  const percent =
    trip.budget > 0 ? Math.min(100, (spent / trip.budget) * 100) : 0;
  const overBudget = spent > trip.budget;

  return (
    <div className="boarding-pass p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-(--color-foreground)">
          Budget tracker
        </span>
        <span className="font-tabular text-(--color-foreground)/60">
          <span
            className={
              overBudget ? "text-(--color-terracotta) font-semibold" : ""
            }
          >
            {spent.toLocaleString()}
          </span>
          {" / "}
          {trip.budget.toLocaleString()} {trip.currency}
        </span>
      </div>
      <Progress
        percent={Math.round(percent)}
        status={overBudget ? "exception" : "active"}
        strokeColor={
          overBudget ? "var(--color-terracotta)" : "var(--color-primary)"
        }
        railColor="var(--color-border)"
        className="mt-3"
        showInfo={false}
      />
      {overBudget && (
        <p className="mt-1.5 text-xs text-(--color-terracotta)">
          Over budget by {(spent - trip.budget).toLocaleString()}{" "}
          {trip.currency}
        </p>
      )}
    </div>
  );
}
