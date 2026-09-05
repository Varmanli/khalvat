import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";

// Run the actual services against isolated PostgreSQL WASM. No application DB,
// credentials or user records are touched. Compile the project's @/ TS imports.
const require = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(
    this,
    name.startsWith("@/") ? path.resolve(name.slice(2)) : name,
    ...args,
  );
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
};
const pg = new PGlite();
const schema = require("../db/schema.ts");
const db = drizzle(pg, { schema });
require.cache[require.resolve("../db/index.ts")] = {
  id: require.resolve("../db/index.ts"),
  filename: require.resolve("../db/index.ts"),
  loaded: true,
  exports: { db },
};
const dates = require("../lib/planner-dates.ts");
const service = require("../lib/planner.ts");
const tasks = require("../lib/tasks.ts");
const { eventSchema } = require("../lib/planner-validation.ts");
const { taskSchema, taskUpdateSchema } = require("../lib/validations.ts");
const { entrySchema } = require("../lib/validations.ts");
const entriesService = require("../lib/entries.ts");
let session = null;
require.cache[require.resolve("../lib/auth.ts")] = {
  id: require.resolve("../lib/auth.ts"),
  loaded: true,
  exports: { getCurrentUser: async () => session },
};
const taskRoute = require("../app/api/tasks/[id]/route.ts");
const eventRoute = require("../app/api/events/[id]/route.ts");
const focusRoute = require("../app/api/planner/route.ts");
const entryRoute = require("../app/api/entries/[id]/route.ts");
let alice, bob;
before(async () => {
  for (const file of fs
    .readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await pg.exec(fs.readFileSync(path.join("drizzle", file), "utf8"));
  [alice, bob] = await db
    .insert(schema.users)
    .values([
      { name: "Alice", email: "alice@test.invalid" },
      { name: "Bob", email: "bob@test.invalid" },
    ])
    .returning();
});
after(async () => {
  await pg.close();
});
test("API authentication, ownership and partial task updates", async () => {
  const original = await tasks.createTask(alice.id, taskSchema.parse({ title: "API task", priority: "high", status: "in_progress", isPinned: true }));
  const context = { params: Promise.resolve({ id: original.id }) };
  const request = () => new Request("http://localhost/api/tasks/" + original.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduledDate: "2027-02-01" }) });
  session = null;
  assert.equal((await taskRoute.PATCH(request(), context)).status, 401);
  assert.equal((await focusRoute.PUT(new Request("http://localhost/api/planner", { method: "PUT", body: "{}" }))).status, 401);
  session = { userId: bob.id };
  assert.equal((await taskRoute.PATCH(request(), context)).status, 404);
  session = { userId: alice.id };
  const response = await taskRoute.PATCH(request(), context);
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.priority, "high"); assert.equal(data.status, "in_progress"); assert.equal(data.isPinned, true);
  const input = { title: "Private API event", eventDate: "2027-02-01", startTime: null, endTime: null, allDay: true, reminderAt: null };
  const event = await service.saveEvent(alice.id, input);
  session = { userId: bob.id };
  const eventContext = { params: Promise.resolve({ id: event.id }) };
  assert.equal((await eventRoute.GET(new Request("http://localhost"), eventContext)).status, 404);
  assert.equal((await eventRoute.DELETE(new Request("http://localhost", { method: "DELETE" }), eventContext)).status, 404);
  assert.equal((await eventRoute.PUT(new Request("http://localhost", { method: "PUT", body: JSON.stringify(input) }), eventContext)).status, 404);
  session = null;
});
test("priority order keeps legacy urgent and moves completed tasks last", () => {
  const rows = [
    { priority: "low", status: "todo" },
    { priority: "high", status: "done" },
    { priority: "medium", status: "todo" },
    { priority: "urgent", status: "todo" },
    { priority: "high", status: "todo" },
  ];
  assert.deepEqual(
    rows.sort(dates.comparePriority).map((v) => `${v.priority}/${v.status}`),
    ["urgent/todo", "high/todo", "medium/todo", "low/todo", "high/done"],
  );
});
test("valid dates, Tehran midnight and tomorrow across year/leap boundaries", () => {
  assert.equal(dates.validDateKey("2026-02-30"), false);
  assert.equal(dates.validDateKey("2024-02-29"), true);
  assert.equal(dates.shiftDay("2024-02-28", 1), "2024-02-29");
  assert.equal(dates.todayKey(new Date("2026-09-04T20:30:00Z")), "2026-09-05");
  assert.deepEqual(dates.tomorrowSchedule(new Date("2026-12-31T12:00:00Z")), {
    scheduledDate: "2027-01-01",
  });
});
test("Jalali month, Saturday week and day ranges are half-open", () => {
  assert.deepEqual(dates.calendarRange("2026-09-05", "day"), {
    start: "2026-09-05",
    end: "2026-09-06",
  });
  assert.deepEqual(dates.calendarRange("2026-09-07", "week"), {
    start: "2026-09-05",
    end: "2026-09-12",
  });
  const range = dates.calendarRange("2026-03-21", "month");
  assert.equal(range.start, "2026-03-21");
  assert.equal(dates.rangeDays(range.start, range.end).length % 7, 0);
  assert.equal(dates.calendarStep("2026-03-21", "month", -1), "2026-02-20");
});
test("event and task validation rejects invalid times, dates and empty event titles", () => {
  const event = {
    title: "Class",
    eventDate: "2026-09-05",
    startTime: "10:00",
    endTime: "09:00",
    allDay: false,
    reminderAt: null,
  };
  assert.equal(eventSchema.safeParse(event).success, false);
  assert.equal(
    eventSchema.safeParse({ ...event, endTime: "11:00" }).success,
    true,
  );
  assert.equal(
    eventSchema.safeParse({
      ...event,
      allDay: true,
      startTime: null,
      endTime: null,
    }).success,
    true,
  );
  assert.equal(eventSchema.safeParse({ ...event, title: " " }).success, false);
  assert.equal(
    taskSchema.safeParse({ title: "Task", scheduledTime: "24:00" }).success,
    false,
  );
});
test("task ownership and category ownership protect reads, edits, toggles and deletes", async () => {
  const task = await tasks.createTask(
    alice.id,
    taskSchema.parse({ title: "Private task" }),
  );
  assert.equal(await tasks.getUserTaskById(bob.id, task.id), null);
  assert.equal(
    await tasks.updateTask(bob.id, task.id, { title: "Intrusion" }),
    null,
  );
  assert.equal(await tasks.toggleTaskDone(bob.id, task.id), null);
  await tasks.deleteTask(bob.id, task.id);
  assert.equal(
    (await tasks.getUserTaskById(alice.id, task.id)).title,
    "Private task",
  );
  const [category] = await db
    .insert(schema.taskCategories)
    .values({ userId: bob.id, name: "Private", slug: "private" })
    .returning();
  await assert.rejects(
    tasks.updateTask(alice.id, task.id, { categoryId: category.id }),
    tasks.TaskValidationError,
  );
});
test("rescheduling preserves ID, deadline, time, category and other task data", async () => {
  const original = await tasks.createTask(
    alice.id,
    taskSchema.parse({
      title: "Reschedule",
      description: "Keep",
      priority: "high",
      isPinned: true,
      dueAt: "2026-10-01T10:00:00Z",
      scheduledDate: "2026-09-05",
      scheduledTime: "11:30",
      scheduledEndTime: "12:30",
    }),
  );
  const patch = taskUpdateSchema.parse(
    dates.tomorrowSchedule(new Date("2026-09-05T09:00:00Z")),
  );
  assert.deepEqual(Object.keys(patch), ["scheduledDate"]);
  const moved = await tasks.updateTask(alice.id, original.id, patch);
  assert.equal(moved.scheduledDate, "2026-09-06");
  for (const key of [
    "id",
    "title",
    "description",
    "priority",
    "isPinned",
    "dueAt",
    "scheduledTime",
    "scheduledEndTime",
    "categoryId",
    "createdAt",
  ])
    assert.deepEqual(moved[key], original[key]);
  await assert.rejects(
    tasks.updateTask(alice.id, original.id, { scheduledDate: null }),
    tasks.TaskValidationError,
  );
  await assert.rejects(
    tasks.updateTask(alice.id, original.id, { scheduledEndTime: "10:00" }),
    tasks.TaskValidationError,
  );
  const done = await tasks.updateTask(alice.id, original.id, {
    status: "done",
  });
  assert.ok(done.completedAt);
  assert.equal(
    (await tasks.updateTask(alice.id, original.id, { status: "todo" }))
      .completedAt,
    null,
  );
});

