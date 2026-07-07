"use client";

import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select, TimePicker } from "antd";
import dayjs from "dayjs";
import type { TripActivity, ActivityCategory } from "@/lib/types/travel";

const CATEGORIES: { value: ActivityCategory; label: string; emoji: string }[] = [
  { value: "sightseeing", label: "Sightseeing", emoji: "🏛️" },
  { value: "food", label: "Food & dining", emoji: "🍽️" },
  { value: "transport", label: "Transport", emoji: "✈️" },
  { value: "lodging", label: "Lodging", emoji: "🛏️" },
  { value: "activity", label: "Activity", emoji: "🎯" },
  { value: "other", label: "Other", emoji: "📌" },
];

interface ActivityFormValues {
  title: string;
  time?: dayjs.Dayjs;
  note?: string;
  cost?: number;
  category: ActivityCategory;
}

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Omit<TripActivity, "id">) => void;
  initial?: TripActivity | null;
}

export function ActivityModal({ open, onClose, onSave, initial }: ActivityModalProps) {
  const [form] = Form.useForm<ActivityFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: initial?.title ?? "",
        time: initial?.time ? dayjs(initial.time, "HH:mm") : undefined,
        note: initial?.note ?? "",
        cost: initial?.cost ?? undefined,
        category: initial?.category ?? "sightseeing",
      });
    }
  }, [open, initial, form]);

  function handleOk() {
    form.validateFields().then((values) => {
      onSave({
        title: values.title,
        time: values.time?.format("HH:mm"),
        note: values.note || undefined,
        cost: values.cost,
        category: values.category,
      });
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title={initial ? "Edit activity" : "Add activity"}
      okText={initial ? "Save changes" : "Add"}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
        <Form.Item
          name="title"
          label="Activity"
          rules={[{ required: true, message: "Give this activity a name" }]}
        >
          <Input placeholder="e.g. Visit the Colosseum" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="time" label="Time">
            <TimePicker className="w-full" format="HH:mm" minuteStep={15} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              options={CATEGORIES.map((c) => ({
                value: c.value,
                label: `${c.emoji} ${c.label}`,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="cost" label="Cost (optional)">
          <InputNumber min={0} className="w-full" placeholder="0.00" />
        </Form.Item>

        <Form.Item name="note" label="Note (optional)">
          <Input.TextArea rows={2} placeholder="Any details to remember…" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
