import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User favorites table
export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  venueId: varchar("venue_id").notNull(),
  venueName: varchar("venue_name").notNull(),
  venueType: varchar("venue_type").notNull(),
  venueLat: real("venue_lat").notNull(),
  venueLng: real("venue_lng").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User visited venues table
export const userVisited = pgTable("user_visited", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  venueId: varchar("venue_id").notNull(),
  venueName: varchar("venue_name").notNull(),
  venueType: varchar("venue_type").notNull(),
  venueLat: real("venue_lat").notNull(),
  venueLng: real("venue_lng").notNull(),
  visitedAt: timestamp("visited_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(userFavorites),
  visited: many(userVisited),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
}));

export const userVisitedRelations = relations(userVisited, ({ one }) => ({
  user: one(users, {
    fields: [userVisited.userId],
    references: [users.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserVisited = typeof userVisited.$inferInsert;
export type UserVisited = typeof userVisited.$inferSelect;