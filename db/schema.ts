import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
  integer,
  real,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const entryTypeEnum = pgEnum("entry_type", [
  "note",
  "idea",
  "poem",
  "watch",
  "read",
  "reminder",
  "spark",
]);

export const entryMoodEnum = pgEnum("entry_mood", [
  "calm",
  "sad",
  "excited",
  "nostalgic",
  "dark",
  "hopeful",
  "romantic",
  "tired",
  "neutral",
]);

export const entryStatusEnum = pgEnum("entry_status", [
  "raw",
  "active",
  "done",
  "archived",
  "dropped",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  /** Nullable — Google OAuth users have no password. */
  passwordHash: text("password_hash"),
  image: text("image"),
  avatarIcon: text("avatar_icon").default("leaf"),
  avatarColor: text("avatar_color").default("#8A5A44"),
  bio: text("bio"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** OAuth provider accounts (Google, etc.) linked to a user. */
export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("auth_accounts_provider_id_unique").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const entryCategories = pgTable("entry_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#8A5A44"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => entryCategories.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: entryTypeEnum("type").notNull().default("note"),
  mood: entryMoodEnum("mood").notNull().default("neutral"),
  status: entryStatusEnum("status").notNull().default("raw"),
  isPinned: boolean("is_pinned").notNull().default(false),
  reminderAt: timestamp("reminder_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tags_user_slug_unique").on(table.userId, table.slug)]
);

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.tagId] })]
);

// ── Task system ──────────────────────────────────────────────────

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "archived",
]);

export const taskCategories = pgTable(
  "task_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    color: text("color").notNull().default("#8A5A44"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("task_categories_user_slug_unique").on(table.userId, table.slug),
  ]
);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => taskCategories.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  status: taskStatusEnum("status").notNull().default("todo"),
  color: text("color"),
  isPinned: boolean("is_pinned").notNull().default(false),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Gratitude Journal ─────────────────────────────────────────────

export const gratitudeEntries = pgTable(
  "gratitude_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    items: jsonb("items").notNull().$type<string[]>(),
    note: text("note"),
    mood: text("mood"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("gratitude_entries_user_date_unique").on(table.userId, table.date),
    index("gratitude_entries_user_idx").on(table.userId),
    index("gratitude_entries_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export type GratitudeEntry = typeof gratitudeEntries.$inferSelect;
export type NewGratitudeEntry = typeof gratitudeEntries.$inferInsert;

// ── Daily Check-ins ──────────────────────────────────────────────

export const dailyCheckInMoodEnum = pgEnum("daily_check_in_mood", [
  "great",
  "good",
  "normal",
  "hard",
  "bad",
  "tired",
]);

export const dailyCheckIns = pgTable(
  "daily_check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dateKey: text("date_key").notNull(),
    mood: dailyCheckInMoodEnum("mood").notNull(),
    emoji: text("emoji").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("daily_check_ins_user_date_key_unique").on(table.userId, table.dateKey),
    index("daily_check_ins_user_date_idx").on(table.userId, table.dateKey),
  ]
);

export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type NewDailyCheckIn = typeof dailyCheckIns.$inferInsert;

// ── Poems ────────────────────────────────────────────────────────

export const poems = pgTable(
  "poems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ganjoorPoemId: integer("ganjoor_poem_id"),
    textHash: text("text_hash").notNull(),
    poetName: text("poet_name").notNull(),
    poetSlug: text("poet_slug"),
    title: text("title"),
    plainText: text("plain_text").notNull(),
    excerpt: text("excerpt"),
    sourceUrl: text("source_url"),
    tags: jsonb("tags").$type<string[]>(),
    mood: text("mood"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("poems_ganjoor_poem_id_unique").on(table.ganjoorPoemId),
    uniqueIndex("poems_text_hash_unique").on(table.textHash),
    index("poems_active_idx").on(table.isActive),
  ]
);

export type Poem = typeof poems.$inferSelect;
export type NewPoem = typeof poems.$inferInsert;

// ── Habits ────────────────────────────────────────────────────

export const habitRepeatTypeEnum = pgEnum("habit_repeat_type", ["daily", "weekly"]);
export const habitLogStatusEnum = pgEnum("habit_log_status", ["done", "skipped"]);

export const habitCategories = pgTable("habit_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#8A5A44"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => habitCategories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    shortDescription: text("short_description"),
    color: text("color").notNull().default("#8A5A44"),
    icon: text("icon").notNull().default("star"),
    dailyGoal: integer("daily_goal"),
    unit: text("unit"),
    reminderTime: text("reminder_time"),
    isActive: boolean("is_active").notNull().default(true),
    repeatType: habitRepeatTypeEnum("repeat_type").notNull().default("daily"),
    weeklyDays: jsonb("weekly_days").$type<number[]>(),
    durationDays: integer("duration_days"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("habits_user_idx").on(table.userId),
    index("habits_user_active_idx").on(table.userId, table.isActive),
  ]
);

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: habitLogStatusEnum("status").notNull(),
    value: real("value"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("habit_logs_user_habit_date_unique").on(table.userId, table.habitId, table.date),
    index("habit_logs_user_date_idx").on(table.userId, table.date),
    index("habit_logs_habit_date_idx").on(table.habitId, table.date),
  ]
);

export type HabitCategory = typeof habitCategories.$inferSelect;
export type NewHabitCategory = typeof habitCategories.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type NewHabitLog = typeof habitLogs.$inferInsert;

// ── User Preferences ──────────────────────────────────────────────

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  defaultHome: text("default_home").notNull().default("dashboard"),
  showDailyVerse: boolean("show_daily_verse").notNull().default(true),
  showGuideCards: boolean("show_guide_cards").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type EntryCategory = typeof entryCategories.$inferSelect;
export type NewEntryCategory = typeof entryCategories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type EntryTag = typeof entryTags.$inferSelect;
export type AuthAccount = typeof authAccounts.$inferSelect;
export type TaskCategory = typeof taskCategories.$inferSelect;
export type NewTaskCategory = typeof taskCategories.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
