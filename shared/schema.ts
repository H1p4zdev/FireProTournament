import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  nickname: text("nickname").notNull(),
  freeFireUID: text("free_fire_uid").notNull(),
  division: text("division"),
  avatarUrl: text("avatar_url"),
  balance: integer("balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  balance: true,
});

// Tournaments schema
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  entryFee: integer("entry_fee").default(0).notNull(),
  prizePool: integer("prize_pool").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  maxTeams: integer("max_teams").notNull(),
  registeredTeams: integer("registered_teams").default(0).notNull(),
  tournamentType: text("tournament_type").notNull(), // solo, duo, squad
  status: text("status").notNull(), // upcoming, live, completed
  createdBy: integer("created_by").notNull(), // user id of creator
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  registeredTeams: true,
  createdAt: true,
});

// Teams schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captain_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),
  teamType: text("team_type").notNull(), // solo, duo, squad
  members: jsonb("members").notNull(), // array of user ids
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, tournament_entry, tournament_winning
  description: text("description"),
  status: text("status").notNull(), // pending, completed, failed
  paymentMethod: text("payment_method"), // bKash, Nagad, Rocket, SureCash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Leaderboard entries
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  totalTournaments: integer("total_tournaments").default(0).notNull(),
  weeklyPoints: integer("weekly_points").default(0).notNull(),
  monthlyPoints: integer("monthly_points").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
  updatedAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
