import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  date,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth tables (Step 4 uses these). Names and columns follow what
// Better Auth expects. The `user` table plays the role of `users` in CLAUDE.md
// and has our two extra columns: isPremium and stripeCustomerId.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isPremium: boolean("is_premium").notNull().default(false),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Campus Reset tables
// ---------------------------------------------------------------------------

// One profile per user, filled in during onboarding.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  goal: text("goal").notNull(), // e.g. "build strength", "more energy"
  // e.g. [{ "day": "mon", "time": "morning", "minutes": 30 }]
  availability: jsonb("availability").$type<{ day: string; time: string; minutes: number }[]>().notNull(),
  eatingSituation: text("eating_situation").notNull(), // "dining_hall" | "dorm" | "apartment"
  weeklyBudget: integer("weekly_budget").notNull(), // whole US dollars per week
  experienceLevel: text("experience_level").notNull(), // "beginner" | "intermediate" | "advanced"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One row per generated week. The plan itself is stored as JSON.
export const weeklyPlans = pgTable(
  "weekly_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(), // the Monday of that week
    planJson: jsonb("plan_json").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("weekly_plans_user_week_idx").on(t.userId, t.weekStart)],
);

// Which workouts and meals the user has checked off.
export const checkoffs = pgTable(
  "checkoffs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => weeklyPlans.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // "mon" ... "sun"
    itemType: text("item_type").notNull(), // "workout" | "meal"
    itemId: text("item_id").notNull(),
    done: boolean("done").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("checkoffs_item_idx").on(t.planId, t.day, t.itemType, t.itemId)],
);

// One row per AI call, used to enforce free-tier limits.
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "plan" | "replan" | "grocery"
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ai_usage_user_idx").on(t.userId, t.type)],
);
