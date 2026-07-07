"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useGetCountriesQuery } from "@/lib/redux/api/countriesApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addTrip } from "@/lib/redux/slices/tripsSlice";
import type { TripDay } from "@/lib/types/travel";
import { Container } from "@/components/ui/Container";

const { RangePicker } = DatePicker;

interface FormValues {
  destination: string;
  dates: [Dayjs, Dayjs];
  budget: number;
  currency: string;
}

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
  "AED",
];

function buildDays(start: Dayjs, end: Dayjs): TripDay[] {
  const days: TripDay[] = [];
  let current = start;
  while (!current.isAfter(end)) {
    days.push({
      id: crypto.randomUUID(),
      date: current.format("YYYY-MM-DD"),
      activities: [],
    });
    current = current.add(1, "day");
  }
  return days;
}

export default function NewTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const presetCode = searchParams.get("destination");
  const { data: countries = [], isLoading } = useGetCountriesQuery();

  const countryOptions = useMemo(
    () =>
      countries
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({
          value: c.code,
          label: `${c.emoji} ${c.name}`,
          searchText: `${c.name} ${c.native} ${c.capital ?? ""}`,
        })),
    [countries],
  );

  async function onFinish(values: FormValues) {
    setSaving(true);
    const [start, end] = values.dates;
    const country = countries.find((c) => c.code === values.destination);
    if (!country) return;

    dispatch(
      addTrip({
        destinationCode: country.code,
        destinationName: country.name,
        destinationEmoji: country.emoji,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        budget: values.budget,
        currency: values.currency,
        days: buildDays(start, end),
      }),
    );

    router.push("/trips");
  }

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-(--color-foreground) sm:text-4xl">
        Plan a new trip
      </h1>
      <p className="mt-2 text-(--color-foreground)/60">
        Fill in the details — everything is saved locally and works offline.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          destination: presetCode ?? undefined,
          budget: 1000,
          currency: "USD",
        }}
        className="mt-8 flex flex-col gap-1"
        requiredMark={false}
      >
        <Form.Item
          name="destination"
          label="Destination"
          rules={[{ required: true, message: "Pick a destination" }]}
        >
          <Select
            showSearch
            loading={isLoading}
            placeholder="Search countries…"
            options={countryOptions}
            virtual={false}
            classNames={{ popup: { root: "trip-destination-popup" } }}
            filterOption={(input, option) =>
              (option?.searchText as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="dates"
          label="Travel dates"
          rules={[{ required: true, message: "Select travel dates" }]}
        >
          <RangePicker
            size="large"
            className="w-full"
            classNames={{ popup: { root: "trip-range-popup" } }}
            disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
            format="MMM D, YYYY"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="budget"
            label="Total budget"
            rules={[{ required: true, message: "Enter a budget" }]}
          >
            <InputNumber
              min={0}
              size="large"
              className="w-full"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => Number(v?.replace(/,/g, "")) as unknown as 0}
            />
          </Form.Item>
          <Form.Item name="currency" label="Currency">
            <Select
              size="large"
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 8 }}
            placeholder="Anything to remember about this trip…"
          />
        </Form.Item>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-full bg-(--color-primary) py-3 text-sm font-semibold text-(--color-primary-foreground) transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Create trip"}
        </button>
      </Form>
    </Container>
  );
}
