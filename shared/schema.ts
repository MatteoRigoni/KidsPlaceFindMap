import { z } from "zod";
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

export const venueTypeSchema = z.enum([
  'playground',
  'park', 
  'museum',
  'gallery',
  'science_center',
  'planetarium',
  'swimming_pool'
]);

export const venueSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: venueTypeSchema,
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  description: z.string().optional(),
  tags: z.record(z.string()).optional()
});

export const locationSchema = z.object({
  query: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  displayName: z.string()
});

export const venueSearchRequestSchema = z.object({
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }),
  venueTypes: z.array(venueTypeSchema)
});

export const locationSearchRequestSchema = z.object({
  query: z.string().min(1)
});

// User schema for authentication
export const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(), 
  profileImageUrl: z.string().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export const upsertUserSchema = userSchema.omit({ createdAt: true, updatedAt: true });

// User favorite venues schema
export const userFavoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  venueId: z.string(),
  venueName: z.string(),
  venueType: venueTypeSchema,
  venueLat: z.number(),
  venueLng: z.number(),
  createdAt: z.date().default(() => new Date())
});

export const insertUserFavoriteSchema = userFavoriteSchema.omit({ id: true, createdAt: true });

// User visited venues schema  
export const userVisitedSchema = z.object({
  id: z.string(),
  userId: z.string(),
  venueId: z.string(),
  venueName: z.string(),
  venueType: venueTypeSchema,
  venueLat: z.number(),
  venueLng: z.number(),
  visitedAt: z.date().default(() => new Date())
});

export const insertUserVisitedSchema = userVisitedSchema.omit({ id: true, visitedAt: true });

export type VenueType = z.infer<typeof venueTypeSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type Location = z.infer<typeof locationSchema>;
export type VenueSearchRequest = z.infer<typeof venueSearchRequestSchema>;
export type LocationSearchRequest = z.infer<typeof locationSearchRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type UserFavorite = z.infer<typeof userFavoriteSchema>;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserVisited = z.infer<typeof userVisitedSchema>;
export type InsertUserVisited = z.infer<typeof insertUserVisitedSchema>;

// Database tables
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// Export types for Drizzle tables
export type DbUser = typeof users.$inferSelect;
export type DbUpsertUser = typeof users.$inferInsert;
export type DbUserFavorite = typeof userFavorites.$inferSelect;
export type DbInsertUserFavorite = typeof userFavorites.$inferInsert;
export type DbUserVisited = typeof userVisited.$inferSelect;
export type DbInsertUserVisited = typeof userVisited.$inferInsert;

export const VENUE_TYPE_CONFIG = {
  playground: { 
    query: 'leisure=playground', 
    icon: 'users', 
    color: '#34C759',
    name: 'Playgrounds'
  },
  park: { 
    query: 'leisure=park', 
    icon: 'trees', 
    color: '#34C759',
    name: 'Parks'
  },
  museum: { 
    query: 'tourism=museum', 
    icon: 'building', 
    color: '#AF52DE',
    name: 'Museums'
  },
  gallery: { 
    query: 'tourism=gallery', 
    icon: 'palette', 
    color: '#FF9500',
    name: 'Art Galleries'
  },
  science_center: { 
    query: 'amenity=science_centre', 
    icon: 'atom', 
    color: '#007AFF',
    name: 'Science Centers'
  },
  planetarium: { 
    query: 'amenity=planetarium', 
    icon: 'globe', 
    color: '#1C1C1E',
    name: 'Planetariums'
  },
  swimming_pool: { 
    query: 'leisure=swimming_pool', 
    icon: 'waves', 
    color: '#007AFF',
    name: 'Swimming Pools'
  }
} as const;