test("entry reminders create one manual schedule, update in place, and cancel cleanly", async () => {
  const entry = await entriesService.createEntry(alice.id, entrySchema.parse({
    title: "Reminder entry", content: "<p>Remember this</p>", type: "reminder", mood: "neutral", status: "active",
    reminderAt: "2026-09-05T18:30:00.000Z",
  }));
  let rows = await db.select().from(schema.notificationSchedules).where(eq(schema.notificationSchedules.entityId, entry.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, "manual");
  assert.equal(rows[0].targetUrl, `/entries/${entry.id}`);
  const id = rows[0].id;

  const updated = await entriesService.updateEntry(alice.id, entry.id, { reminderAt: "2026-09-05T19:00:00.000Z" });
  assert.ok(updated);
  rows = await db.select().from(schema.notificationSchedules).where(eq(schema.notificationSchedules.entityId, entry.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, id);
  assert.equal(rows[0].scheduledFor.toISOString(), "2026-09-05T19:00:00.000Z");

  await entriesService.updateEntry(alice.id, entry.id, { reminderAt: null });
  rows = await db.select().from(schema.notificationSchedules).where(eq(schema.notificationSchedules.entityId, entry.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].enabled, false);
  assert.ok(rows[0].cancelledAt);
});

test("entry reminder API rejects malformed and date-only timestamps with 400", async () => {
  const entry = await entriesService.createEntry(alice.id, entrySchema.parse({ title: "Validated", content: "<p>text</p>", type: "note", mood: "neutral", status: "raw" }));
  session = alice;
  const context = { params: Promise.resolve({ id: entry.id }) };
  for (const reminderAt of ["1405-06-14", "2026-09-05", "not-a-date"]) {
    const response = await entryRoute.PATCH(new Request(`http://localhost/api/entries/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reminderAt }) }), context);
    assert.equal(response.status, 400);
  }
});
test("event CRUD is owner scoped and all-day clears times", async () => {
  const input = {
    title: "Appointment",
    eventDate: "2026-10-05",
    startTime: "10:00",
    endTime: "11:00",
    allDay: false,
    reminderAt: null,
  };
  const event = await service.saveEvent(alice.id, input);
  assert.equal(await service.getEvent(bob.id, event.id), null);
  assert.equal(
    await service.saveEvent(bob.id, { ...input, title: "Intrusion" }, event.id),
    null,
  );
  assert.equal(await service.deleteEvent(bob.id, event.id), false);
  const updated = await service.saveEvent(
    alice.id,
    { ...input, allDay: true },
    event.id,
  );
  assert.equal(updated.startTime, null);
  assert.equal(updated.endTime, null);
  assert.equal(await service.deleteEvent(alice.id, event.id), true);
});
test("Today queries include schedules, deadlines, reminders and events only for the owner and day", async () => {
  const date = "2027-01-15";
  for (const [userId, title, scheduledDate, status] of [
    [alice.id, "today", date, "todo"],
    [alice.id, "tomorrow", "2027-01-16", "todo"],
    [bob.id, "other-user", date, "todo"],
    [alice.id, "archived", date, "archived"],
  ])
    await tasks.createTask(
      userId,
      taskSchema.parse({ title, scheduledDate, status }),
    );
  await tasks.createTask(
    alice.id,
    taskSchema.parse({
      title: "deadline",
      dueAt: dates.dayBoundary(date).toISOString(),
    }),
  );
  await tasks.createTask(
    alice.id,
    taskSchema.parse({
      title: "exclusive-end",
      dueAt: dates.dayBoundary("2027-01-16").toISOString(),
    }),
  );
  await db.insert(schema.entries).values([
    {
      userId: alice.id,
      title: "reminder",
      content: "note",
      reminderAt: dates.dayBoundary(date),
    },
    {
      userId: bob.id,
      title: "private-reminder",
      content: "note",
      reminderAt: dates.dayBoundary(date),
    },
  ]);
  for (const userId of [alice.id, bob.id])
    await service.saveEvent(userId, {
      title: userId === alice.id ? "event" : "private-event",
      eventDate: date,
      allDay: true,
      startTime: null,
      endTime: null,
      reminderAt: null,
    });
  await service.saveEvent(alice.id, {
    title: "future event reminder",
    eventDate: "2027-01-20",
    allDay: true,
    startTime: null,
    endTime: null,
    reminderAt: dates.dayBoundary(date).toISOString(),
  });
  await service.saveFocus(alice.id, date, "Alice focus");
  await service.saveFocus(bob.id, date, "Bob focus");
  const day = await service.getDailyPlanner(alice.id, date);
  assert.equal(day.focus, "Alice focus");
  assert.deepEqual(day.tasks.map((t) => t.title).sort(), ["deadline", "today"]);
  assert.deepEqual(day.items.map((t) => t.title).sort(), [
    "deadline",
    "event",
    "future event reminder",
    "reminder",
    "today",
  ]);
  const range = dates.calendarRange(date, "week");
  const week = await service.getPlannerRange(alice.id, range.start, range.end);
  assert.ok(
    week.items.every(
      (item) =>
        item.date >= range.start &&
        item.date < range.end &&
        !item.title.includes("private"),
    ),
  );
  assert.ok(!week.tasks.some((t) => t.title === "other-user"));
});
