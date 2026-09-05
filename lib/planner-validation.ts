import { z } from "zod";
import { validDateKey } from "./planner-dates";
export const planningDateSchema = z
  .string()
  .refine(validDateKey, "تاریخ معتبر نیست.");
export const planningTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ساعت معتبر نیست.");
export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان را بنویسید.").max(255),
    description: z.string().max(2000).nullable().optional(),
    eventDate: planningDateSchema,
    startTime: planningTimeSchema.nullable(),
    endTime: planningTimeSchema.nullable(),
    allDay: z.boolean(),
    reminderAt: z.iso.datetime({ offset: true }).nullable(),
  })
  .refine((v) => v.allDay || !!v.startTime, {
    message: "ساعت شروع را مشخص کنید.",
    path: ["startTime"],
  })
  .refine(
    (v) => v.allDay || !v.endTime || (!!v.startTime && v.endTime > v.startTime),
    { message: "پایان باید بعد از شروع باشد.", path: ["endTime"] },
  );
export type EventInput = z.infer<typeof eventSchema>;
export const focusSchema = z.object({
  date: planningDateSchema,
  focus: z.string().trim().max(255),
});
