import {
  users,
  userFavorites,
  userVisited,
} from "@shared/schema";
import type {
  DbUser as User,
  DbUpsertUser as UpsertUser,
  DbUserFavorite as UserFavorite,
  DbInsertUserFavorite as InsertUserFavorite,
  DbUserVisited as UserVisited,
  DbInsertUserVisited as InsertUserVisited,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Favorites operations
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeUserFavorite(userId: string, venueId: string): Promise<void>;
  isUserFavorite(userId: string, venueId: string): Promise<boolean>;
  
  // Visited operations
  getUserVisited(userId: string): Promise<UserVisited[]>;
  addUserVisited(visited: InsertUserVisited): Promise<UserVisited>;
  removeUserVisited(userId: string, venueId: string): Promise<void>;
  isUserVisited(userId: string, venueId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Favorites operations
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return await db.select().from(userFavorites).where(eq(userFavorites.userId, userId));
  }

  async addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const [result] = await db
      .insert(userFavorites)
      .values(favorite)
      .returning();
    return result;
  }

  async removeUserFavorite(userId: string, venueId: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.venueId, venueId)));
  }

  async isUserFavorite(userId: string, venueId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.venueId, venueId)))
      .limit(1);
    return !!result;
  }

  // Visited operations
  async getUserVisited(userId: string): Promise<UserVisited[]> {
    return await db.select().from(userVisited).where(eq(userVisited.userId, userId));
  }

  async addUserVisited(visited: InsertUserVisited): Promise<UserVisited> {
    const [result] = await db
      .insert(userVisited)
      .values(visited)
      .returning();
    return result;
  }

  async removeUserVisited(userId: string, venueId: string): Promise<void> {
    await db
      .delete(userVisited)
      .where(and(eq(userVisited.userId, userId), eq(userVisited.venueId, venueId)));
  }

  async isUserVisited(userId: string, venueId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(userVisited)
      .where(and(eq(userVisited.userId, userId), eq(userVisited.venueId, venueId)))
      .limit(1);
    return !!result;
  }
}

export const storage = new DatabaseStorage();
